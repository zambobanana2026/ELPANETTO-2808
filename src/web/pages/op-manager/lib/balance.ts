import type { AccountSummary, Transaction } from "../types";

export function computeSummary(
  transactions: Transaction[],
  anfangsbestand: number,
  startDatum: string
): AccountSummary {
  let gesamtEinnahmen = 0;
  let gesamtAusgaben = 0;
  let bewegungenSeitStart = 0;

  for (const tx of transactions) {
    if (tx.betrag >= 0) gesamtEinnahmen += tx.betrag;
    else gesamtAusgaben += tx.betrag;

    if (tx.datum >= startDatum) bewegungenSeitStart += tx.betrag;
  }

  return {
    gesamtEinnahmen,
    gesamtAusgaben,
    anfangsbestand,
    aktuellerKontostand: anfangsbestand + bewegungenSeitStart,
  };
}

export function sortByDateAscending(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => {
    if (a.datum !== b.datum) return a.datum.localeCompare(b.datum);
    return a.importedAt.localeCompare(b.importedAt);
  });
}
