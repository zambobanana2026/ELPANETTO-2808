import { useState } from "react";
import { parseAmount } from "../lib/csvParser";
import { addDaysIso, todayIso } from "../lib/format";

interface OpenItemFormProps {
  onAdd: (input: {
    glaeubiger: string;
    rechnungsnummer: string;
    verwendungszweck: string;
    betrag: number;
    rechnungsdatum: string;
    faelligkeitsdatum: string;
    notiz: string;
  }) => void;
}

export function OpenItemForm({ onAdd }: OpenItemFormProps) {
  const [glaeubiger, setGlaeubiger] = useState("");
  const [rechnungsnummer, setRechnungsnummer] = useState("");
  const [verwendungszweck, setVerwendungszweck] = useState("");
  const [betragText, setBetragText] = useState("");
  const [rechnungsdatum, setRechnungsdatum] = useState(todayIso());
  const [faelligkeitsdatum, setFaelligkeitsdatum] = useState(() => addDaysIso(todayIso(), 14));
  const [notiz, setNotiz] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (glaeubiger.trim().length === 0) {
      setError("Bitte einen Gläubiger angeben.");
      return;
    }
    if (verwendungszweck.trim().length === 0) {
      setError("Bitte einen Verwendungszweck angeben.");
      return;
    }
    const parsed = parseAmount(betragText);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Bitte einen gültigen Betrag größer als 0 angeben.");
      return;
    }
    if (faelligkeitsdatum < rechnungsdatum) {
      setError("Das Fälligkeitsdatum darf nicht vor dem Rechnungsdatum liegen.");
      return;
    }

    setError(null);
    onAdd({
      glaeubiger: glaeubiger.trim(),
      rechnungsnummer: rechnungsnummer.trim(),
      verwendungszweck: verwendungszweck.trim(),
      betrag: Math.abs(parsed),
      rechnungsdatum,
      faelligkeitsdatum,
      notiz: notiz.trim(),
    });

    setGlaeubiger("");
    setRechnungsnummer("");
    setVerwendungszweck("");
    setBetragText("");
    setRechnungsdatum(todayIso());
    setFaelligkeitsdatum(addDaysIso(todayIso(), 14));
    setNotiz("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="op-glaeubiger" className="text-xs font-medium uppercase tracking-wide text-stone-500">
            Gläubiger
          </label>
          <input
            id="op-glaeubiger"
            type="text"
            placeholder="z. B. Lieferant GmbH"
            value={glaeubiger}
            onChange={(e) => setGlaeubiger(e.target.value)}
            className="rounded-md border border-stone-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="op-verwendungszweck" className="text-xs font-medium uppercase tracking-wide text-stone-500">
            Verwendungszweck
          </label>
          <input
            id="op-verwendungszweck"
            type="text"
            placeholder="z. B. Wareneinkauf September"
            value={verwendungszweck}
            onChange={(e) => setVerwendungszweck(e.target.value)}
            className="rounded-md border border-stone-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="op-rechnungsnummer" className="text-xs font-medium uppercase tracking-wide text-stone-500">
            Rechnungsnummer
          </label>
          <input
            id="op-rechnungsnummer"
            type="text"
            placeholder="optional"
            value={rechnungsnummer}
            onChange={(e) => setRechnungsnummer(e.target.value)}
            className="rounded-md border border-stone-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="op-betrag" className="text-xs font-medium uppercase tracking-wide text-stone-500">
            Betrag
          </label>
          <div className="flex items-center gap-1">
            <span className="text-stone-400">€</span>
            <input
              id="op-betrag"
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={betragText}
              onChange={(e) => setBetragText(e.target.value)}
              className="w-full rounded-md border border-stone-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="op-rechnungsdatum" className="text-xs font-medium uppercase tracking-wide text-stone-500">
            Rechnungsdatum
          </label>
          <input
            id="op-rechnungsdatum"
            type="date"
            value={rechnungsdatum}
            onChange={(e) => setRechnungsdatum(e.target.value)}
            className="rounded-md border border-stone-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="op-faelligkeit" className="text-xs font-medium uppercase tracking-wide text-stone-500">
            Fällig am
          </label>
          <input
            id="op-faelligkeit"
            type="date"
            min={rechnungsdatum}
            value={faelligkeitsdatum}
            onChange={(e) => setFaelligkeitsdatum(e.target.value)}
            className="rounded-md border border-stone-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-3">
          <label htmlFor="op-notiz" className="text-xs font-medium uppercase tracking-wide text-stone-500">
            Notiz
          </label>
          <input
            id="op-notiz"
            type="text"
            placeholder="optional"
            value={notiz}
            onChange={(e) => setNotiz(e.target.value)}
            className="rounded-md border border-stone-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <button
        type="submit"
        className="self-start rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-transform duration-150 hover:bg-indigo-700 active:scale-95"
      >
        + Offenen Posten hinzufügen
      </button>
    </form>
  );
}
