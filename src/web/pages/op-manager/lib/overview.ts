import type { AccountSummary, CashExpense, OpenItemsSummary, Transaction } from "../types";

export interface OverviewSummary {
  gesamtGuthaben: number;
  offeneVerbindlichkeitenSumme: number;
  ueberfaelligSumme: number;
  anzahlOffenePosten: number;
}

export function computeOverviewSummary(
  kontoauszug: AccountSummary,
  bargeldBestand: number,
  offenePosten: OpenItemsSummary
): OverviewSummary {
  return {
    gesamtGuthaben: kontoauszug.aktuellerKontostand + bargeldBestand,
    offeneVerbindlichkeitenSumme: offenePosten.summeOffen,
    ueberfaelligSumme: offenePosten.summeUeberfaellig,
    anzahlOffenePosten: offenePosten.anzahlOffen,
  };
}

export interface ActivityEntry {
  id: string;
  datum: string;
  beschreibung: string;
  betrag: number;
  quelle: "Kontoauszug" | "Bargeld";
  sortKey: string;
}

export function buildRecentActivity(transactions: Transaction[], cashExpenses: CashExpense[], limit = 8): ActivityEntry[] {
  const fromTransactions: ActivityEntry[] = transactions.map((tx) => ({
    id: tx.id,
    datum: tx.datum,
    beschreibung: tx.glaeubiger,
    betrag: tx.betrag,
    quelle: "Kontoauszug",
    sortKey: tx.importedAt,
  }));

  const fromCash: ActivityEntry[] = cashExpenses.map((expense) => ({
    id: expense.id,
    datum: expense.datum,
    beschreibung: expense.kategorie,
    betrag: -expense.betrag, // expenses are always stored positive — shown as an outflow here
    quelle: "Bargeld",
    sortKey: expense.erfasstAm,
  }));

  return [...fromTransactions, ...fromCash]
    .sort((a, b) => (a.datum !== b.datum ? b.datum.localeCompare(a.datum) : b.sortKey.localeCompare(a.sortKey)))
    .slice(0, limit);
}
