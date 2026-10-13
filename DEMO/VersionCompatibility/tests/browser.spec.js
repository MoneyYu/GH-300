import { test as base, expect } from '@playwright/test';
import { createServer } from '../src/server.js';

// 每個 worker 以自動分配的 port 啟動自己的 server，結束時只關閉這一個。
const test = base.extend({
  appUrl: [
    async ({}, use) => {
      const server = createServer();
      await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
      const { address, port } = server.address();
      try {
        await use(`http://${address}:${port}`);
      } finally {
        server.closeAllConnections();
        await new Promise((resolve) => server.close(resolve));
      }
    },
    { scope: 'worker' },
  ],
});

async function submitCheck(page, version, range) {
  await page.getByLabel('版本 version').fill(version);
  await page.getByLabel('範圍 range').fill(range);
  await page.getByRole('button', { name: '檢查', exact: true }).click();
}

test.beforeEach(async ({ page, appUrl }) => {
  await page.goto(appUrl);
});

test('shows the 1.10.0 regression as 符合 and the reverse as 不符合', async ({ page }) => {
  await expect(page.getByRole('heading', { name: '版本範圍檢查' })).toBeVisible();
  await expect(page.locator('#result')).toHaveText('尚未檢查。');

  await submitCheck(page, '1.10.0', '>=1.9.0');
  await expect(page.locator('#result')).toHaveAttribute('data-state', 'match');
  await expect(page.locator('#result')).toContainText('符合');
  await expect(page.locator('#result')).toContainText('版本 1.10.0 符合範圍 >=1.9.0');
  await expect(page.locator('#error')).toBeHidden();

  await submitCheck(page, '1.9.0', '>=1.10.0');
  await expect(page.locator('#result')).toHaveAttribute('data-state', 'mismatch');
  await expect(page.locator('#result')).toContainText('版本 1.9.0 不符合範圍 >=1.10.0');
});

test('caret and tilde boundaries match the documented semantics', async ({ page }) => {
  const cases = [
    ['1.3.0', '^1.2.3', 'match', '版本 1.3.0 符合範圍 ^1.2.3'],
    ['2.0.0', '^1.2.3', 'mismatch', '版本 2.0.0 不符合範圍 ^1.2.3'],
    ['1.2.9', '~1.2.3', 'match', '版本 1.2.9 符合範圍 ~1.2.3'],
    ['1.3.0', '~1.2.3', 'mismatch', '版本 1.3.0 不符合範圍 ~1.2.3'],
  ];
  for (const [version, range, state, text] of cases) {
    await submitCheck(page, version, range);
    await expect(page.locator('#result')).toHaveAttribute('data-state', state);
    await expect(page.locator('#result')).toContainText(text);
  }
});

test('invalid input is shown as 輸入錯誤, never as 不符合', async ({ page }) => {
  await submitCheck(page, '1.02.3', '>=1.0.0');
  await expect(page.locator('#error')).toBeVisible();
  await expect(page.locator('#error')).toHaveAttribute('data-state', 'input-error');
  await expect(page.locator('#error')).toContainText('輸入錯誤');
  await expect(page.locator('#error')).toContainText('INVALID_VERSION');
  await expect(page.locator('#result')).toBeHidden();
  await expect(page.getByText('不符合')).toHaveCount(0);

  await submitCheck(page, '1.2.3', '1.x');
  await expect(page.locator('#error')).toContainText('INVALID_RANGE');

  await submitCheck(page, '', '');
  await expect(page.locator('#error')).toContainText('INVALID_VERSION');

  await submitCheck(page, '1.10.0', '>=1.9.0');
  await expect(page.locator('#error')).toBeHidden();
  await expect(page.locator('#result')).toHaveAttribute('data-state', 'match');
});

test('a blocked API shows 網路錯誤 and the form recovers', async ({ page }) => {
  await page.route('**/api/check*', (route) => route.abort('connectionrefused'));

  await submitCheck(page, '1.10.0', '>=1.9.0');
  await expect(page.locator('#error')).toHaveAttribute('data-state', 'network-error');
  await expect(page.locator('#error')).toContainText('網路錯誤');
  await expect(page.locator('#result')).toBeHidden();
  await expect(page.getByText('不符合')).toHaveCount(0);
  await expect(page.getByRole('button', { name: '檢查', exact: true })).toBeEnabled();

  await page.unroute('**/api/check*');
  await page.getByRole('button', { name: '檢查', exact: true }).click();
  await expect(page.locator('#result')).toHaveAttribute('data-state', 'match');
  await expect(page.locator('#result')).toContainText('版本 1.10.0 符合範圍 >=1.9.0');
  await expect(page.locator('#error')).toBeHidden();
});

test('an unexpected server response is treated as 網路錯誤 and recoverable', async ({ page }) => {
  await page.route('**/api/check*', (route) =>
    route.fulfill({ status: 500, contentType: 'text/plain', body: 'boom' }),
  );

  await submitCheck(page, '1.10.0', '>=1.9.0');
  await expect(page.locator('#error')).toHaveAttribute('data-state', 'network-error');
  await expect(page.locator('#error')).toContainText('HTTP 500');
  await expect(page.getByRole('button', { name: '檢查', exact: true })).toBeEnabled();
});

test('editing an input clears the previous outcome', async ({ page }) => {
  await submitCheck(page, '1.10.0', '>=1.9.0');
  await expect(page.locator('#result')).toHaveAttribute('data-state', 'match');

  await page.getByLabel('範圍 range').fill('>=1.11.0');
  await expect(page.locator('#result')).toHaveAttribute('data-state', 'idle');
  await expect(page.locator('#result')).toHaveText('尚未檢查。');

  await submitCheck(page, '1.02.3', '>=1.0.0');
  await expect(page.locator('#error')).toBeVisible();
  await page.getByLabel('版本 version').fill('1.2.3');
  await expect(page.locator('#error')).toBeHidden();
});

test('disables the button while pending and ignores a stale response after editing', async ({ page }) => {
  let release;
  const gate = new Promise((resolve) => (release = resolve));
  await page.route('**/api/check*', async (route) => {
    await gate;
    await route.continue();
  });

  await submitCheck(page, '1.10.0', '>=1.9.0');
  const button = page.getByRole('button', { name: '檢查中…' });
  await expect(button).toBeDisabled();
  await expect(page.locator('#check-form')).toHaveAttribute('aria-busy', 'true');

  await page.getByLabel('範圍 range').fill('>=1.11.0');
  await expect(page.getByRole('button', { name: '檢查', exact: true })).toBeEnabled();
  release();

  await page.waitForTimeout(300);
  await expect(page.locator('#result')).toHaveText('尚未檢查。');
  await expect(page.locator('#error')).toBeHidden();
});

test('example buttons fill the inputs and show the result', async ({ page }) => {
  await page.getByRole('button', { name: '1.10.0 >=1.9.0' }).click();
  await expect(page.getByLabel('版本 version')).toHaveValue('1.10.0');
  await expect(page.getByLabel('範圍 range')).toHaveValue('>=1.9.0');
  await expect(page.locator('#result')).toContainText('版本 1.10.0 符合範圍 >=1.9.0');

  await page.getByRole('button', { name: /caret/ }).click();
  await expect(page.getByLabel('範圍 range')).toHaveValue('^1.2.3');
  await expect(page.locator('#result')).toContainText('版本 1.3.0 符合範圍 ^1.2.3');

  await page.getByRole('button', { name: /tilde/ }).click();
  await expect(page.getByLabel('範圍 range')).toHaveValue('~1.2.3');
  await expect(page.locator('#result')).toContainText('版本 1.3.0 不符合範圍 ~1.2.3');
});

test('clicking an example clears the old result while its own request is pending', async ({ page }) => {
  await page.getByRole('button', { name: /caret/ }).click();
  await expect(page.locator('#result')).toContainText('版本 1.3.0 符合範圍 ^1.2.3');

  let release;
  const gate = new Promise((resolve) => (release = resolve));
  await page.route('**/api/check*', async (route) => {
    await gate;
    await route.continue();
  });

  await page.getByRole('button', { name: /tilde/ }).click();
  await expect(page.getByRole('button', { name: '檢查中…' })).toBeDisabled();
  await expect(page.getByLabel('範圍 range')).toHaveValue('~1.2.3');
  await expect(page.locator('#result')).toHaveAttribute('data-state', 'idle');
  await expect(page.locator('#result')).toHaveText('尚未檢查。');
  await expect(page.locator('#result')).not.toContainText('^1.2.3');
  await expect(page.locator('#error')).toBeHidden();

  release();
  await expect(page.locator('#result')).toHaveAttribute('data-state', 'mismatch');
  await expect(page.locator('#result')).toContainText('版本 1.3.0 不符合範圍 ~1.2.3');
  await expect(page.getByRole('button', { name: '檢查', exact: true })).toBeEnabled();
});

test('sends URL-encoded parameters and supports Enter to submit', async ({ page }) => {
  const requested = page.waitForRequest('**/api/check*');
  await page.getByLabel('版本 version').fill('1.2.4-beta.1+build.5');
  await page.getByLabel('範圍 range').fill('>=1.2.3');
  await page.getByLabel('範圍 range').press('Enter');

  const url = new URL((await requested).url());
  expect(url.searchParams.get('version')).toBe('1.2.4-beta.1+build.5');
  expect(url.searchParams.get('range')).toBe('>=1.2.3');
  expect(url.search).not.toContain('+build');
  await expect(page.locator('#result')).toContainText('版本 1.2.4-beta.1+build.5');
});

test('theme follows scoutTheme and the color scheme preference', async ({ page, appUrl }) => {
  await page.goto(`${appUrl}/?scoutTheme=dark`);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto(appUrl);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto(appUrl);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});
