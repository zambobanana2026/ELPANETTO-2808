import type { CashExpense, CategoryTotal, Transaction } from "../types";

// Sum of Kontoauszug transactions the user has explicitly marked as real
// cash withdrawals. Only negative amounts qualify — money leaving the bank
// account is what puts cash in hand. Any negative transaction can carry the
// mark, not just ones labeled Geldtransit — a real cash withdrawal often
// carries the merchant's own text (e.g. "Bargeldauszahlung Rossmann").
export function computeBarabhebungenTotal(transactions: Transaction[]): number {
  let total = 0;
  for (const tx of transactions) {
    if (tx.betrag < 0 && tx.istBarAbhebung) {
      total += Math.abs(tx.betrag);
    }
  }
  return Math.round(total * 100) / 100;
}

export function computeCashBalance(barabhebungenTotal: number, expenses: CashExpense[]): number {
  const ausgegeben = expenses.reduce((sum, e) => sum + e.betrag, 0);
  return Math.round((barabhebungenTotal - ausgegeben) * 100) / 100;
}

export function computeTotalExpenses(expenses: CashExpense[]): number {
  return Math.round(expenses.reduce((sum, e) => sum + e.betrag, 0) * 100) / 100;
}

export function computeExpensesByCategory(expenses: CashExpense[]): CategoryTotal[] {
  const totals = new Map<string, number>();
  for (const e of expenses) {
    totals.set(e.kategorie, (totals.get(e.kategorie) ?? 0) + e.betrag);
  }
  return [...totals.entries()]
    .map(([kategorie, summe]) => ({ kategorie, summe: Math.round(summe * 100) / 100 }))
    .sort((a, b) => b.summe - a.summe);
}

export function sortExpensesByDate(expenses: CashExpense[]): CashExpense[] {
  return [...expenses].sort((a, b) => {
    if (a.datum !== b.datum) return a.datum.localeCompare(b.datum);
    return a.erfasstAm.localeCompare(b.erfasstAm);
  });
}
