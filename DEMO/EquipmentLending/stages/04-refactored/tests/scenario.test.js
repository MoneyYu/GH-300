import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createLendingService } from '../src/service.js';

test('refactored service shares core rules across borrow, return and reborrow', () => {
  const service = createLendingService();
  const first = service.borrow({ equipmentId: 'EQ-001', borrowerId: 'DEMO-A' });
  assert.throws(
    () => service.borrow({ equipmentId: 'EQ-001', borrowerId: 'DEMO-B' }),
    { code: 'EQUIPMENT_UNAVAILABLE' },
  );
  assert.equal(service.returnLoan(first.loanId).status, 'returned');
  assert.equal(service.borrow({ equipmentId: 'EQ-001', borrowerId: 'DEMO-B' }).status, 'borrowed');
  assert.equal(service.report().length, 2);
});
