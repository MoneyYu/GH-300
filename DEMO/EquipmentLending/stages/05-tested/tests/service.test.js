import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getLoanStatus } from '../src/core.js';
import { createLendingService } from '../src/service.js';

test('service retains return history and permits a later loan', () => {
  let nowMs = Date.parse('2026-01-15T00:00:00.000Z');
  const service = createLendingService(() => nowMs);
  const first = service.borrow({ equipmentId: 'EQ-001', borrowerId: 'DEMO-A' });
  assert.throws(
    () => service.borrow({ equipmentId: 'EQ-001', borrowerId: 'DEMO-B' }),
    { code: 'EQUIPMENT_UNAVAILABLE' },
  );
  nowMs = first.dueAtMs;
  assert.equal(getLoanStatus(service.report()[0], nowMs), 'overdue');
  service.returnLoan(first.loanId);
  assert.equal(getLoanStatus(service.report()[0], nowMs), 'returned');
  assert.equal(service.borrow({ equipmentId: 'EQ-001', borrowerId: 'DEMO-B' }).status, 'borrowed');
  assert.equal(service.report().length, 2);
});
