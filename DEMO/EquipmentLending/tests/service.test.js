import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { test } from 'node:test';
import { initializeDatabase, openDatabase } from '../src/database.js';
import { createLendingService } from '../src/service.js';

const initialTime = Date.parse('2026-01-15T00:00:00.000Z');

function memoryService({ nowMs = initialTime, seedDemoLoan = false } = {}) {
  const db = initializeDatabase(':memory:', { clock: () => nowMs, seedDemoLoan });
  return { db, service: createLendingService({ db, clock: () => nowMs }) };
}

test('a loan survives closing and reopening the same SQLite file', () => {
  const directory = join(process.cwd(), '.test-data');
  mkdirSync(directory, { recursive: true });
  const databasePath = join(directory, `persistence-${process.pid}-${randomUUID()}.sqlite`);
  let db = initializeDatabase(databasePath, { clock: () => initialTime, seedDemoLoan: false });
  const service = createLendingService({ db, clock: () => initialTime });

  const created = service.borrow({ equipmentId: 'EQ-001', borrowerId: 'DEMO-A' });
  db.close();

  db = openDatabase(databasePath);
  const reportDb = openDatabase(databasePath, { readOnly: true });
  const reopened = createLendingService({ db, reportDb, clock: () => initialTime });
  assert.equal(reopened.report().loans.length, 1);
  assert.deepEqual(reopened.report().loans[0], created);
  reportDb.close();
  db.close();
});

test('returning a loan retains its history and makes the equipment available again', () => {
  const { db, service } = memoryService();
  try {
    const first = service.borrow({ equipmentId: 'EQ-001', borrowerId: 'DEMO-A', days: 1 });
    const returned = service.returnLoan(first.loanId);
    const second = service.borrow({ equipmentId: 'EQ-001', borrowerId: 'DEMO-B' });
    const report = service.report();

    assert.equal(returned.status, 'returned');
    assert.equal(second.loanId, 2);
    assert.equal(report.loans.length, 2);
    assert.equal(report.loans[0].status, 'returned');
    assert.equal(report.loans[1].status, 'borrowed');
    assert.equal(report.equipment[0].activeLoanId, 2);
  } finally {
    db.close();
  }
});

test('an active loan blocks double borrowing and a second return', () => {
  const { db, service } = memoryService();
  try {
    const loan = service.borrow({ equipmentId: 'EQ-001', borrowerId: 'DEMO-A' });
    assert.throws(
      () => service.borrow({ equipmentId: 'EQ-001', borrowerId: 'DEMO-B' }),
      (error) => error.code === 'EQUIPMENT_UNAVAILABLE',
    );
    service.returnLoan(loan.loanId);
    assert.throws(
      () => service.returnLoan(loan.loanId),
      (error) => error.code === 'LOAN_ALREADY_RETURNED',
    );
    assert.equal(service.report().loans.length, 1);
  } finally {
    db.close();
  }
});

test('SQLite uniqueness prevents two active loans even outside service validation', () => {
  const { db } = memoryService();
  try {
    const insert = db.prepare(
      `INSERT INTO loans
        (equipment_id, borrower_id, borrowed_at_ms, due_at_ms, returned_at_ms)
       VALUES (?, ?, ?, ?, NULL)`,
    );
    insert.run('EQ-001', 'DEMO-A', initialTime, initialTime + 86_400_000);
    assert.throws(
      () => insert.run('EQ-001', 'DEMO-B', initialTime, initialTime + 86_400_000),
      (error) =>
        error.code === 'ERR_SQLITE_ERROR' &&
        error.message === 'UNIQUE constraint failed: loans.equipment_id',
    );
  } finally {
    db.close();
  }
});

test('a locked database returns an explicit retryable service error', () => {
  const directory = join(process.cwd(), '.test-data');
  mkdirSync(directory, { recursive: true });
  const databasePath = join(directory, `locked-${process.pid}-${randomUUID()}.sqlite`);
  const lockDb = initializeDatabase(databasePath, { clock: () => initialTime, seedDemoLoan: false });
  const serviceDb = openDatabase(databasePath);
  const service = createLendingService({ db: serviceDb, clock: () => initialTime });
  try {
    lockDb.exec('BEGIN IMMEDIATE');
    assert.throws(
      () => service.borrow({ equipmentId: 'EQ-001', borrowerId: 'DEMO-A' }),
      (error) => error.code === 'DATABASE_BUSY',
    );
  } finally {
    lockDb.exec('ROLLBACK');
    serviceDb.close();
    lockDb.close();
  }
});

test('the overdue seed is created once from the injected clock', () => {
  const nowMs = initialTime;
  const { db, service } = memoryService({ nowMs, seedDemoLoan: true });
  try {
    const report = service.report();
    assert.equal(report.equipment[2].equipmentId, 'EQ-003');
    assert.equal(report.equipment[2].status, 'overdue');
    assert.equal(report.summary.overdue, 1);
    assert.equal(report.loans[0].borrowedAt, '2026-01-07T00:00:00.000Z');
    assert.equal(report.loans[0].dueAt, '2026-01-14T00:00:00.000Z');
  } finally {
    db.close();
  }
});

test('an initialized database cannot be reinitialized or overwritten', () => {
  const directory = join(process.cwd(), '.test-data');
  mkdirSync(directory, { recursive: true });
  const filePath = join(directory, `preserve-${process.pid}-${randomUUID()}.txt`);
  writeFileSync(filePath, 'keep existing data');
  const before = readFileSync(filePath);
  assert.throws(() => initializeDatabase(filePath), (error) => error.code === 'DATABASE_EXISTS');
  assert.deepEqual(readFileSync(filePath), before);
});

test('opening a missing database does not create it', () => {
  const directory = join(process.cwd(), '.test-data');
  mkdirSync(directory, { recursive: true });
  const filePath = join(directory, `missing-${process.pid}-${randomUUID()}.sqlite`);
  assert.throws(() => openDatabase(filePath), (error) => error.code === 'DATABASE_NOT_FOUND');
});

test('read-only report queries do not change equipment or loan rows', () => {
  const { db, service } = memoryService();
  const equipmentBefore = db.prepare('SELECT COUNT(*) AS count FROM equipment').get().count;
  const loansBefore = db.prepare('SELECT COUNT(*) AS count FROM loans').get().count;
  try {
    service.report();
    assert.equal(db.prepare('SELECT COUNT(*) AS count FROM equipment').get().count, equipmentBefore);
    assert.equal(db.prepare('SELECT COUNT(*) AS count FROM loans').get().count, loansBefore);
  } finally {
    db.close();
  }
});
