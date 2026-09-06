import { useMemo, useRef, useState } from "react";
import { formatEuro } from "../lib/format";
import { playNeutralChime, playSuccessChime } from "../lib/sound";

const DENOMINATIONS = [
  { key: "500", label: "500 €", value: 500 },
  { key: "200", label: "200 €", value: 200 },
  { key: "100", label: "100 €", value: 100 },
  { key: "50", label: "50 €", value: 50 },
  { key: "20", label: "20 €", value: 20 },
  { key: "10", label: "10 €", value: 10 },
  { key: "5", label: "5 €", value: 5 },
  { key: "2", label: "2 €", value: 2 },
  { key: "1", label: "1 €", value: 1 },
  { key: "0.5", label: "0,50 €", value: 0.5 },
  { key: "0.2", label: "0,20 €", value: 0.2 },
  { key: "0.1", label: "0,10 €", value: 0.1 },
  { key: "0.05", label: "0,05 €", value: 0.05 },
  { key: "0.02", label: "0,02 €", value: 0.02 },
  { key: "0.01", label: "0,01 €", value: 0.01 },
] as const;

const EPSILON = 0.005;

interface SavedResult {
  istBestand: number;
  differenz: number;
}

interface CashCountFormProps {
  sollBestand: number;
  soundEnabled: boolean;
  onSaveCount: (istBestand: number, denominationCounts: Record<string, number>) => void;
  onCreateAdjustment: (differenz: number) => void;
}

export function CashCountForm({ sollBestand, soundEnabled, onSaveCount, onCreateAdjustment }: CashCountFormProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  // Set once a count is saved; cleared as soon as the user starts a new
  // count, so it never gets confused with the (now reset) live totals below.
  const [savedResult, setSavedResult] = useState<SavedResult | null>(null);
  // A ref guard, not state: a rapid double-click/double-tap can fire twice
  // before a state-driven "disabled" attribute re-renders, which would post
  // two adjustment entries or save the same count twice.
  const isProcessingRef = useRef(false);

  const istBestand = useMemo(() => {
    const total = DENOMINATIONS.reduce((sum, d) => sum + d.value * (quantities[d.key] ?? 0), 0);
    return Math.round(total * 100) / 100;
  }, [quantities]);

  const differenz = Math.round((istBestand - sollBestand) * 100) / 100;
  const stimmtGenau = Math.abs(differenz) < EPSILON;

  const handleQuantityChange = (key: string, text: string) => {
    const parsed = parseInt(text, 10);
    setQuantities((prev) => ({ ...prev, [key]: Number.isFinite(parsed) && parsed >= 0 ? parsed : 0 }));
    setSavedResult(null);
  };

  // Both handlers run synchronously, so a `finally` reset would clear the
  // guard before the browser can even dispatch a second click event —
  // useless against a real double-click/double-tap. A short cooldown
  // catches that case instead, while still allowing a deliberate next click.
  const guardAgainstDoubleFire = (action: () => void) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    action();
    setTimeout(() => {
      isProcessingRef.current = false;
    }, 400);
  };

  const handleSave = () => {
    guardAgainstDoubleFire(() => {
      onSaveCount(istBestand, quantities);
      setSavedResult({ istBestand, differenz });
      if (soundEnabled) {
        if (stimmtGenau) playSuccessChime();
        else playNeutralChime();
      }
      setQuantities({});
    });
  };

  const handleAdjustment = () => {
    if (!savedResult) return;
    guardAgainstDoubleFire(() => {
      onCreateAdjustment(savedResult.differenz);
      setSavedResult(null);
    });
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-stone-200 bg-white p-4">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {DENOMINATIONS.map((d) => (
          <div key={d.key} className="flex flex-col gap-1">
            <label htmlFor={`denom-${d.key}`} className="text-xs text-stone-500">
              {d.label}
            </label>
            <input
              id={`denom-${d.key}`}
              type="number"
              min={0}
              step={1}
              value={quantities[d.key] ?? ""}
              onChange={(e) => handleQuantityChange(d.key, e.target.value)}
              placeholder="0"
              className="w-full rounded-md border border-stone-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 border-t border-stone-100 pt-4 sm:grid-cols-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Soll-Bestand</p>
          <p className="mt-1 text-lg font-semibold text-stone-700 tabular-nums">{formatEuro(sollBestand)}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Gezählt (Ist)</p>
          <p className="mt-1 text-lg font-semibold text-stone-700 tabular-nums">{formatEuro(istBestand)}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Differenz</p>
          <p className={`mt-1 text-lg font-semibold tabular-nums ${stimmtGenau ? "text-green-600" : "text-red-600"}`}>
            {stimmtGenau ? "🎉 Stimmt genau!" : formatEuro(differenz)}
          </p>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="self-start rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-transform duration-150 hover:bg-indigo-700 active:scale-95"
      >
        Zählung speichern
      </button>

      {savedResult && (
        <div
          className={`animate-op-feedback-in flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm font-medium ${
            Math.abs(savedResult.differenz) < EPSILON
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-amber-200 bg-amber-50 text-amber-700"
          }`}
        >
          <span>
            {Math.abs(savedResult.differenz) < EPSILON
              ? "🎉 Zählung gespeichert — Kasse stimmt genau!"
              : `Zählung gespeichert — Differenz von ${formatEuro(savedResult.differenz)} festgestellt.`}
          </span>
          {Math.abs(savedResult.differenz) >= EPSILON && (
            <button
              onClick={handleAdjustment}
              className="rounded-md border border-amber-400 bg-white px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100"
            >
              Als Ausgleichsbuchung übernehmen
            </button>
          )}
        </div>
      )}

      <style>{`
        @keyframes op-feedback-in {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-op-feedback-in { animation: op-feedback-in 0.35s ease-out; }
      `}</style>
    </div>
  );
}
