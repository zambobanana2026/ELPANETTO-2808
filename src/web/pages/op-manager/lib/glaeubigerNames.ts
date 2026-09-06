import type { Transaction } from "../types";

// Applies every learned IBAN -> name mapping across the given transactions,
// overwriting any placeholder (or previously different) name for a matching
// IBAN. Called both right after a CSV import (to name newly-added rows
// whose IBAN is already known) and right after the user names a new IBAN
// (to retroactively fix every past transaction from that same account).
export function applyKnownGlaeubigerNames(
  transactions: Transaction[],
  ibanNamen: Record<string, string>
): Transaction[] {
  return transactions.map((tx) => {
    const known = tx.iban ? ibanNamen[tx.iban] : undefined;
    if (!known || tx.glaeubiger === known) return tx;
    return { ...tx, glaeubiger: known };
  });
}
