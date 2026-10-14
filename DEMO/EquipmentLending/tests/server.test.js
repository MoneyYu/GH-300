import assert from 'node:assert/strict';
import { test } from 'node:test';
import { initializeDatabase } from '../src/database.js';
import { createLendingService } from '../src/service.js';
import { createServer } from '../src/server.js';

const initialTime = Date.parse('2026-01-15T00:00:00.000Z');

async function startApp(t) {
  const db = initializeDatabase(':memory:', { clock: () => initialTime, seedDemoLoan: false });
  const server = createServer({
    service: createLendingService({ db, clock: () => initialTime }),
    logError: (error) => t.diagnostic(error),
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    db.close();
  });
  return { baseUrl };
}

async function post(baseUrl, path, body, origin = baseUrl, contentType = 'application/json') {
  return fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': contentType,
      Origin: origin,
    },
    body,
  });
}

test('HTTP borrowing, double-borrow conflict, return and history use one service', async (t) => {
  const { baseUrl } = await startApp(t);
  const initial = await fetch(`${baseUrl}/api/state`);
  assert.equal(initial.status, 200);
  assert.deepEqual((await initial.json()).summary, { available: 3, borrowed: 0, overdue: 0 });

  const borrowed = await post(
    baseUrl,
    '/api/loans',
    JSON.stringify({ equipmentId: 'EQ-001', borrowerId: 'DEMO-A' }),
  );
  assert.equal(borrowed.status, 201);
  const loan = await borrowed.json();
  assert.equal(loan.dueAt, '2026-01-22T00:00:00.000Z');
  assert.equal(loan.status, 'borrowed');

  const conflict = await post(
    baseUrl,
    '/api/loans',
    JSON.stringify({ equipmentId: 'EQ-001', borrowerId: 'DEMO-B' }),
  );
  assert.equal(conflict.status, 409);
  assert.equal((await conflict.json()).error.code, 'EQUIPMENT_UNAVAILABLE');

  const returned = await post(baseUrl, `/api/loans/${loan.loanId}/return`, '{}');
  assert.equal(returned.status, 200);
  assert.equal((await returned.json()).status, 'returned');

  const duplicateReturn = await post(baseUrl, `/api/loans/${loan.loanId}/return`, '{}');
  assert.equal(duplicateReturn.status, 409);
  assert.equal((await duplicateReturn.json()).error.code, 'LOAN_ALREADY_RETURNED');

  const state = await fetch(`${baseUrl}/api/state`);
  const report = await state.json();
  assert.equal(report.loans.length, 1);
  assert.equal(report.equipment[0].status, 'available');
});

test('HTTP rejects malformed requests and maps missing resources and methods', async (t) => {
  const { baseUrl } = await startApp(t);

  const malformed = await post(baseUrl, '/api/loans', '{');
  assert.equal(malformed.status, 400);
  assert.equal((await malformed.json()).error.code, 'INVALID_JSON');

  const invalidEquipmentId = await post(
    baseUrl,
    '/api/loans',
    '{}',
  );
  assert.equal(invalidEquipmentId.status, 400);
  assert.equal((await invalidEquipmentId.json()).error.code, 'INVALID_EQUIPMENT_ID');

  const wrongType = await post(baseUrl, '/api/loans', '{}', baseUrl, 'text/plain');
  assert.equal(wrongType.status, 415);

  const unknownField = await post(
    baseUrl,
    '/api/loans',
    JSON.stringify({ equipmentId: 'EQ-001', borrowerId: 'DEMO-A', admin: true }),
  );
  assert.equal(unknownField.status, 400);
  assert.equal((await unknownField.json()).error.code, 'INVALID_REQUEST');

  const unknownEquipment = await post(
    baseUrl,
    '/api/loans',
    JSON.stringify({ equipmentId: 'EQ-999', borrowerId: 'DEMO-A' }),
  );
  assert.equal(unknownEquipment.status, 404);
  assert.equal((await unknownEquipment.json()).error.code, 'EQUIPMENT_NOT_FOUND');

  const missingLoan = await post(baseUrl, '/api/loans/999/return', '{}');
  assert.equal(missingLoan.status, 404);
  assert.equal((await missingLoan.json()).error.code, 'LOAN_NOT_FOUND');

  const oversized = await post(
    baseUrl,
    '/api/loans',
    JSON.stringify({ equipmentId: 'EQ-001', borrowerId: 'DEMO-A', extra: 'x'.repeat(9000) }),
  );
  assert.equal(oversized.status, 413);

  const unsupportedMethod = await fetch(`${baseUrl}/api/state`, { method: 'POST' });
  assert.equal(unsupportedMethod.status, 405);
  assert.equal(unsupportedMethod.headers.get('allow'), 'GET');

  const missing = await fetch(`${baseUrl}/missing`);
  assert.equal(missing.status, 404);
  assert.equal((await missing.json()).error.code, 'NOT_FOUND');
});

test('logs unexpected service errors and returns only a generic HTTP 500', async (t) => {
  const expectedError = new Error('internal diagnostic detail');
  const loggedErrors = [];
  const server = createServer({
    service: {
      borrow() {},
      returnLoan() {},
      report() { throw expectedError; },
    },
    logError: (error) => loggedErrors.push(error),
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  t.after(async () => new Promise((resolve) => server.close(resolve)));

  const response = await fetch(`${baseUrl}/api/state`);
  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), {
    error: { code: 'INTERNAL_ERROR', message: '伺服器發生未預期的錯誤。' },
  });
  assert.deepEqual(loggedErrors, [expectedError]);
});

test('maps read-only report database busy errors to retryable HTTP 503', async (t) => {
  const db = initializeDatabase(':memory:', { clock: () => initialTime, seedDemoLoan: false });
  const busyError = Object.assign(new Error('database is locked'), {
    code: 'ERR_SQLITE_ERROR',
    errcode: 5,
  });
  const service = createLendingService({
    db,
    reportDb: { prepare() { throw busyError; } },
    clock: () => initialTime,
  });
  const server = createServer({ service, logError: (error) => t.diagnostic(error) });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    db.close();
  });

  const response = await fetch(`${baseUrl}/api/state`);
  assert.equal(response.status, 503);
  assert.equal((await response.json()).error.code, 'DATABASE_BUSY');
});

test('mutating requests require the exact loopback origin and host', async (t) => {
  const { baseUrl } = await startApp(t);
  const externalOrigin = await post(
    baseUrl,
    '/api/loans',
    JSON.stringify({ equipmentId: 'EQ-001', borrowerId: 'DEMO-A' }),
    'https://example.invalid',
  );
  assert.equal(externalOrigin.status, 403);
  assert.equal((await externalOrigin.json()).error.code, 'INVALID_ORIGIN');

  const missingOrigin = await fetch(`${baseUrl}/api/loans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ equipmentId: 'EQ-001', borrowerId: 'DEMO-A' }),
  });
  assert.equal(missingOrigin.status, 403);
});

test('serves only the local application assets with no-store and same-origin headers', async (t) => {
  const { baseUrl } = await startApp(t);
  const health = await fetch(`${baseUrl}/api/health`);
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { status: 'ok' });

  const page = await fetch(baseUrl);
  assert.equal(page.status, 200);
  assert.match(page.headers.get('content-type'), /^text\/html; charset=utf-8$/);
  assert.equal(page.headers.get('cache-control'), 'no-store');
  assert.equal(page.headers.get('x-content-type-options'), 'nosniff');
  const contentSecurityPolicy = page.headers.get('content-security-policy');
  assert.match(contentSecurityPolicy, /default-src 'self'/);
  assert.doesNotMatch(contentSecurityPolicy, /unsafe-inline/);
  const html = await page.text();
  assert.match(html, /id="app"/);
  const [, nonce] = html.match(/<script nonce="([^"]+)">/);
  assert.ok(nonce);
  assert.ok(contentSecurityPolicy.includes(`'nonce-${nonce}'`));

  for (const [path, type] of [
    ['/app.js', /^text\/javascript; charset=utf-8$/],
    ['/time.js', /^text\/javascript; charset=utf-8$/],
    ['/styles.css', /^text\/css; charset=utf-8$/],
  ]) {
    const response = await fetch(`${baseUrl}${path}`);
    assert.equal(response.status, 200, path);
    assert.match(response.headers.get('content-type'), type);
  }
});
