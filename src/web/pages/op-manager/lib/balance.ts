import { GELDTRANSIT_LABEL } from "./constants";
import type { AccountSummary, Transaction } from "../types";

// A transaction is "internal" (not a real business Einnahme/Ausgabe, and
// not part of the Kontostand either) when it's either the auto-filled
// Geldtransit label OR explicitly marked by the user as a Bar-Abhebung —
// money withdrawn as cash isn't spent yet, it's just moved into a form
// tracked separately in the Bargeld tab. A Bar-Abhebung can carry any real
// merchant text (e.g. cashback withdrawn at a Rossmann checkout), so this
// no longer requires the Geldtransit label.
export function isInterneBewegung(tx: Transaction): boolean {
  return tx.verwendungszweck === GELDTRANSIT_LABEL || Boolean(tx.istBarAbhebung);
}

export function computeSummary(
  transactions: Transaction[],
  anfangsbestand: number,
  startDatum: string
): AccountSummary {
  let gesamtEinnahmen = 0;
  let gesamtAusgaben = 0;
  let bewegungenSeitStart = 0;

  for (const tx of transactions) {
    // Excluded from Einnahmen/Ausgaben AND from the balance itself, per the
    // user's own instruction: neither an internal transfer nor a cash
    // withdrawal is money the business earned or spent.
    if (isInterneBewegung(tx)) continue;

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
