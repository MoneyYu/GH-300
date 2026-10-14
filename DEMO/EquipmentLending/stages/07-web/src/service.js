import {
  getLoanStatus,
  LendingError,
  planBorrow,
  planReturn,
  validateEquipmentId,
} from './core.js';
import { toUtcIso } from './time.js';

function toLoan(row) {
  if (!row) {
    return null;
  }
  return {
    loanId: Number(row.id),
    equipmentId: row.equipment_id,
    borrowerId: row.borrower_id,
    borrowedAtMs: Number(row.borrowed_at_ms),
    dueAtMs: Number(row.due_at_ms),
    returnedAtMs: row.returned_at_ms === null ? null : Number(row.returned_at_ms),
  };
}

function asLoanView(loan, nowMs) {
  return {
    loanId: loan.loanId,
    equipmentId: loan.equipmentId,
    borrowerId: loan.borrowerId,
    borrowedAt: toUtcIso(loan.borrowedAtMs),
    dueAt: toUtcIso(loan.dueAtMs),
    returnedAt: loan.returnedAtMs === null ? null : toUtcIso(loan.returnedAtMs),
    status: getLoanStatus(loan, nowMs),
  };
}

function mapStorageError(error) {
  if (error instanceof LendingError) {
    return error;
  }
  if (Number.isInteger(error.errcode) && [5, 6].includes(error.errcode & 0xff)) {
    return new LendingError('DATABASE_BUSY', '資料庫忙碌，請稍後重試。');
  }
  if (
    error.code === 'ERR_SQLITE_ERROR' &&
    error.message === 'UNIQUE constraint failed: loans.equipment_id'
  ) {
    return new LendingError('EQUIPMENT_UNAVAILABLE', '設備目前已有未歸還的借用紀錄。');
  }
  return error;
}

function inWriteTransaction(db, action) {
  try {
    db.exec('BEGIN IMMEDIATE');
    const result = action();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    if (db.isTransaction) {
      db.exec('ROLLBACK');
    }
    throw mapStorageError(error);
  }
}

function requireNow(clock) {
  const nowMs = clock();
  if (!Number.isSafeInteger(nowMs) || nowMs < 0) {
    throw new LendingError('INVALID_TIME', '操作時間必須是有效的 UTC 毫秒時間。');
  }
  return nowMs;
}

function findLoan(db, loanId) {
  return toLoan(db.prepare('SELECT * FROM loans WHERE id = ?').get(loanId));
}

export function createLendingService({ db, reportDb = db, clock = Date.now }) {
  if (!db || !reportDb || typeof clock !== 'function') {
    throw new TypeError('createLendingService 需要 db、reportDb 與 clock。');
  }

  function borrow(input) {
    const nowMs = requireNow(clock);
    const equipmentId = validateEquipmentId(input);
    return inWriteTransaction(db, () => {
      const item = db
        .prepare('SELECT id, name FROM equipment WHERE id = ?')
        .get(equipmentId);
      const activeRow = db
        .prepare('SELECT * FROM loans WHERE equipment_id = ? AND returned_at_ms IS NULL')
        .get(equipmentId);
      const loan = planBorrow({
        equipment: item ? { equipmentId: item.id, name: item.name } : null,
        activeLoan: toLoan(activeRow),
        input,
        nowMs,
      });
      const result = db
        .prepare(
          `INSERT INTO loans
            (equipment_id, borrower_id, borrowed_at_ms, due_at_ms, returned_at_ms)
           VALUES (?, ?, ?, ?, NULL)`,
        )
        .run(loan.equipmentId, loan.borrowerId, loan.borrowedAtMs, loan.dueAtMs);
      loan.loanId = Number(result.lastInsertRowid);
      return asLoanView(loan, nowMs);
    });
  }

  function returnLoan(loanId) {
    const nowMs = requireNow(clock);
    return inWriteTransaction(db, () => {
      const loan = findLoan(db, loanId);
      const updated = planReturn({ loan, nowMs });
      const result = db
        .prepare('UPDATE loans SET returned_at_ms = ? WHERE id = ? AND returned_at_ms IS NULL')
        .run(updated.returnedAtMs, updated.loanId);
      if (result.changes !== 1) {
        throw new LendingError('LOAN_ALREADY_RETURNED', '此借用紀錄已歸還。');
      }
      return asLoanView(updated, nowMs);
    });
  }

  function report() {
    const nowMs = requireNow(clock);
    let equipmentRows;
    let loanRows;
    try {
      equipmentRows = reportDb
        .prepare(
          `SELECT equipment.id, equipment.name, loans.id AS active_loan_id
           FROM equipment
           LEFT JOIN loans
             ON loans.equipment_id = equipment.id AND loans.returned_at_ms IS NULL
           ORDER BY equipment.id`,
        )
        .all();
      loanRows = reportDb.prepare('SELECT * FROM loans ORDER BY id').all();
    } catch (error) {
      throw mapStorageError(error);
    }
    const loans = loanRows.map((row) => asLoanView(toLoan(row), nowMs));
    const activeLoans = new Map(
      loans.filter((loan) => loan.returnedAt === null).map((loan) => [loan.equipmentId, loan]),
    );
    const equipment = equipmentRows.map((row) => {
      const activeLoan = activeLoans.get(row.id);
      return {
        equipmentId: row.id,
        name: row.name,
        status: activeLoan?.status ?? 'available',
        activeLoanId: activeLoan?.loanId ?? null,
      };
    });
    const summary = { available: 0, borrowed: 0, overdue: 0 };
    for (const item of equipment) {
      summary[item.status] += 1;
    }
    return { asOf: toUtcIso(nowMs), equipment, loans, summary };
  }

  return Object.freeze({ borrow, returnLoan, report });
}
