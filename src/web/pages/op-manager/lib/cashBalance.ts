import type { AccountSummary, CashEntry } from "../types";

export function computeCashSummary(
  entries: CashEntry[],
  anfangsbestand: number,
  startDatum: string
): AccountSummary {
  let gesamtEinnahmen = 0;
  let gesamtAusgaben = 0;
  let bewegungenSeitStart = 0;

  for (const entry of entries) {
    if (entry.betrag >= 0) gesamtEinnahmen += entry.betrag;
    else gesamtAusgaben += entry.betrag;

    if (entry.datum >= startDatum) bewegungenSeitStart += entry.betrag;
  }

  return {
    gesamtEinnahmen,
    gesamtAusgaben,
    anfangsbestand,
    aktuellerKontostand: anfangsbestand + bewegungenSeitStart,
  };
}

export function computeCashBalanceAsOf(
  entries: CashEntry[],
  anfangsbestand: number,
  startDatum: string,
  asOfDatum: string
): number {
  let total = anfangsbestand;
  for (const entry of entries) {
    if (entry.datum >= startDatum && entry.datum <= asOfDatum) total += entry.betrag;
  }
  return total;
}

export function sortCashEntriesByDate(entries: CashEntry[]): CashEntry[] {
  return [...entries].sort((a, b) => {
    if (a.datum !== b.datum) return a.datum.localeCompare(b.datum);
    return a.erfasstAm.localeCompare(b.erfasstAm);
  });
}
