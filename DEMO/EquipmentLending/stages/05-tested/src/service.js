import { getLoanStatus, planBorrow, planReturn } from './core.js';

const equipment = [
  { equipmentId: 'EQ-001', name: '示範相機' },
  { equipmentId: 'EQ-002', name: '示範投影機' },
  { equipmentId: 'EQ-003', name: '示範筆電' },
];

export function createLendingService(clock = () => Date.parse('2026-01-15T00:00:00.000Z')) {
  const loans = [];

  function borrow(input) {
    const nowMs = clock();
    const item = equipment.find((entry) => entry.equipmentId === input?.equipmentId);
    const activeLoan = loans.find(
      (loan) => loan.equipmentId === input?.equipmentId && loan.returnedAtMs === null,
    ) ?? null;
    const planned = planBorrow({ equipment: item, activeLoan, input, nowMs });
    const loan = { ...planned, loanId: loans.length + 1 };
    loans.push(loan);
    return { ...loan, status: getLoanStatus(loan, nowMs) };
  }

  function returnLoan(loanId) {
    const nowMs = clock();
    const loan = loans.find((entry) => entry.loanId === loanId);
    const updated = planReturn({ loan, nowMs });
    Object.assign(loan, updated);
    return { ...loan, status: getLoanStatus(loan, nowMs) };
  }

  function report() {
    const nowMs = clock();
    return loans.map((loan) => ({ ...loan, status: getLoanStatus(loan, nowMs) }));
  }

  return Object.freeze({ borrow, returnLoan, report });
}
