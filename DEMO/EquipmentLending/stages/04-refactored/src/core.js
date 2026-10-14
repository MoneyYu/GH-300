export class LendingError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

export function planBorrow({ equipment, activeLoan, input, nowMs }) {
  if (!equipment) throw new LendingError('EQUIPMENT_NOT_FOUND');
  if (activeLoan) throw new LendingError('EQUIPMENT_UNAVAILABLE');
  const borrowerId = typeof input?.borrowerId === 'string' ? input.borrowerId.trim() : '';
  if (!/^[A-Za-z0-9_-]{1,32}$/.test(borrowerId)) throw new LendingError('INVALID_BORROWER_ID');
  const days = input.days === undefined ? 7 : input.days;
  if (!Number.isInteger(days) || days < 1 || days > 14) throw new LendingError('INVALID_DAYS');
  return {
    equipmentId: equipment.equipmentId,
    borrowerId,
    borrowedAtMs: nowMs,
    dueAtMs: nowMs + days * 86_400_000,
    returnedAtMs: null,
  };
}

export function planReturn({ loan, nowMs }) {
  if (!loan) throw new LendingError('LOAN_NOT_FOUND');
  if (loan.returnedAtMs !== null) throw new LendingError('LOAN_ALREADY_RETURNED');
  return { ...loan, returnedAtMs: nowMs };
}

export function statusOf(loan, nowMs) {
  if (loan.returnedAtMs !== null) return 'returned';
  return nowMs >= loan.dueAtMs ? 'overdue' : 'borrowed';
}
