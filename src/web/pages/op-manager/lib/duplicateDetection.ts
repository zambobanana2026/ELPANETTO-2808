import type { ParsedRow } from "./csvParser";
import type { ImportResult, Transaction } from "../types";

// Deliberately excludes glaeubiger: that field can be blanked, re-derived,
// or overwritten later by the IBAN-name-learning feature (see
// glaeubigerNames.ts), and identity must never depend on something that
// legitimately changes after import — otherwise re-importing the exact
// same CSV after naming an IBAN would compute a different fingerprint and
// wrongly re-add every row as "new" (this happened; see git history).
export function buildFingerprint(row: ParsedRow): string {
  return [row.iban.toLowerCase(), row.datum, row.betrag.toFixed(2), row.verwendungszweck.trim().toLowerCase()].join(
    "|"
  );
}

// Two genuinely distinct transactions can share the same fingerprint (e.g.
// two identical €9.99 charges to the same merchant on the same day), so a
// plain Set would wrongly drop the second one as a "duplicate". Instead we
// compare occurrence counts: re-importing the same CSV reproduces the same
// per-fingerprint counts and is fully deduplicated, while a fresh import
// with coincidentally repeated fingerprints still gets every occurrence
// beyond what's already stored added as new.
export function mergeNewRows(
  rows: ParsedRow[],
  existingFingerprintCounts: ReadonlyMap<string, number>
): ImportResult {
  const added: Transaction[] = [];
  const occurrencesInThisImport = new Map<string, number>();
  let duplicateCount = 0;

  for (const row of rows) {
    const fingerprint = buildFingerprint(row);
    const occurrenceIndex = (occurrencesInThisImport.get(fingerprint) ?? 0) + 1;
    occurrencesInThisImport.set(fingerprint, occurrenceIndex);

    const alreadyStored = existingFingerprintCounts.get(fingerprint) ?? 0;
    if (occurrenceIndex <= alreadyStored) {
      duplicateCount++;
      continue;
    }
    added.push({
      id: `${fingerprint}-${crypto.randomUUID()}`,
      glaeubiger: row.glaeubiger,
      iban: row.iban,
      verwendungszweck: row.verwendungszweck,
      betrag: row.betrag,
      datum: row.datum,
      fingerprint,
      importedAt: new Date().toISOString(),
    });
  }

  return { added, duplicateCount, totalRows: rows.length };
}
