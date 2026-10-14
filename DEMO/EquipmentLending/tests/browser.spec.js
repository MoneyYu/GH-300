import { expect, test } from './browser-fixture.js';

test('shows seeded equipment and the browser IANA time zone', async ({ page, app }) => {
  await page.goto(app.baseUrl);

  await expect(page.getByRole('heading', { name: '團隊設備借用' })).toBeVisible();
  await expect(page.locator('#time-zone')).not.toHaveText('正在讀取…');
  await expect(page.getByText('1', { exact: true }).first()).toBeVisible();
  await expect(
    page.getByRole('article').filter({ hasText: 'EQ-003' }).getByText('逾期'),
  ).toBeVisible();
  await expect(page.getByRole('article').filter({ hasText: 'EQ-001' })).toContainText('可借');
});

test('borrows, returns, reborrows and keeps the returned loan in history', async ({ page, app }) => {
  await page.goto(app.baseUrl);
  const camera = page.getByRole('article').filter({ hasText: 'EQ-001' });

  await page.getByLabel('借用人代號（EQ-001）').fill('DEMO-A');
  await camera.getByRole('button', { name: '借用設備' }).click();
  await expect(page.getByRole('status')).toContainText('已借給 DEMO-A');
  await expect(camera).toContainText('借用中');
  await expect(camera).toContainText('借用人代號：DEMO-A');

  await camera.getByRole('button', { name: '歸還設備' }).click();
  await expect(page.getByRole('status')).toContainText('已歸還');
  await expect(page.getByRole('row').filter({ hasText: 'DEMO-A' })).toContainText('EQ-001');

  await page.getByLabel('借用人代號（EQ-001）').fill('DEMO-B');
  await page.getByRole('article').filter({ hasText: 'EQ-001' }).getByRole('button', { name: '借用設備' }).click();
  await expect(page.getByRole('status')).toContainText('已借給 DEMO-B');
  await expect(page.locator('#history-count')).toHaveText('1 筆已歸還');

  const response = await page.request.get(`${app.baseUrl}/api/state`);
  const report = await response.json();
  assertReport(report);
});

test('a stale second browser sees the server conflict and refreshes its state', async ({ browser, app }) => {
  const firstContext = await browser.newContext();
  const secondContext = await browser.newContext();
  try {
    const firstPage = await firstContext.newPage();
    const secondPage = await secondContext.newPage();
    await Promise.all([firstPage.goto(app.baseUrl), secondPage.goto(app.baseUrl)]);

    await firstPage.getByLabel('借用人代號（EQ-002）').fill('DEMO-A');
    await firstPage.getByRole('article').filter({ hasText: 'EQ-002' })
      .getByRole('button', { name: '借用設備' }).click();
    await expect(firstPage.getByRole('status')).toContainText('已借給 DEMO-A');

    await secondPage.getByLabel('借用人代號（EQ-002）').fill('DEMO-B');
    await secondPage.getByRole('article').filter({ hasText: 'EQ-002' })
      .getByRole('button', { name: '借用設備' }).click();
    await expect(secondPage.getByRole('status')).toContainText('借用未完成');
    await expect(secondPage.getByRole('status')).toContainText('設備目前已有未歸還的借用紀錄');
    await expect(secondPage.getByRole('article').filter({ hasText: 'EQ-002' })).toContainText('DEMO-A');
    await expect(secondPage.getByLabel('借用人代號（EQ-002）')).toHaveValue('DEMO-B');
    await expect(secondPage.getByRole('article').filter({ hasText: 'EQ-002' })
      .getByRole('button', { name: '目前不可借用' })).toBeDisabled();
  } finally {
    await firstContext.close();
    await secondContext.close();
  }
});

test('persists the loan and return history after closing and restarting the server', async ({ page, app }) => {
  await page.goto(app.baseUrl);
  await page.getByLabel('借用人代號（EQ-001）').fill('DEMO-A');
  await page.getByRole('article').filter({ hasText: 'EQ-001' })
    .getByRole('button', { name: '借用設備' }).click();
  await expect(page.getByRole('status')).toContainText('已借給 DEMO-A');
  await page.getByRole('article').filter({ hasText: 'EQ-001' })
    .getByRole('button', { name: '歸還設備' }).click();
  await expect(page.locator('#history-count')).toHaveText('1 筆已歸還');

  await app.restart();
  await page.goto(app.baseUrl);
  await expect(page.locator('#history-count')).toHaveText('1 筆已歸還');
  await expect(page.getByRole('row').filter({ hasText: 'DEMO-A' })).toContainText('EQ-001');
  await expect(page.getByRole('article').filter({ hasText: 'EQ-001' })).toContainText('可借');
});

test('formats the same UTC instants with each browser zone and its DST offset', async ({ browser, app }) => {
  const expected = {
    'America/Los_Angeles': [
      '08/03/2026, 01:30 GMT-08:00',
      '09/03/2026, 02:30 GMT-07:00',
    ],
    'Asia/Taipei': [
      '08/03/2026, 17:30 GMT+08:00',
      '09/03/2026, 17:30 GMT+08:00',
    ],
  };
  const reports = [];
  for (const [timeZone, expectedInstants] of Object.entries(expected)) {
    const context = await browser.newContext({ timezoneId: timeZone });
    try {
      const page = await context.newPage();
      await page.goto(app.baseUrl);
      await expect(page.locator('#time-zone')).toHaveText(timeZone);
      const formatted = await page.evaluate(async () => {
        const { formatInstantInTimeZone } = await import('/time.js');
        return [
          formatInstantInTimeZone('2026-03-08T09:30:00.000Z', Intl.DateTimeFormat().resolvedOptions().timeZone),
          formatInstantInTimeZone('2026-03-09T09:30:00.000Z', Intl.DateTimeFormat().resolvedOptions().timeZone),
        ];
      });
      expect(formatted).toEqual(expectedInstants);
      reports.push(await page.evaluate(async () => (await fetch('/api/state')).json()));
    } finally {
      await context.close();
    }
  }
  expect(reports[0].summary).toEqual(reports[1].summary);
  expect(reports[0].equipment.map(({ equipmentId, status }) => [equipmentId, status]))
    .toEqual(reports[1].equipment.map(({ equipmentId, status }) => [equipmentId, status]));
});

test('applies the requested dark theme before the page renders', async ({ page, app }) => {
  await page.goto(`${app.baseUrl}/?scoutTheme=dark`);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const background = await page.locator('body').evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(background).toBe('rgb(61, 59, 58)');
});

function assertReport(report) {
  expect(report.loans).toHaveLength(3);
  expect(report.loans.filter((loan) => loan.returnedAt !== null)).toHaveLength(1);
  expect(report.loans.find((loan) => loan.equipmentId === 'EQ-001' && loan.borrowerId === 'DEMO-B')?.status)
    .toBe('borrowed');
  expect(report.summary).toEqual({ available: 1, borrowed: 1, overdue: 1 });
}
