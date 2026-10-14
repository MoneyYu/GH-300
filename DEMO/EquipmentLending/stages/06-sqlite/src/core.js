export class LendingError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'LendingError';
    this.code = code;
  }
}

const DAYS_MS = 86_400_000;

function requireInstant(nowMs) {
  if (!Number.isSafeInteger(nowMs) || nowMs < 0) {
    throw new LendingError('INVALID_TIME', '操作時間必須是有效的 UTC 毫秒時間。');
  }
}

export function planBorrow({ equipment, activeLoan, input, nowMs }) {
  requireInstant(nowMs);
  if (!equipment || typeof equipment.equipmentId !== 'string') {
    throw new LendingError('EQUIPMENT_NOT_FOUND', '找不到指定設備。');
  }
  if (activeLoan !== null) {
    throw new LendingError('EQUIPMENT_UNAVAILABLE', '設備目前已有未歸還的借用紀錄。');
  }
  if (!input || input.equipmentId !== equipment.equipmentId) {
    throw new LendingError('EQUIPMENT_NOT_FOUND', '找不到指定設備。');
  }

  const borrowerId = typeof input.borrowerId === 'string' ? input.borrowerId.trim() : '';
  if (!/^[A-Za-z0-9_-]{1,32}$/.test(borrowerId)) {
    throw new LendingError('INVALID_BORROWER_ID', '借用人代號須為 1–32 個英數字、底線或連字號。');
  }
  const days = input.days === undefined ? 7 : input.days;
  if (typeof days !== 'number' || !Number.isInteger(days) || days < 1 || days > 14) {
    throw new LendingError('INVALID_DAYS', '借用天數須為 1–14 的整數。');
  }
  const dueAtMs = nowMs + days * DAYS_MS;
  if (!Number.isSafeInteger(dueAtMs)) {
    throw new LendingError('INVALID_DAYS', '計算出的到期時間超出支援範圍。');
  }

  return {
    equipmentId: equipment.equipmentId,
    borrowerId,
    borrowedAtMs: nowMs,
    dueAtMs,
    returnedAtMs: null,
  };
}

export function planReturn({ loan, nowMs }) {
  requireInstant(nowMs);
  if (!loan) {
    throw new LendingError('LOAN_NOT_FOUND', '找不到指定借用紀錄。');
  }
  if (loan.returnedAtMs !== null) {
    throw new LendingError('LOAN_ALREADY_RETURNED', '此借用紀錄已歸還。');
  }
  if (Number.isSafeInteger(loan.borrowedAtMs) && nowMs < loan.borrowedAtMs) {
    throw new LendingError('INVALID_RETURN_TIME', '歸還時間不可早於借用時間。');
  }
  return { ...loan, returnedAtMs: nowMs };
}

export function getLoanStatus(loan, nowMs) {
  if (!loan || !Number.isSafeInteger(loan.dueAtMs) || !Number.isSafeInteger(nowMs)) {
    throw new TypeError('借用紀錄與目前時間必須包含有效的整數毫秒時間。');
  }
  if (loan.returnedAtMs !== null) {
    return 'returned';
  }
  return nowMs >= loan.dueAtMs ? 'overdue' : 'borrowed';
}
