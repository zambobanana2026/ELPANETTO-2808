import { useState } from "react";
import { GELDTRANSIT_LABEL } from "../lib/constants";
import { parseAmount } from "../lib/csvParser";
import { todayIso } from "../lib/format";

interface ManualTransactionFormProps {
  onAdd: (input: { glaeubiger: string; iban: string; verwendungszweck: string; betrag: number; datum: string }) => void;
}

// Bank CSV exports can lag or omit a transaction (e.g. a cash withdrawal at
// a POS terminal sometimes posts a day late, or under a line item the
// export drops). This lets the user record one by hand instead of being
// stuck waiting for the next CSV to (maybe) include it.
export function ManualTransactionForm({ onAdd }: ManualTransactionFormProps) {
  const [open, setOpen] = useState(false);
  const [datum, setDatum] = useState(todayIso());
  const [glaeubiger, setGlaeubiger] = useState("");
  const [verwendungszweck, setVerwendungszweck] = useState("");
  const [betragText, setBetragText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseAmount(betragText);
    if (!Number.isFinite(parsed) || parsed === 0) {
      setError("Bitte einen gültigen Betrag ungleich 0 angeben (negativ für eine Ausgabe/Abhebung).");
      return;
    }
    setError(null);
    onAdd({
      glaeubiger: glaeubiger.trim(),
      iban: "",
      verwendungszweck: verwendungszweck.trim() || GELDTRANSIT_LABEL,
      betrag: parsed,
      datum,
    });
    setGlaeubiger("");
    setVerwendungszweck("");
    setBetragText("");
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="self-start rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-50"
      >
        ✏️ Buchung manuell hinzufügen
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide text-stone-500">Datum</label>
          <input
            type="date"
            value={datum}
            onChange={(e) => setDatum(e.target.value)}
            className="rounded-lg border border-stone-300 px-2.5 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide text-stone-500">Gläubiger (optional)</label>
          <input
            type="text"
            value={glaeubiger}
            onChange={(e) => setGlaeubiger(e.target.value)}
            placeholder="z. B. Rossmann"
            className="w-40 rounded-lg border border-stone-300 px-2.5 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div className="flex min-w-[12rem] flex-1 flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide text-stone-500">Verwendungszweck</label>
          <input
            type="text"
            value={verwendungszweck}
            onChange={(e) => setVerwendungszweck(e.target.value)}
            placeholder="z. B. Bargeldauszahlung Rossmann"
            className="w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide text-stone-500">Betrag</label>
          <div className="flex items-center gap-1.5">
            <span className="text-stone-400">€</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="-200,00"
              value={betragText}
              onChange={(e) => setBetragText(e.target.value)}
              className="w-28 rounded-lg border border-stone-300 px-2.5 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-transform duration-150 hover:bg-indigo-700 active:scale-95"
        >
          + Hinzufügen
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg px-3 py-2.5 text-sm text-stone-400 hover:text-stone-600"
        >
          Abbrechen
        </button>
      </div>
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
    </form>
  );
}
