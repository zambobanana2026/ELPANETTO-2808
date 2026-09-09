import { useEffect, useState } from "react";

interface BarabhebungenKorrekturInputProps {
  korrektur: number;
  onChange: (value: number) => void;
}

// Manual correction on top of the Kontoauszug-derived Bar-Abhebungen total —
// for a withdrawal the bank CSV never reported (or reported late), so the
// user isn't stuck waiting for a future import just to fix this number.
export function BarabhebungenKorrekturInput({ korrektur, onChange }: BarabhebungenKorrekturInputProps) {
  const [text, setText] = useState(() => String(korrektur));
  useEffect(() => setText(String(korrektur)), [korrektur]);

  const handleChange = (value: string) => {
    setText(value);
    const parsed = parseFloat(value.replace(",", "."));
    if (Number.isFinite(parsed)) onChange(parsed);
  };

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-stone-400">Korrektur</span>
      <span className="text-stone-400">€</span>
      <input
        type="text"
        inputMode="decimal"
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        className="w-20 rounded-lg border border-stone-300 px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none"
      />
    </div>
  );
}
