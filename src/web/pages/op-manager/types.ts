export interface Transaction {
  id: string;
  glaeubiger: string;
  iban: string;
  verwendungszweck: string;
  betrag: number;
  datum: string; // ISO format YYYY-MM-DD
  fingerprint: string;
  importedAt: string;
  // Set by the user on a negative Geldtransit row to mark it as an actual
  // cash withdrawal — its amount then feeds the Bargeld tab's balance.
  istBarAbhebung?: boolean;
}

export interface ImportResult {
  added: Transaction[];
  duplicateCount: number;
  totalRows: number;
}

export interface AccountSummary {
  gesamtEinnahmen: number;
  gesamtAusgaben: number;
  // Net of all Bar-Abhebung-marked transactions — excluded from
  // Einnahmen/Ausgaben but still factored into aktuellerKontostand, since
  // the money genuinely left the bank account.
  barabhebungenNetto: number;
  anfangsbestand: number;
  aktuellerKontostand: number;
}

export type OpManagerTabId = "kontoauszug" | "bargeld" | "offene-posten" | "uebersicht";

export interface CashExpense {
  id: string;
  datum: string; // ISO format YYYY-MM-DD
  betrag: number; // always positive — an outgoing cash expense
  kategorie: string;
  erfasstAm: string;
}

export interface CategoryTotal {
  kategorie: string;
  summe: number;
}

export type OpenItemStatus = "aktiv" | "erledigt";

// A debt/installment item (Schuldenabbau-style), not a one-off invoice:
// tracked by total amount, monthly rate and how much has been paid so far
// rather than a single due date. Status is always derived (see
// deriveItemStatus in openItems.ts) from gesamtbetrag - bereitsBezahlt, so
// it can never drift out of sync with an edit to either number.
export interface OpenItem {
  id: string;
  glaeubiger: string;
  kategorie: string;
  iban: string;
  verwendungszweck: string;
  gesamtbetrag: number; // always positive — the original total owed
  monatsrate: number; // always positive
  bereitsBezahlt: number; // running total paid so far
  startMonat: string; // "YYYY-MM"
  istSchneeballZiel: boolean; // prioritized in a debt-snowball payoff strategy
  notiz: string;
  erfasstAm: string;
  // "manuell" today; a later Kontoauszug-Verknüpfung can add e.g. "kontoauszug-match"
  // without touching existing entries or the code that reads this field.
  quelle: "manuell" | "import";
  // Once the user accepts a suggested Verwendungszweck from the Kontoauszug
  // (see findMatchingTransaction), this item keeps re-syncing automatically
  // on every future statement instead of asking again. A manual edit turns
  // it back off.
  autoSyncVerwendungszweck?: boolean;
}

export interface OpenItemsSummary {
  anzahlAktiv: number;
  summeRest: number;
  summeMonatsrate: number;
}
