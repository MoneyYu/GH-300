import assert from 'node:assert/strict';
import { existsSync, mkdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));

function runCli(args) {
  return spawnSync(process.execPath, ['src/cli.js', ...args], {
    cwd: projectRoot,
    encoding: 'utf8',
  });
}

test('scenario permits borrowing an equipment again after its first loan is returned', () => {
  const result = runCli(['scenario', 'fixtures/borrow-return.json', '--json']);

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), {
    asOf: '2026-01-15T00:00:00.000Z',
    results: [
      { action: 'borrow', loanId: 1, status: 'borrowed', dueAt: '2026-01-22T00:00:00.000Z' },
      { action: 'borrow', error: { code: 'EQUIPMENT_UNAVAILABLE' } },
      { action: 'return', loanId: 1, returnedAt: '2026-01-15T00:00:00.000Z', status: 'returned' },
      { action: 'borrow', loanId: 2, status: 'borrowed', dueAt: '2026-01-22T00:00:00.000Z' },
    ],
    equipment: [
      { activeLoanId: 2, equipmentId: 'EQ-001', name: '示範相機', status: 'borrowed' },
      { activeLoanId: null, equipmentId: 'EQ-002', name: '示範投影機', status: 'available' },
      { activeLoanId: null, equipmentId: 'EQ-003', name: '示範筆電', status: 'available' },
    ],
    loans: [
      {
        borrowerId: 'DEMO-A',
        borrowedAt: '2026-01-15T00:00:00.000Z',
        dueAt: '2026-01-22T00:00:00.000Z',
        equipmentId: 'EQ-001',
        loanId: 1,
        returnedAt: '2026-01-15T00:00:00.000Z',
        status: 'returned',
      },
      {
        borrowerId: 'DEMO-B',
        borrowedAt: '2026-01-15T00:00:00.000Z',
        dueAt: '2026-01-22T00:00:00.000Z',
        equipmentId: 'EQ-001',
        loanId: 2,
        returnedAt: null,
        status: 'borrowed',
      },
    ],
    summary: { available: 2, borrowed: 1, overdue: 0 },
  });
});

test('missing scenario files return a machine-readable JSON error without creating a file', () => {
  const directory = join(projectRoot, '.test-data');
  mkdirSync(directory, { recursive: true });
  const missingPath = join(directory, `missing-scenario-${randomUUID()}.json`);
  assert.equal(existsSync(missingPath), false);

  const result = runCli(['scenario', missingPath, '--json']);

  assert.equal(result.status, 1);
  assert.equal(result.stdout, '');
  const jsonLines = result.stderr.split(/\r?\n/).filter((line) => line.startsWith('{"error":'));
  assert.equal(jsonLines.length, 1, result.stderr);
  assert.deepEqual(JSON.parse(jsonLines[0]), {
    error: { code: 'INVALID_SCENARIO', message: '無法讀取情境檔。' },
  });
  assert.doesNotMatch(result.stderr, /未預期的執行錯誤|at runScenario/);
  assert.equal(existsSync(missingPath), false);
});

test('init, borrow, report and return persist state across CLI processes', () => {
  const directory = join(projectRoot, '.test-data');
  mkdirSync(directory, { recursive: true });
  const databasePath = join(directory, `cli-${process.pid}-${randomUUID()}.sqlite`);
  const init = runCli(['init', '--database', databasePath, '--json']);
  assert.equal(init.status, 0, init.stderr);

  const borrowed = runCli(['borrow', 'EQ-001', 'DEMO-A', '--database', databasePath, '--json']);
  assert.equal(borrowed.status, 0, borrowed.stderr);
  const loan = JSON.parse(borrowed.stdout);
  assert.equal(loan.status, 'borrowed');
  assert.equal(Date.parse(loan.dueAt) - Date.parse(loan.borrowedAt), 7 * 86_400_000);

  const report = runCli(['report', '--database', databasePath, '--json']);
  assert.equal(report.status, 0, report.stderr);
  assert.equal(JSON.parse(report.stdout).equipment[0].activeLoanId, loan.loanId);

  const returned = runCli([
    'return',
    String(loan.loanId),
    '--database',
    databasePath,
    '--json',
  ]);
  assert.equal(returned.status, 0, returned.stderr);
  assert.equal(JSON.parse(returned.stdout).status, 'returned');

  const finalReport = runCli(['report', '--database', databasePath, '--json']);
  assert.equal(finalReport.status, 0, finalReport.stderr);
  const state = JSON.parse(finalReport.stdout);
  assert.equal(state.loans.length, 2);
  assert.equal(state.loans.find((item) => item.loanId === loan.loanId).status, 'returned');
  assert.equal(state.equipment[0].status, 'available');
  assert.equal(state.equipment[2].status, 'overdue');
});
