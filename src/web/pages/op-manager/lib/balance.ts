import { GELDTRANSIT_LABEL } from "./constants";
import type { AccountSummary, Transaction } from "../types";

// A transaction is "internal" in the sense that it's never a real business
// Einnahme/Ausgabe: the auto-filled Geldtransit label (a transfer between
// the user's own accounts) OR one explicitly marked as a Bar-Abhebung —
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
  let barabhebungenNetto = 0;
  let bewegungenSeitStart = 0;

  for (const tx of transactions) {
    // Geldtransit is fully excluded — neither income/expense nor a real
    // balance change from this ledger's perspective.
    if (tx.verwendungszweck === GELDTRANSIT_LABEL) continue;

    if (tx.istBarAbhebung) {
      // Not a business expense yet (tracked separately once actually spent,
      // in the Bargeld tab) — excluded from Einnahmen/Ausgaben — but the
      // money DOES leave the real bank account, so it still reduces the
      // Kontostand below.
      barabhebungenNetto += tx.betrag;
    } else if (tx.betrag >= 0) {
      gesamtEinnahmen += tx.betrag;
    } else {
      gesamtAusgaben += tx.betrag;
    }

    if (tx.datum >= startDatum) bewegungenSeitStart += tx.betrag;
  }

  return {
    gesamtEinnahmen,
    gesamtAusgaben,
    barabhebungenNetto,
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
