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
