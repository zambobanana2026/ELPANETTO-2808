import { useState } from "react";
import { todayIso } from "../lib/format";

type EntryType = "einnahme" | "ausgabe";

interface CashEntryFormProps {
  onAdd: (entry: { datum: string; beschreibung: string; betrag: number }) => void;
}

export function CashEntryForm({ onAdd }: CashEntryFormProps) {
  const [datum, setDatum] = useState(todayIso());
  const [beschreibung, setBeschreibung] = useState("");
  const [betragText, setBetragText] = useState("");
  const [type, setType] = useState<EntryType>("einnahme");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(betragText.replace(",", "."));
    if (!Number.isFinite(parsed) || parsed <= 0 || beschreibung.trim().length === 0) return;

    onAdd({
      datum,
      beschreibung: beschreibung.trim(),
      betrag: type === "ausgabe" ? -Math.abs(parsed) : Math.abs(parsed),
    });

    setBeschreibung("");
    setBetragText("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 rounded-xl border border-stone-200 bg-white p-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="cash-datum" className="text-xs font-medium uppercase tracking-wide text-stone-500">
          Datum
        </label>
        <input
          id="cash-datum"
          type="date"
          value={datum}
          onChange={(e) => setDatum(e.target.value)}
          className="rounded-md border border-stone-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>

      <div className="flex min-w-[10rem] flex-1 flex-col gap-1">
        <label htmlFor="cash-beschreibung" className="text-xs font-medium uppercase tracking-wide text-stone-500">
          Beschreibung
        </label>
        <input
          id="cash-beschreibung"
          type="text"
          placeholder="z. B. Trinkgeld, Wareneinkauf…"
          value={beschreibung}
          onChange={(e) => setBeschreibung(e.target.value)}
          className="rounded-md border border-stone-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="cash-betrag" className="text-xs font-medium uppercase tracking-wide text-stone-500">
          Betrag
        </label>
        <div className="flex items-center gap-1">
          <span className="text-stone-400">€</span>
          <input
            id="cash-betrag"
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            value={betragText}
            onChange={(e) => setBetragText(e.target.value)}
            className="w-24 rounded-md border border-stone-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex overflow-hidden rounded-md border border-stone-300">
        <button
          type="button"
          onClick={() => setType("einnahme")}
          className={`px-3 py-1.5 text-sm font-medium transition-colors ${
            type === "einnahme" ? "bg-green-600 text-white" : "bg-white text-stone-500 hover:bg-stone-50"
          }`}
        >
          Einnahme
        </button>
        <button
          type="button"
          onClick={() => setType("ausgabe")}
          className={`px-3 py-1.5 text-sm font-medium transition-colors ${
            type === "ausgabe" ? "bg-red-600 text-white" : "bg-white text-stone-500 hover:bg-stone-50"
          }`}
        >
          Ausgabe
        </button>
      </div>

      <button
        type="submit"
        className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-transform duration-150 hover:bg-indigo-700 active:scale-95"
      >
        + Hinzufügen
      </button>
    </form>
  );
}
