const T0 = Date.parse('2026-01-15T00:00:00.000Z');
const equipment = [
  { equipmentId: 'EQ-001', name: '示範相機' },
  { equipmentId: 'EQ-002', name: '示範投影機' },
  { equipmentId: 'EQ-003', name: '示範筆電' },
];

export function runScenario(operations) {
  const loans = [];
  const results = [];
  for (const operation of operations) {
    if (operation.action === 'borrow') {
      if (!equipment.some((item) => item.equipmentId === operation.equipmentId)) {
        results.push({ error: 'EQUIPMENT_NOT_FOUND' });
        continue;
      }
      if (loans.some((loan) => loan.equipmentId === operation.equipmentId && loan.returnedAt === null)) {
        results.push({ error: 'EQUIPMENT_UNAVAILABLE' });
        continue;
      }
      const loan = {
        loanId: loans.length + 1,
        equipmentId: operation.equipmentId,
        borrowerId: operation.borrowerId,
        borrowedAt: new Date(T0).toISOString(),
        dueAt: new Date(T0 + operation.days * 86_400_000).toISOString(),
        returnedAt: null,
        status: 'borrowed',
      };
      loans.push(loan);
      results.push({ status: 'borrowed', loanId: loan.loanId, dueAt: loan.dueAt });
      continue;
    }

    const loan = loans.find((entry) => entry.loanId === operation.loanId);
    if (!loan) {
      results.push({ error: 'LOAN_NOT_FOUND' });
    } else if (loan.returnedAt !== null) {
      results.push({ error: 'LOAN_ALREADY_RETURNED' });
    } else {
      loan.returnedAt = new Date(T0).toISOString();
      loan.status = 'returned';
      results.push({ status: 'returned', loanId: loan.loanId });
    }
  }
  return { results, loans };
}
