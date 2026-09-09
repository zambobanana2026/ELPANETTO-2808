import { useState } from "react";

interface CategoryPickerProps {
  categories: string[];
  selected: string;
  onSelect: (kategorie: string) => void;
  onAddCategory: (kategorie: string) => void;
  onDeleteCategory: (kategorie: string) => void;
}

export function CategoryPicker({
  categories,
  selected,
  onSelect,
  onAddCategory,
  onDeleteCategory,
}: CategoryPickerProps) {
  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Not a <form> on purpose: this component is always used nested inside
  // CashExpenseForm's own <form>, and a <form> inside a <form> is invalid
  // HTML — browsers handle it inconsistently, and on some viewers the
  // "+ Hinzufügen" click ends up triggering a real native form submission
  // (a full page reload) instead of ever reaching this handler. A plain
  // button + manual Enter-key handling avoids relying on any form
  // submission at all.
  const handleAdd = () => {
    const trimmed = newCategory.trim();
    if (trimmed.length === 0) {
      setError("Bitte einen Namen eingeben.");
      return;
    }
    if (categories.includes(trimmed)) {
      setError(`"${trimmed}" gibt es schon.`);
      return;
    }
    setError(null);
    onAddCategory(trimmed);
    setNewCategory("");
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium uppercase tracking-wide text-stone-500">Kategorie</label>
      <div className="flex flex-wrap gap-2">
        {categories.map((kategorie) => (
          <span
            key={kategorie}
            className={`group inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
              selected === kategorie
                ? "border-indigo-600 bg-indigo-600 text-white"
                : "border-stone-300 bg-white text-stone-600 hover:border-indigo-400"
            }`}
          >
            <button type="button" onClick={() => onSelect(kategorie)}>
              {kategorie}
            </button>
            <button
              type="button"
              onClick={() => onDeleteCategory(kategorie)}
              title={`"${kategorie}" löschen`}
              className={`rounded-full text-xs leading-none opacity-60 hover:opacity-100 ${
                selected === kategorie ? "text-white" : "text-stone-400"
              }`}
            >
              ✕
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Neue Kategorie…"
          value={newCategory}
          onChange={(e) => {
            setNewCategory(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          className="rounded-lg border border-stone-300 px-2.5 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-600 hover:border-indigo-400 hover:text-indigo-600"
        >
          + Hinzufügen
        </button>
      </div>
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
