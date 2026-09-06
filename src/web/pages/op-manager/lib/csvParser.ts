// Parses bank CSV exports without requiring the user to map columns manually.
// Works by scoring each column against header-keyword and content-pattern
// heuristics, then picking the best candidate per field.

import { GELDTRANSIT_LABEL } from "./constants";

const DELIMITERS = [";", ",", "\t", "|"];

// Each keyword carries a weight: a strong, unambiguous match (e.g. a header
// that literally says "Verwendungszweck") should always beat a weaker
// synonym (e.g. "Buchungstext") that another column might also contain.
interface WeightedKeyword {
  keyword: string;
  weight: number;
}

const HEADER_KEYWORDS: Record<string, WeightedKeyword[]> = {
  glaeubiger: [
    { keyword: "empfänger", weight: 3 },
    { keyword: "empfaenger", weight: 3 },
    { keyword: "zahlungsempfänger", weight: 3 },
    { keyword: "zahlungsempfaenger", weight: 3 },
    { keyword: "begünstigter", weight: 3 },
    { keyword: "beguenstigter", weight: 3 },
    { keyword: "auftraggeber", weight: 3 },
    { keyword: "gläubiger", weight: 3 },
    { keyword: "glaeubiger", weight: 3 },
    { keyword: "zahlungspflichtiger", weight: 3 },
    { keyword: "payee", weight: 3 },
    { keyword: "counterparty", weight: 3 },
    { keyword: "kontoinhaber", weight: 3 },
    { keyword: "name", weight: 1 },
    { keyword: "partner", weight: 1 },
  ],
  iban: [
    { keyword: "iban", weight: 3 },
    { keyword: "kontonummer", weight: 1 },
    { keyword: "konto-nr", weight: 1 },
    { keyword: "konto nr", weight: 1 },
    { keyword: "account", weight: 1 },
  ],
  verwendungszweck: [
    { keyword: "verwendungszweck", weight: 3 },
    { keyword: "reference", weight: 3 },
    { keyword: "description", weight: 3 },
    { keyword: "vwz", weight: 2 },
    { keyword: "buchungstext", weight: 1 },
    { keyword: "text", weight: 1 },
    { keyword: "buchung", weight: 1 },
    { keyword: "umsatzart", weight: 1 },
    { keyword: "vorgang", weight: 1 },
  ],
  betrag: [
    { keyword: "betrag", weight: 3 },
    { keyword: "amount", weight: 3 },
    { keyword: "umsatz", weight: 1 },
    { keyword: "wert", weight: 1 },
    { keyword: "value", weight: 1 },
    { keyword: "eur", weight: 1 },
  ],
  datum: [
    { keyword: "buchungstag", weight: 3 },
    { keyword: "buchungsdatum", weight: 3 },
    { keyword: "datum", weight: 3 },
    { keyword: "date", weight: 3 },
    { keyword: "valuta", weight: 2 },
    { keyword: "wertstellung", weight: 2 },
    { keyword: "booking date", weight: 3 },
  ],
  soll: [
    { keyword: "soll", weight: 3 },
    { keyword: "belastung", weight: 3 },
    { keyword: "debit", weight: 3 },
    { keyword: "ausgang", weight: 1 },
  ],
  haben: [
    { keyword: "haben", weight: 3 },
    { keyword: "gutschrift", weight: 3 },
    { keyword: "credit", weight: 3 },
    { keyword: "eingang", weight: 1 },
  ],
};

function detectDelimiter(sampleLines: string[]): string {
  let best = ";";
  let bestScore = -1;
  for (const delimiter of DELIMITERS) {
    const counts = sampleLines.map((line) => line.split(delimiter).length - 1);
    const avg = counts.reduce((a, b) => a + b, 0) / (counts.length || 1);
    const consistent = counts.every((c) => c === counts[0]) ? 1 : 0.5;
    const score = avg * consistent;
    if (avg > 0 && score > bestScore) {
      bestScore = score;
      best = delimiter;
    }
  }
  return best;
}

function parseCsvLines(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  const pushField = () => {
    row.push(field);
    field = "";
  };
  const pushRow = () => {
    pushField();
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === delimiter) {
      pushField();
    } else if (char === "\r") {
      // skip, \n handles the line break
    } else if (char === "\n") {
      pushRow();
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) pushRow();

  return rows.filter((r) => r.some((cell) => cell.trim().length > 0));
}

const DATE_PATTERNS = [
  /^\d{1,2}\.\d{1,2}\.\d{2,4}$/, // 27.08.2026
  /^\d{4}-\d{1,2}-\d{1,2}$/, // 2026-08-27
  /^\d{1,2}\/\d{1,2}\/\d{2,4}$/, // 08/27/2026
];

const IBAN_PATTERN = /^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/;

function looksLikeDate(value: string): boolean {
  return DATE_PATTERNS.some((p) => p.test(value.trim()));
}

function looksLikeIban(value: string): boolean {
  return IBAN_PATTERN.test(value.trim().replace(/\s+/g, ""));
}

function looksLikeAmount(value: string): boolean {
  const cleaned = value.trim().replace(/[€$\s]/g, "");
  return /^[+-]?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?$/.test(cleaned) && /\d/.test(cleaned);
}

// Resolves a value with exactly one kind of separator (only commas, or only
// dots). Ambiguous: "1,234" could be German "1.234" (decimal) or US "1234"
// (thousands grouping). Since currency amounts virtually never carry three
// decimal digits, three digits after the last separator (or more than one
// occurrence of it) is treated as thousands grouping; one or two digits is
// treated as the decimal part.
function normalizeSingleSeparator(cleaned: string, separator: "," | "."): string {
  const occurrences = cleaned.split(separator).length - 1;
  const lastIndex = cleaned.lastIndexOf(separator);
  const fractionalDigits = cleaned.length - lastIndex - 1;
  const isThousandsGrouping = occurrences > 1 || fractionalDigits === 3;

  if (isThousandsGrouping) {
    return cleaned.split(separator).join("");
  }

  const integerPart = cleaned.slice(0, lastIndex);
  const decimalPart = cleaned.slice(lastIndex + 1);
  return `${integerPart}.${decimalPart}`;
}

export function parseAmount(raw: string): number {
  const cleaned = raw.trim().replace(/[€$\s]/g, "");
  const hasComma = cleaned.includes(",");
  const hasDot = cleaned.includes(".");

  let normalized = cleaned;
  if (hasComma && hasDot) {
    const lastComma = cleaned.lastIndexOf(",");
    const lastDot = cleaned.lastIndexOf(".");
    normalized =
      lastComma > lastDot ? cleaned.replace(/\./g, "").replace(",", ".") : cleaned.replace(/,/g, "");
  } else if (hasComma) {
    normalized = normalizeSingleSeparator(cleaned, ",");
  } else if (hasDot) {
    normalized = normalizeSingleSeparator(cleaned, ".");
  }

  const value = parseFloat(normalized);
  return Number.isFinite(value) ? value : 0;
}

export function parseDateToIso(raw: string): string {
  const value = raw.trim();

  const isoMatch = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  const dotMatch = value.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/);
  if (dotMatch) {
    const [, d, m, yRaw] = dotMatch;
    const y = yRaw.length === 2 ? `20${yRaw}` : yRaw;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  const slashMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slashMatch) {
    const [, m, d, yRaw] = slashMatch;
    const y = yRaw.length === 2 ? `20${yRaw}` : yRaw;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  return value;
}

interface ColumnMapping {
  glaeubiger: number;
  iban: number;
  verwendungszweck: number;
  betrag: number;
  datum: number;
  soll: number;
  haben: number;
}

function headerScore(header: string, field: string): number {
  const normalized = header.trim().toLowerCase();
  const keywords = HEADER_KEYWORDS[field] ?? [];
  return keywords.reduce((max, { keyword, weight }) => (normalized.includes(keyword) ? Math.max(max, weight) : max), 0);
}

function contentScore(values: string[], field: string): number {
  const nonEmpty = values.filter((v) => v.trim().length > 0);
  if (nonEmpty.length === 0) return 0;

  switch (field) {
    case "iban":
      return nonEmpty.filter(looksLikeIban).length / nonEmpty.length;
    case "datum":
      return nonEmpty.filter(looksLikeDate).length / nonEmpty.length;
    case "betrag":
    case "soll":
    case "haben":
      return nonEmpty.filter(looksLikeAmount).length / nonEmpty.length;
    default:
      return 0;
  }
}

function detectColumns(header: string[], dataRows: string[][]): ColumnMapping {
  const fields = ["glaeubiger", "iban", "verwendungszweck", "betrag", "datum", "soll", "haben"] as const;
  const columnCount = header.length;

  const scores: number[][] = fields.map((field) =>
    Array.from({ length: columnCount }, (_, colIdx) => {
      const values = dataRows.map((r) => r[colIdx] ?? "");
      return headerScore(header[colIdx] ?? "", field) + contentScore(values, field);
    })
  );

  const mapping: Record<string, number> = {};
  const usedColumns = new Set<number>();

  const candidates: { field: string; col: number; score: number }[] = [];
  fields.forEach((field, fIdx) => {
    scores[fIdx].forEach((score, col) => {
      if (score > 0) candidates.push({ field, col, score });
    });
  });
  candidates.sort((a, b) => b.score - a.score);

  const assignedFields = new Set<string>();
  for (const candidate of candidates) {
    if (assignedFields.has(candidate.field) || usedColumns.has(candidate.col)) continue;
    mapping[candidate.field] = candidate.col;
    assignedFields.add(candidate.field);
    usedColumns.add(candidate.col);
  }

  // Betrag can also be reconstructed from separate Soll/Haben columns.
  if (mapping.betrag === undefined && (mapping.soll !== undefined || mapping.haben !== undefined)) {
    mapping.betrag = -1; // sentinel: derive from soll/haben during row parsing
  }

  return {
    glaeubiger: mapping.glaeubiger ?? -1,
    iban: mapping.iban ?? -1,
    verwendungszweck: mapping.verwendungszweck ?? -1,
    betrag: mapping.betrag ?? -1,
    datum: mapping.datum ?? -1,
    soll: mapping.soll ?? -1,
    haben: mapping.haben ?? -1,
  };
}

export interface ParsedRow {
  glaeubiger: string;
  iban: string;
  verwendungszweck: string;
  betrag: number;
  datum: string;
}

export function parseBankCsv(text: string): ParsedRow[] {
  const cleanText = text.replace(/^﻿/, "");
  const firstLines = cleanText.split(/\r?\n/).slice(0, 5).filter(Boolean);
  const delimiter = detectDelimiter(firstLines);
  const rows = parseCsvLines(cleanText, delimiter);

  if (rows.length < 2) return [];

  const [header, ...dataRows] = rows;
  const mapping = detectColumns(header, dataRows);

  const results: ParsedRow[] = [];
  for (const row of dataRows) {
    const rawBetrag = mapping.betrag >= 0 ? row[mapping.betrag] ?? "" : "";
    let betrag: number;
    if (mapping.betrag === -1 && (mapping.soll !== -1 || mapping.haben !== -1)) {
      const soll = mapping.soll !== -1 ? parseAmount(row[mapping.soll] ?? "0") : 0;
      const haben = mapping.haben !== -1 ? parseAmount(row[mapping.haben] ?? "0") : 0;
      betrag = haben - Math.abs(soll);
    } else if (rawBetrag.trim().length > 0) {
      betrag = parseAmount(rawBetrag);
    } else {
      continue; // no usable amount for this row
    }

    const datumRaw = mapping.datum >= 0 ? row[mapping.datum] ?? "" : "";
    const datum = parseDateToIso(datumRaw);
    if (!datum) continue;

    const glaeubiger = mapping.glaeubiger >= 0 ? (row[mapping.glaeubiger] ?? "").trim() : "";
    const iban = mapping.iban >= 0 ? (row[mapping.iban] ?? "").trim().replace(/\s+/g, "") : "";
    const vwzRaw = mapping.verwendungszweck >= 0 ? (row[mapping.verwendungszweck] ?? "").trim() : "";
    const verwendungszweck = vwzRaw.length > 0 ? vwzRaw : GELDTRANSIT_LABEL;

    results.push({
      glaeubiger: glaeubiger.length > 0 ? glaeubiger : "Unbekannt",
      iban,
      verwendungszweck,
      betrag,
      datum,
    });
  }

  return results;
}
