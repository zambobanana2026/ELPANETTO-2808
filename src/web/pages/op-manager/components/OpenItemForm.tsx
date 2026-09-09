import { useState } from "react";
import { parseAmount } from "../lib/csvParser";
import { todayIso } from "../lib/format";

interface OpenItemFormProps {
  onAdd: (input: {
    glaeubiger: string;
    kategorie: string;
    verwendungszweck: string;
    iban: string;
    gesamtbetrag: number;
    monatsrate: number;
    bereitsBezahlt: number;
    startMonat: string;
    istSchneeballZiel: boolean;
    notiz: string;
  }) => void;
}

export function OpenItemForm({ onAdd }: OpenItemFormProps) {
  const [glaeubiger, setGlaeubiger] = useState("");
  const [kategorie, setKategorie] = useState("");
  const [verwendungszweck, setVerwendungszweck] = useState("");
  const [iban, setIban] = useState("");
  const [gesamtbetragText, setGesamtbetragText] = useState("");
  const [monatsrateText, setMonatsrateText] = useState("");
  const [startMonat, setStartMonat] = useState(() => todayIso().slice(0, 7));
  const [istSchneeballZiel, setIstSchneeballZiel] = useState(false);
  const [notiz, setNotiz] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (glaeubiger.trim().length === 0) {
      setError("Bitte einen Gläubiger angeben.");
      return;
    }
    const gesamtbetrag = parseAmount(gesamtbetragText);
    if (!Number.isFinite(gesamtbetrag) || gesamtbetrag <= 0) {
      setError("Bitte einen gültigen Gesamtbetrag größer als 0 angeben.");
      return;
    }
    const monatsrate = monatsrateText.trim().length > 0 ? parseAmount(monatsrateText) : 0;
    if (!Number.isFinite(monatsrate) || monatsrate < 0) {
      setError("Bitte eine gültige Monatsrate angeben.");
      return;
    }

    setError(null);
    onAdd({
      glaeubiger: glaeubiger.trim(),
      kategorie: kategorie.trim(),
      verwendungszweck: verwendungszweck.trim() || glaeubiger.trim(),
      iban: iban.trim().replace(/\s+/g, ""),
      gesamtbetrag: Math.abs(gesamtbetrag),
      monatsrate: Math.abs(monatsrate),
      bereitsBezahlt: 0,
      startMonat,
      istSchneeballZiel,
      notiz: notiz.trim(),
    });

    setGlaeubiger("");
    setKategorie("");
    setVerwendungszweck("");
    setIban("");
    setGesamtbetragText("");
    setMonatsrateText("");
    setStartMonat(todayIso().slice(0, 7));
    setIstSchneeballZiel(false);
    setNotiz("");
  };

  const fieldClass = "rounded-md border border-stone-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none";
  const labelClass = "text-xs font-medium uppercase tracking-wide text-stone-500";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="op-glaeubiger" className={labelClass}>
            Gläubiger
          </label>
          <input
            id="op-glaeubiger"
            type="text"
            placeholder="z. B. Klarna/Digistore24"
            value={glaeubiger}
            onChange={(e) => setGlaeubiger(e.target.value)}
            className={fieldClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="op-kategorie" className={labelClass}>
            Kategorie
          </label>
          <input
            id="op-kategorie"
            type="text"
            placeholder="z. B. Versicherung"
            value={kategorie}
            onChange={(e) => setKategorie(e.target.value)}
            className={fieldClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="op-verwendungszweck" className={labelClass}>
            Verwendungszweck
          </label>
          <input
            id="op-verwendungszweck"
            type="text"
            placeholder="optional"
            value={verwendungszweck}
            onChange={(e) => setVerwendungszweck(e.target.value)}
            className={fieldClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="op-iban" className={labelClass}>
            IBAN
          </label>
          <input
            id="op-iban"
            type="text"
            placeholder="optional"
            value={iban}
            onChange={(e) => setIban(e.target.value)}
            className={fieldClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="op-gesamtbetrag" className={labelClass}>
            Gesamtbetrag
          </label>
          <div className="flex items-center gap-1">
            <span className="text-stone-400">€</span>
            <input
              id="op-gesamtbetrag"
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={gesamtbetragText}
              onChange={(e) => setGesamtbetragText(e.target.value)}
              className={`w-full ${fieldClass}`}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="op-monatsrate" className={labelClass}>
            Monatsrate
          </label>
          <div className="flex items-center gap-1">
            <span className="text-stone-400">€</span>
            <input
              id="op-monatsrate"
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={monatsrateText}
              onChange={(e) => setMonatsrateText(e.target.value)}
              className={`w-full ${fieldClass}`}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="op-startmonat" className={labelClass}>
            Start-Monat
          </label>
          <input
            id="op-startmonat"
            type="month"
            value={startMonat}
            onChange={(e) => setStartMonat(e.target.value)}
            className={fieldClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className={labelClass}>Schneeball-Ziel</span>
          <label className="flex h-full items-center gap-2 text-sm text-stone-600">
            <input
              type="checkbox"
              checked={istSchneeballZiel}
              onChange={(e) => setIstSchneeballZiel(e.target.checked)}
              className="h-4 w-4 rounded border-stone-300 text-indigo-600 focus:ring-indigo-500"
            />
            🎯 Priorität
          </label>
        </div>

        <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-4">
          <label htmlFor="op-notiz" className={labelClass}>
            Notiz
          </label>
          <input
            id="op-notiz"
            type="text"
            placeholder="optional"
            value={notiz}
            onChange={(e) => setNotiz(e.target.value)}
            className={fieldClass}
          />
        </div>
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <button
        type="submit"
        className="self-start rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-transform duration-150 hover:bg-indigo-700 active:scale-95"
      >
        + Posten hinzufügen
      </button>
    </form>
  );
}
