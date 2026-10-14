import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getLoanStatus, LendingError, planBorrow, planReturn } from '../src/core.js';

const equipment = { equipmentId: 'EQ-001', name: '示範相機' };
const nowMs = Date.parse('2026-01-15T00:00:00.000Z');

test('borrowing trims the demo code and calculates an elapsed seven-day deadline', () => {
  assert.deepEqual(
    planBorrow({
      equipment,
      activeLoan: null,
      input: { equipmentId: 'EQ-001', borrowerId: ' DEMO-A ' },
      nowMs,
    }),
    {
      equipmentId: 'EQ-001',
      borrowerId: 'DEMO-A',
      borrowedAtMs: nowMs,
      dueAtMs: Date.parse('2026-01-22T00:00:00.000Z'),
      returnedAtMs: null,
    },
  );
});

test('an active loan blocks another borrower for the same equipment', () => {
  assert.throws(
    () =>
      planBorrow({
        equipment,
        activeLoan: { equipmentId: 'EQ-001', returnedAtMs: null },
        input: { equipmentId: 'EQ-001', borrowerId: 'DEMO-B' },
        nowMs,
      }),
    (error) => error instanceof LendingError && error.code === 'EQUIPMENT_UNAVAILABLE',
  );
});

test('borrower identifiers and loan days reject invalid values', () => {
  for (const borrowerId of ['', 'DEMO A', 'x'.repeat(33)]) {
    assert.throws(
      () => planBorrow({ equipment, activeLoan: null, input: { equipmentId: 'EQ-001', borrowerId }, nowMs }),
      (error) => error instanceof LendingError && error.code === 'INVALID_BORROWER_ID',
    );
  }
  for (const days of [0, 15, 1.5, '7', null]) {
    assert.throws(
      () =>
        planBorrow({
          equipment,
          activeLoan: null,
          input: { equipmentId: 'EQ-001', borrowerId: 'DEMO-A', days },
          nowMs,
        }),
      (error) => error instanceof LendingError && error.code === 'INVALID_DAYS',
    );
  }
});

test('unknown equipment is rejected rather than treated as available', () => {
  assert.throws(
    () =>
      planBorrow({
        equipment: null,
        activeLoan: null,
        input: { equipmentId: 'EQ-999', borrowerId: 'DEMO-A' },
        nowMs,
      }),
    (error) => error instanceof LendingError && error.code === 'EQUIPMENT_NOT_FOUND',
  );
});

test('the exact due instant is overdue, but a returned loan is never overdue', () => {
  const loan = { dueAtMs: nowMs, returnedAtMs: null };
  assert.equal(getLoanStatus({ ...loan, dueAtMs: nowMs + 1 }, nowMs), 'borrowed');
  assert.equal(getLoanStatus(loan, nowMs), 'overdue');
  assert.equal(getLoanStatus({ ...loan, returnedAtMs: nowMs }, nowMs + 1000), 'returned');
});

test('return records one time and rejects returning the same loan twice', () => {
  const loan = { loanId: 1, equipmentId: 'EQ-001', returnedAtMs: null };
  assert.deepEqual(planReturn({ loan, nowMs }), { ...loan, returnedAtMs: nowMs });
  assert.throws(
    () => planReturn({ loan: { ...loan, returnedAtMs: nowMs }, nowMs }),
    (error) => error instanceof LendingError && error.code === 'LOAN_ALREADY_RETURNED',
  );
});
