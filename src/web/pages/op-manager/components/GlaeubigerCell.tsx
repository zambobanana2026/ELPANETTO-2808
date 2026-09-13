import { useEffect, useState } from "react";
import type { Transaction } from "../types";

interface GlaeubigerCellProps {
  tx: Transaction;
  onSetName: (id: string, iban: string, name: string) => void;
}

// Always an editable input, pre-filled with the current name (if any) —
// never a locked read-only span. A previous version switched to a plain
// <span> once a name was set, which meant a Gläubiger could be named once
// but never corrected afterwards.
export function GlaeubigerCell({ tx, onSetName }: GlaeubigerCellProps) {
  const [draft, setDraft] = useState(tx.glaeubiger || "");
  useEffect(() => {
    setDraft(tx.glaeubiger || "");
  }, [tx.glaeubiger]);

  const commit = () => {
    const trimmed = draft.trim();
    setDraft(trimmed);
    if (trimmed === (tx.glaeubiger || "")) return; // no actual change — skip the write
    onSetName(tx.id, tx.iban, trimmed);
  };

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
            e.currentTarget.blur();
          }
        }}
        className={`w-32 rounded border px-1.5 py-0.5 text-sm text-stone-700 focus:border-indigo-500 focus:border-solid focus:outline-none ${
          tx.glaeubiger ? "border-stone-300" : "border-dashed border-stone-300"
        }`}
      />
      {tx.iban && <span className="text-xs text-stone-400">{tx.iban}</span>}
    </span>
  );
}
