import { useState } from "react";
import { parseAmount } from "../lib/csvParser";
import { todayIso } from "../lib/format";
import { CategoryPicker } from "./CategoryPicker";

interface CashExpenseFormProps {
  categories: string[];
  onAdd: (input: { datum: string; betrag: number; kategorie: string }) => void;
  onAddCategory: (kategorie: string) => void;
  onDeleteCategory: (kategorie: string) => void;
}

export function CashExpenseForm({ categories, onAdd, onAddCategory, onDeleteCategory }: CashExpenseFormProps) {
  const [datum, setDatum] = useState(todayIso());
  const [betragText, setBetragText] = useState("");
  const [kategorie, setKategorie] = useState(categories[0] ?? "");
  const [error, setError] = useState<string | null>(null);

  const handleSelectCategory = (value: string) => setKategorie(value);

  const handleAddCategory = (value: string) => {
    onAddCategory(value);
    setKategorie(value);
  };

  const handleDeleteCategory = (value: string) => {
    // Mirrors BargeldTab's own guard: deleting the last remaining category
    // is a no-op there, so clearing the local selection here would desync
    // from a category that, in fact, was never removed.
    if (categories.length <= 1) return;
    onDeleteCategory(value);
    if (kategorie === value) {
      const remaining = categories.filter((c) => c !== value);
      setKategorie(remaining[0] ?? "");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseAmount(betragText);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Bitte einen gültigen Betrag größer als 0 angeben.");
      return;
    }
    if (kategorie.trim().length === 0) {
      setError("Bitte eine Kategorie wählen oder anlegen.");
      return;
    }
    setError(null);
    onAdd({ datum, betrag: Math.abs(parsed), kategorie });
    setBetragText("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-stone-200 bg-white p-4">
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
          <label className="text-xs font-medium uppercase tracking-wide text-stone-500">Betrag</label>
          <div className="flex items-center gap-1.5">
            <span className="text-stone-400">€</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0,00"
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
          + Ausgabe eintragen
        </button>
      </div>

      <CategoryPicker
        categories={categories}
        selected={kategorie}
        onSelect={handleSelectCategory}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
    </form>
  );
}
