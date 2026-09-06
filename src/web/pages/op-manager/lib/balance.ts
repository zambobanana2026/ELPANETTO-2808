import { GELDTRANSIT_LABEL } from "./constants";
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
    // Geldtransit = internal transfer between the user's own accounts —
    // explicitly excluded from Einnahmen/Ausgaben AND from the balance
    // itself, per the user's own instruction: it is not money the business
    // earned or spent, so it must not move this number either.
    if (tx.verwendungszweck === GELDTRANSIT_LABEL) continue;

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
