export interface Transaction {
  id: string;
  glaeubiger: string;
  iban: string;
  verwendungszweck: string;
  betrag: number;
  datum: string; // ISO format YYYY-MM-DD
  fingerprint: string;
  importedAt: string;
}

export interface ImportResult {
  added: Transaction[];
  duplicateCount: number;
  totalRows: number;
}

export interface AccountSummary {
  gesamtEinnahmen: number;
  gesamtAusgaben: number;
  anfangsbestand: number;
  aktuellerKontostand: number;
}

export type OpManagerTabId = "kontoauszug" | "bargeld" | "offene-posten" | "uebersicht";

export interface CashEntry {
  id: string;
  datum: string; // ISO format YYYY-MM-DD
  beschreibung: string;
  betrag: number;
  erfasstAm: string;
  // "manuell" today; a later Kontoauszug-Verknüpfung can add e.g. "kontoauszug-transfer"
  // without touching existing entries or the code that reads this field.
  quelle: "manuell";
}

export interface CashCount {
  id: string;
  datum: string; // ISO date the till was counted
  erfasstAm: string;
  sollBestand: number;
  istBestand: number;
  differenz: number;
  denominationCounts: Record<string, number>;
  ausgeglichen: boolean;
}

export type OpenItemStatus = "offen" | "bezahlt";

export interface OpenItem {
  id: string;
  glaeubiger: string;
  rechnungsnummer: string;
  verwendungszweck: string;
  betrag: number; // always positive — the amount owed
  rechnungsdatum: string; // ISO format YYYY-MM-DD
  faelligkeitsdatum: string; // ISO format YYYY-MM-DD
  notiz: string;
  status: OpenItemStatus;
  bezahltAm: string | null; // ISO date, set when marked paid
  erfasstAm: string;
  // "manuell" today; a later Kontoauszug-Verknüpfung can add e.g. "kontoauszug-match"
  // without touching existing entries or the code that reads this field.
  quelle: "manuell";
}

export interface OpenItemsSummary {
  anzahlOffen: number;
  summeOffen: number;
  summeUeberfaellig: number;
}
