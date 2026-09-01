// Datenmodell + Persistenz (localStorage) + Bunq-CSV-Import für den
// Ausgaben Soll/Ist-Vergleich unter /ausgaben.

export type PostenTyp = "fixkosten" | "op";

export interface Posten {
  id: string;
  name: string;
  soll: number;
  ist: number;
}

export interface BarKategorie {
  id: string;
  name: string;
  soll: number;
}

export interface BarBuchung {
  id: string;
  kategorieId: string;
  datum: string; // ISO yyyy-mm-dd
  beschreibung: string;
  betrag: number;
}

export interface Bargeldabhebung {
  id: string;
  datum: string; // ISO yyyy-mm-dd
  beschreibung: string;
  soll: number;
  ist: number;
}

export interface AusgabenState {
  anfangsbestand: number;
  anfangsbestandDatum: string; // ISO yyyy-mm-dd
  fixkosten: Posten[];
  ops: Posten[];
  barKategorien: BarKategorie[];
  barBuchungen: BarBuchung[];
  bargeldabhebungen: Bargeldabhebung[];
}

export const STORAGE_KEY = "elpanetto-ausgaben-state-v1";

const DEFAULT_BAR_KATEGORIEN = [
  "Lebensmittel",
  "Restaurant & Café",
  "Transport",
  "Shopping",
  "Gesundheit & Pflege",
  "Freizeit & Unterhaltung",
  "Haushalt",
  "Sonstiges",
];

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function defaultState(): AusgabenState {
  return {
    anfangsbestand: 820,
    anfangsbestandDatum: "2026-08-27",
    fixkosten: [],
    ops: [],
    barKategorien: DEFAULT_BAR_KATEGORIEN.map((name) => ({ id: uid(), name, soll: 0 })),
    barBuchungen: [],
    bargeldabhebungen: [],
  };
}

export function loadState(): AusgabenState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<AusgabenState>;
    return { ...defaultState(), ...parsed };
  } catch {
    return defaultState();
  }
}

export function saveState(state: AusgabenState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function newPosten(name = "Neuer Posten"): Posten {
  return { id: uid(), name, soll: 0, ist: 0 };
}

export function newBarKategorie(name = "Neue Kategorie"): BarKategorie {
  return { id: uid(), name, soll: 0 };
}

export function newBargeldabhebung(): Bargeldabhebung {
  return {
    id: uid(),
    datum: new Date().toISOString().slice(0, 10),
    beschreibung: "Bargeldabhebung",
    soll: 0,
    ist: 0,
  };
}

export function newBarBuchung(kategorieId: string): BarBuchung {
  return {
    id: uid(),
    kategorieId,
    datum: new Date().toISOString().slice(0, 10),
    beschreibung: "",
    betrag: 0,
  };
}

export function formatEUR(n: number): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(
    Number.isFinite(n) ? n : 0
  );
}

export function formatDate(iso: string): string {
  if (!iso) return "–";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}.${m}.${y}`;
}

// ---------------------------------------------------------------------------
// Bunq-CSV-Import
// ---------------------------------------------------------------------------

export interface ParsedTransaction {
  id: string;
  datum: string;
  betrag: number; // negativ = Ausgabe, positiv = Eingang
  gegenpartei: string;
  beschreibung: string;
  kategorie: string;
  isLikelyCashWithdrawal: boolean;
}

const HEADER_ALIASES: Record<string, string[]> = {
  datum: ["date", "datum", "interest date", "rentedatum", "boekdatum", "transactiedatum"],
  betrag: ["amount", "betrag", "bedrag"],
  gegenpartei: [
    "name",
    "counterparty",
    "gegenpartij",
    "naam tegenpartij",
    "name gegenpartei",
    "empfänger/zahlungspflichtiger",
    "empfaenger/zahlungspflichtiger",
  ],
  beschreibung: [
    "description",
    "beschreibung",
    "omschrijving",
    "verwendungszweck",
    "mededelingen",
  ],
  kategorie: ["category", "kategorie", "categorie"],
};

const CASH_KEYWORDS = [
  "geldautomat",
  "atm",
  "bargeldauszahlung",
  "bargeldabhebung",
  "geldabhebung",
  "cash withdrawal",
  "withdrawal",
  "auszahlung",
  "cajero",
  "efectivo",
];

function detectDelimiter(headerLine: string): string {
  const candidates = [",", ";", "\t"];
  let best = candidates[0];
  let bestCount = -1;
  for (const d of candidates) {
    const n = headerLine.split(d).length;
    if (n > bestCount) {
      bestCount = n;
      best = d;
    }
  }
  return best;
}

function parseCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      result.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result.map((s) => s.trim());
}

function findColumn(headers: string[], aliases: string[]): number {
  const normalized = headers.map((h) => h.toLowerCase().trim());
  for (const alias of aliases) {
    const idx = normalized.indexOf(alias);
    if (idx !== -1) return idx;
  }
  return -1;
}

function parseAmount(raw: string): number {
  let s = (raw || "").trim().replace(/[€\s]/g, "");
  const hasComma = s.includes(",");
  const hasDot = s.includes(".");
  if (hasComma && hasDot) {
    if (s.lastIndexOf(",") > s.lastIndexOf(".")) {
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      s = s.replace(/,/g, "");
    }
  } else if (hasComma) {
    s = s.replace(",", ".");
  }
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

function normalizeDate(raw: string): string {
  const s = (raw || "").trim();
  // yyyy-mm-dd bereits ok
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  // dd-mm-yyyy oder dd.mm.yyyy oder dd/mm/yyyy
  const m = s.match(/^(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})/);
  if (m) {
    const [, d, mo, y] = m;
    return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return s;
}

/** Prüft grob, ob der Text wie eine gültige Bunq/Bank-CSV mit erkennbarer Betrags-Spalte aussieht. */
export function looksLikeParsableCsv(text: string): boolean {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 1) return false;
  const delimiter = detectDelimiter(lines[0]);
  const headers = parseCsvLine(lines[0], delimiter);
  return findColumn(headers, HEADER_ALIASES.betrag) !== -1;
}

export function parseBankCsv(text: string): ParsedTransaction[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const delimiter = detectDelimiter(lines[0]);
  const headers = parseCsvLine(lines[0], delimiter);
  const idx = {
    datum: findColumn(headers, HEADER_ALIASES.datum),
    betrag: findColumn(headers, HEADER_ALIASES.betrag),
    gegenpartei: findColumn(headers, HEADER_ALIASES.gegenpartei),
    beschreibung: findColumn(headers, HEADER_ALIASES.beschreibung),
    kategorie: findColumn(headers, HEADER_ALIASES.kategorie),
  };

  const rows: ParsedTransaction[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i], delimiter);
    if (cols.length < 2) continue;
    const betrag = idx.betrag !== -1 ? parseAmount(cols[idx.betrag]) : 0;
    if (betrag === 0) continue;
    const gegenpartei = idx.gegenpartei !== -1 ? cols[idx.gegenpartei] ?? "" : "";
    const beschreibung = idx.beschreibung !== -1 ? cols[idx.beschreibung] ?? "" : "";
    const kategorie = idx.kategorie !== -1 ? cols[idx.kategorie] ?? "" : "";
    const datum = idx.datum !== -1 ? normalizeDate(cols[idx.datum]) : "";
    const haystack = `${gegenpartei} ${beschreibung} ${kategorie}`.toLowerCase();
    rows.push({
      id: uid(),
      datum,
      betrag,
      gegenpartei,
      beschreibung,
      kategorie,
      isLikelyCashWithdrawal: CASH_KEYWORDS.some((k) => haystack.includes(k)),
    });
  }
  // neueste zuerst
  rows.sort((a, b) => (a.datum < b.datum ? 1 : a.datum > b.datum ? -1 : 0));
  return rows;
}

/** Einfache Fuzzy-Zuordnung: Posten-Name kommt im Buchungstext vor (oder umgekehrt). */
export function guessPostenMatch(tx: ParsedTransaction, posten: Posten[]): Posten | null {
  const haystack = `${tx.gegenpartei} ${tx.beschreibung}`.toLowerCase();
  for (const p of posten) {
    const name = p.name.toLowerCase().trim();
    if (name.length < 3) continue;
    if (haystack.includes(name) || name.includes(tx.gegenpartei.toLowerCase().trim())) {
      return p;
    }
  }
  return null;
}
