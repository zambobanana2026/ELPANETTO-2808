import { useEffect, useState } from "react";

interface StartBalanceInputProps {
  anfangsbestand: number;
  startDatum: string;
  onAnfangsbestandChange: (value: number) => void;
  onStartDatumChange: (value: string) => void;
}

export function StartBalanceInput({
  anfangsbestand,
  startDatum,
  onAnfangsbestandChange,
  onStartDatumChange,
}: StartBalanceInputProps) {
  // Buffered as text so intermediate states while typing (e.g. a lone "-"
  // for a negative balance, or a trailing ",") aren't immediately coerced
  // back to a number and overwritten.
  const [balanceText, setBalanceText] = useState(() => String(anfangsbestand));

  useEffect(() => {
    setBalanceText(String(anfangsbestand));
  }, [anfangsbestand]);

  const handleBalanceChange = (text: string) => {
    setBalanceText(text);
    const parsed = parseFloat(text.replace(",", "."));
    if (Number.isFinite(parsed)) {
      onAnfangsbestandChange(parsed);
    }
  };

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-xl border border-stone-200 bg-white p-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="anfangsbestand" className="text-xs font-medium uppercase tracking-wide text-stone-500">
          Anfangsbestand
        </label>
        <div className="flex items-center gap-1">
          <span className="text-stone-400">€</span>
          <input
            id="anfangsbestand"
            type="text"
            inputMode="decimal"
            value={balanceText}
            onChange={(e) => handleBalanceChange(e.target.value)}
            className="w-32 rounded-md border border-stone-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="start-datum" className="text-xs font-medium uppercase tracking-wide text-stone-500">
          Zum Datum
        </label>
        <input
          id="start-datum"
          type="date"
          value={startDatum}
          onChange={(e) => onStartDatumChange(e.target.value)}
          className="rounded-md border border-stone-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>
    </div>
  );
}
