import type { AccountSummary, CashEntry, OpenItemsSummary, Transaction } from "../types";

export interface OverviewSummary {
  gesamtGuthaben: number;
  offeneVerbindlichkeitenSumme: number;
  ueberfaelligSumme: number;
  anzahlOffenePosten: number;
}

export function computeOverviewSummary(
  kontoauszug: AccountSummary,
  bargeld: AccountSummary,
  offenePosten: OpenItemsSummary
): OverviewSummary {
  return {
    gesamtGuthaben: kontoauszug.aktuellerKontostand + bargeld.aktuellerKontostand,
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

export function buildRecentActivity(transactions: Transaction[], cashEntries: CashEntry[], limit = 8): ActivityEntry[] {
  const fromTransactions: ActivityEntry[] = transactions.map((tx) => ({
    id: tx.id,
    datum: tx.datum,
    beschreibung: tx.glaeubiger,
    betrag: tx.betrag,
    quelle: "Kontoauszug",
    sortKey: tx.importedAt,
  }));

  const fromCash: ActivityEntry[] = cashEntries.map((entry) => ({
    id: entry.id,
    datum: entry.datum,
    beschreibung: entry.beschreibung,
    betrag: entry.betrag,
    quelle: "Bargeld",
    sortKey: entry.erfasstAm,
  }));

  return [...fromTransactions, ...fromCash]
    .sort((a, b) => (a.datum !== b.datum ? b.datum.localeCompare(a.datum) : b.sortKey.localeCompare(a.sortKey)))
    .slice(0, limit);
}
