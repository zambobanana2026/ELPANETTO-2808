import { useState } from "react";
import { isGlaeubigerPlaceholder } from "../lib/glaeubigerNames";
import type { Transaction } from "../types";

interface GlaeubigerCellProps {
  tx: Transaction;
  onSetName: (id: string, iban: string, name: string) => void;
}

export function GlaeubigerCell({ tx, onSetName }: GlaeubigerCellProps) {
  const [draft, setDraft] = useState("");
  const isPlaceholder = isGlaeubigerPlaceholder(tx);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed.length === 0) {
      setDraft(""); // clear a whitespace-only draft so the placeholder text reappears
      return;
    }
    onSetName(tx.id, tx.iban, trimmed);
    setDraft("");
  };

  if (!isPlaceholder) {
    return (
      <span className="flex items-baseline gap-2">
        <span className="text-stone-800">{tx.glaeubiger}</span>
        {tx.iban && <span className="text-xs text-stone-400">{tx.iban}</span>}
      </span>
    );
  }

  return (
    <span className="flex items-baseline gap-2">
      <input
        type="text"
        placeholder="Name eingeben…"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          }
        }}
        className="w-32 rounded border border-dashed border-stone-300 px-1.5 py-0.5 text-sm text-stone-700 focus:border-indigo-500 focus:border-solid focus:outline-none"
      />
      {tx.iban && <span className="text-xs text-stone-400">{tx.iban}</span>}
    </span>
  );
}
