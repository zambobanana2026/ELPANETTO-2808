import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2, Upload, Download, RotateCcw, Wallet, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type AusgabenState,
  type ParsedTransaction,
  loadState,
  saveState,
  defaultState,
  newPosten,
  newBarKategorie,
  newBargeldabhebung,
  newBarBuchung,
  formatEUR,
  parseBankCsv,
  looksLikeParsableCsv,
  guessPostenMatch,
} from "@/lib/ausgaben-storage";

const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

function runningBalances(start: number, items: { ist: number }[]): number[] {
  let bal = start;
  return items.map((it) => {
    bal -= it.ist;
    return bal;
  });
}

function NumberField({
  value,
  onChange,
  className,
}: {
  value: number;
  onChange: (v: number) => void;
  className?: string;
}) {
  return (
    <input
      type="number"
      step="0.01"
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      className={cn(
        "w-24 sm:w-28 px-2 py-1.5 bg-white border border-stone-300 rounded text-right text-sm focus:outline-none focus:border-[#C9A962] transition-colors",
        className
      )}
    />
  );
}

function TextField({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "w-full px-2 py-1.5 bg-white border border-stone-300 rounded text-sm focus:outline-none focus:border-[#C9A962] transition-colors",
        className
      )}
    />
  );
}

function DateField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-2 py-1.5 bg-white border border-stone-300 rounded text-sm focus:outline-none focus:border-[#C9A962] transition-colors"
    />
  );
}

function SectionHeaderRow({ label, cols }: { label: string; cols: number }) {
  return (
    <tr className="bg-stone-900 text-white">
      <td colSpan={cols} className="px-3 py-2 text-xs font-medium tracking-[0.15em] uppercase">
        {label}
      </td>
    </tr>
  );
}

interface ImportRow {
  tx: ParsedTransaction;
  action: "ignore" | "fixkosten" | "op" | "cash";
  targetId?: string;
}

export default function Ausgaben() {
  const [state, setState] = useState<AusgabenState>(() => loadState());
  const [importRows, setImportRows] = useState<ImportRow[] | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    if (!flashMessage) return;
    const t = setTimeout(() => setFlashMessage(null), 3500);
    return () => clearTimeout(t);
  }, [flashMessage]);

  // ---- Berechnungen -------------------------------------------------------

  const fixkostenSollSum = sum(state.fixkosten.map((p) => p.soll));
  const fixkostenIstSum = sum(state.fixkosten.map((p) => p.ist));
  const opsSollSum = sum(state.ops.map((p) => p.soll));
  const opsIstSum = sum(state.ops.map((p) => p.ist));
  const abhebungSollSum = sum(state.bargeldabhebungen.map((a) => a.soll));
  const abhebungIstSum = sum(state.bargeldabhebungen.map((a) => a.ist));

  const fixkostenBalances = runningBalances(state.anfangsbestand, state.fixkosten);
  const nachFixkosten = fixkostenBalances.length
    ? fixkostenBalances[fixkostenBalances.length - 1]
    : state.anfangsbestand;
  const opsBalances = runningBalances(nachFixkosten, state.ops);
  const nachOps = opsBalances.length ? opsBalances[opsBalances.length - 1] : nachFixkosten;
  const abhebungBalances = runningBalances(nachOps, state.bargeldabhebungen);
  const endstandIst = abhebungBalances.length ? abhebungBalances[abhebungBalances.length - 1] : nachOps;
  const endstandSoll =
    state.anfangsbestand - fixkostenSollSum - opsSollSum - abhebungSollSum;

  const barIstByKategorie = (kategorieId: string) =>
    sum(state.barBuchungen.filter((b) => b.kategorieId === kategorieId).map((b) => b.betrag));
  const barSollSum = sum(state.barKategorien.map((k) => k.soll));
  const barIstSum = sum(state.barBuchungen.map((b) => b.betrag));
  const bareinnahmen = abhebungIstSum;
  const kassenbestandIst = bareinnahmen - barIstSum;
  const kassenbestandSoll = abhebungSollSum - barSollSum;

  const kategorieBalances = useMemo(() => {
    let bal = bareinnahmen;
    return state.barKategorien.map((k) => {
      bal -= barIstByKategorie(k.id);
      return bal;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.barKategorien, state.barBuchungen, bareinnahmen]);

  // ---- Update-Helfer --------------------------------------------------------

  const updateFixkosten = (id: string, patch: Partial<{ name: string; soll: number; ist: number }>) =>
    setState((s) => ({ ...s, fixkosten: s.fixkosten.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
  const updateOp = (id: string, patch: Partial<{ name: string; soll: number; ist: number }>) =>
    setState((s) => ({ ...s, ops: s.ops.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
  const removeFixkosten = (id: string) =>
    setState((s) => ({ ...s, fixkosten: s.fixkosten.filter((p) => p.id !== id) }));
  const removeOp = (id: string) => setState((s) => ({ ...s, ops: s.ops.filter((p) => p.id !== id) }));

  const updateAbhebung = (id: string, patch: Partial<{ datum: string; beschreibung: string; soll: number; ist: number }>) =>
    setState((s) => ({
      ...s,
      bargeldabhebungen: s.bargeldabhebungen.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));
  const removeAbhebung = (id: string) =>
    setState((s) => ({ ...s, bargeldabhebungen: s.bargeldabhebungen.filter((a) => a.id !== id) }));

  const updateKategorie = (id: string, patch: Partial<{ name: string; soll: number }>) =>
    setState((s) => ({
      ...s,
      barKategorien: s.barKategorien.map((k) => (k.id === id ? { ...k, ...patch } : k)),
    }));
  const removeKategorie = (id: string) =>
    setState((s) => ({
      ...s,
      barKategorien: s.barKategorien.filter((k) => k.id !== id),
      barBuchungen: s.barBuchungen.filter((b) => b.kategorieId !== id),
    }));

  const updateBuchung = (id: string, patch: Partial<{ datum: string; beschreibung: string; betrag: number; kategorieId: string }>) =>
    setState((s) => ({
      ...s,
      barBuchungen: s.barBuchungen.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    }));
  const removeBuchung = (id: string) =>
    setState((s) => ({ ...s, barBuchungen: s.barBuchungen.filter((b) => b.id !== id) }));

  // ---- CSV Import -----------------------------------------------------------

  const handleFile = async (file: File) => {
    setImportError(null);
    const text = await file.text();
    if (!looksLikeParsableCsv(text)) {
      setImportError(
        "Konnte keine Betrags-Spalte in der Datei erkennen. Bitte prüfe, ob es ein gültiger Bunq-CSV-Export ist."
      );
      return;
    }
    const txs = parseBankCsv(text);
    const allPosten = [
      ...state.fixkosten.map((p) => ({ ...p, _art: "fixkosten" as const })),
      ...state.ops.map((p) => ({ ...p, _art: "op" as const })),
    ];
    const rows: ImportRow[] = txs.map((tx) => {
      if (tx.betrag > 0) return { tx, action: "ignore" };
      if (tx.isLikelyCashWithdrawal) return { tx, action: "cash" };
      const match = guessPostenMatch(tx, allPosten);
      if (match) {
        const found = allPosten.find((p) => p.id === match.id);
        return { tx, action: found?._art ?? "ignore", targetId: match.id };
      }
      return { tx, action: "ignore" };
    });
    setImportRows(rows);
  };

  const applyImport = () => {
    if (!importRows) return;
    setState((s) => {
      let next = { ...s, fixkosten: [...s.fixkosten], ops: [...s.ops], bargeldabhebungen: [...s.bargeldabhebungen] };
      for (const row of importRows) {
        const betrag = Math.abs(row.tx.betrag);
        if (row.action === "fixkosten" && row.targetId) {
          next.fixkosten = next.fixkosten.map((p) =>
            p.id === row.targetId ? { ...p, ist: p.ist + betrag } : p
          );
        } else if (row.action === "op" && row.targetId) {
          next.ops = next.ops.map((p) => (p.id === row.targetId ? { ...p, ist: p.ist + betrag } : p));
        } else if (row.action === "cash") {
          next.bargeldabhebungen = [
            ...next.bargeldabhebungen,
            {
              id: `csv-${row.tx.id}`,
              datum: row.tx.datum || new Date().toISOString().slice(0, 10),
              beschreibung: row.tx.beschreibung || row.tx.gegenpartei || "Bargeldabhebung",
              soll: 0,
              ist: betrag,
            },
          ];
        }
      }
      return next;
    });
    const angewendet = importRows.filter((r) => r.action !== "ignore").length;
    setFlashMessage(`${angewendet} Buchung(en) aus der CSV übernommen.`);
    setImportRows(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `elpanetto-ausgaben-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      setState({ ...defaultState(), ...parsed });
      setFlashMessage("Backup wurde geladen.");
    } catch {
      setImportError("Backup-Datei konnte nicht gelesen werden.");
    }
  };

  const resetAll = () => {
    if (!window.confirm("Wirklich alle Daten zurücksetzen? Das kann nicht rückgängig gemacht werden.")) return;
    setState(defaultState());
  };

  // ---- Render ---------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 font-sans py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-light tracking-wide mb-2">
            Ausgaben <span className="text-[#C9A962]">Soll / Ist</span>
          </h1>
          <p className="text-stone-500 text-sm font-light max-w-2xl">
            Kontoauszug-Ansicht: Fixkosten, OPs und Barausgaben mit Soll- und Ist-Werten. Daten werden
            lokal in diesem Browser gespeichert (localStorage) – nichts wird an einen Server geschickt.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={exportBackup}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs uppercase tracking-wide border border-stone-300 hover:border-[#C9A962] hover:text-[#C9A962] transition-colors rounded"
            >
              <Download className="w-3.5 h-3.5" /> Backup exportieren
            </button>
            <button
              onClick={() => backupInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs uppercase tracking-wide border border-stone-300 hover:border-[#C9A962] hover:text-[#C9A962] transition-colors rounded"
            >
              <Upload className="w-3.5 h-3.5" /> Backup importieren
            </button>
            <input
              ref={backupInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importBackup(f);
              }}
            />
            <button
              onClick={resetAll}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs uppercase tracking-wide border border-stone-300 hover:border-red-500 hover:text-red-500 transition-colors rounded"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Zurücksetzen
            </button>
          </div>
          {flashMessage && (
            <div className="mt-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-3 py-2">
              {flashMessage}
            </div>
          )}
        </header>

        {/* Anfangsbestand */}
        <section className="bg-white border border-stone-200 rounded-lg p-5 mb-6">
          <h2 className="text-sm font-medium tracking-[0.15em] uppercase text-stone-500 mb-4">
            Anfangsbestand
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-xs text-stone-500 mb-1">Betrag</label>
              <NumberField
                value={state.anfangsbestand}
                onChange={(v) => setState((s) => ({ ...s, anfangsbestand: v }))}
                className="w-32"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-1">Gültig ab</label>
              <DateField
                value={state.anfangsbestandDatum}
                onChange={(v) => setState((s) => ({ ...s, anfangsbestandDatum: v }))}
              />
            </div>
          </div>
        </section>

        {/* CSV Import */}
        <section className="bg-white border border-stone-200 rounded-lg p-5 mb-6">
          <h2 className="text-sm font-medium tracking-[0.15em] uppercase text-stone-500 mb-4">
            Bunq-CSV importieren
          </h2>
          <p className="text-sm text-stone-500 mb-3 font-light">
            Lade den CSV-Kontoauszug aus der Bunq-App/-Website hoch. Ausgaben werden automatisch
            Fixkosten- bzw. OP-Posten vorgeschlagen, Geldautomaten-Abhebungen werden als
            Bargeldabhebung erkannt. Vor dem Übernehmen kannst du jede Zeile noch anpassen.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
            className="text-sm"
          />
          {importError && (
            <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {importError}
            </div>
          )}

          {importRows && importRows.length > 0 && (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-stone-500 border-b border-stone-200">
                    <th className="py-2 pr-2">Datum</th>
                    <th className="py-2 pr-2">Gegenpartei / Beschreibung</th>
                    <th className="py-2 pr-2 text-right">Betrag</th>
                    <th className="py-2 pr-2">Zuordnung</th>
                  </tr>
                </thead>
                <tbody>
                  {importRows.map((row, i) => (
                    <tr key={row.tx.id} className="border-b border-stone-100">
                      <td className="py-2 pr-2 whitespace-nowrap">{row.tx.datum || "–"}</td>
                      <td className="py-2 pr-2">
                        <div className="font-medium">{row.tx.gegenpartei || "–"}</div>
                        <div className="text-xs text-stone-500">{row.tx.beschreibung}</div>
                      </td>
                      <td
                        className={cn(
                          "py-2 pr-2 text-right whitespace-nowrap",
                          row.tx.betrag < 0 ? "text-red-600" : "text-emerald-600"
                        )}
                      >
                        {formatEUR(row.tx.betrag)}
                      </td>
                      <td className="py-2 pr-2">
                        <select
                          value={row.targetId ? `${row.action}:${row.targetId}` : row.action}
                          onChange={(e) => {
                            const val = e.target.value;
                            setImportRows((prev) => {
                              if (!prev) return prev;
                              const copy = [...prev];
                              if (val === "ignore" || val === "cash") {
                                copy[i] = { tx: row.tx, action: val as "ignore" | "cash" };
                              } else {
                                const [action, id] = val.split(":");
                                copy[i] = { tx: row.tx, action: action as "fixkosten" | "op", targetId: id };
                              }
                              return copy;
                            });
                          }}
                          className="px-2 py-1.5 bg-white border border-stone-300 rounded text-sm focus:outline-none focus:border-[#C9A962]"
                        >
                          <option value="ignore">Ignorieren</option>
                          <option value="cash">Als Bargeldabhebung</option>
                          {state.fixkosten.length > 0 && (
                            <optgroup label="Fixkosten">
                              {state.fixkosten.map((p) => (
                                <option key={p.id} value={`fixkosten:${p.id}`}>
                                  {p.name}
                                </option>
                              ))}
                            </optgroup>
                          )}
                          {state.ops.length > 0 && (
                            <optgroup label="OPs">
                              {state.ops.map((p) => (
                                <option key={p.id} value={`op:${p.id}`}>
                                  {p.name}
                                </option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={applyImport}
                  className="px-5 py-2.5 bg-stone-900 text-white text-xs font-medium tracking-[0.1em] uppercase hover:bg-[#C9A962] transition-colors rounded"
                >
                  Übernehmen
                </button>
                <button
                  onClick={() => {
                    setImportRows(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="px-5 py-2.5 border border-stone-300 text-stone-600 text-xs font-medium tracking-[0.1em] uppercase hover:border-stone-400 transition-colors rounded"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Kontoauszug: Bankkonto */}
        <section className="bg-white border border-stone-200 rounded-lg p-5 mb-6">
          <h2 className="text-sm font-medium tracking-[0.15em] uppercase text-stone-500 mb-4 flex items-center gap-2">
            <Landmark className="w-4 h-4 text-[#C9A962]" /> Kontoauszug – Bankkonto
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-stone-500 border-b border-stone-200">
                  <th className="py-2 pr-2">Bezeichnung</th>
                  <th className="py-2 pr-2 text-right">Soll</th>
                  <th className="py-2 pr-2 text-right">Ist</th>
                  <th className="py-2 pr-2 text-right">Kontostand (Ist)</th>
                  <th className="py-2 pl-2 w-8"></th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-stone-100 bg-stone-50 font-medium">
                  <td className="py-2 pr-2">Anfangsbestand ({state.anfangsbestandDatum})</td>
                  <td className="py-2 pr-2 text-right">{formatEUR(state.anfangsbestand)}</td>
                  <td className="py-2 pr-2 text-right">{formatEUR(state.anfangsbestand)}</td>
                  <td className="py-2 pr-2 text-right">{formatEUR(state.anfangsbestand)}</td>
                  <td></td>
                </tr>

                <SectionHeaderRow label="Fixkosten" cols={5} />
                {state.fixkosten.map((p, i) => (
                  <tr key={p.id} className="border-b border-stone-100">
                    <td className="py-2 pr-2">
                      <TextField value={p.name} onChange={(v) => updateFixkosten(p.id, { name: v })} />
                    </td>
                    <td className="py-2 pr-2 text-right">
                      <NumberField value={p.soll} onChange={(v) => updateFixkosten(p.id, { soll: v })} />
                    </td>
                    <td className="py-2 pr-2 text-right">
                      <NumberField value={p.ist} onChange={(v) => updateFixkosten(p.id, { ist: v })} />
                    </td>
                    <td className="py-2 pr-2 text-right whitespace-nowrap">{formatEUR(fixkostenBalances[i])}</td>
                    <td className="py-2 pl-2">
                      <button onClick={() => removeFixkosten(p.id)} className="text-stone-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="border-b border-stone-200">
                  <td colSpan={5} className="py-2">
                    <button
                      onClick={() => setState((s) => ({ ...s, fixkosten: [...s.fixkosten, newPosten("Neuer Fixkosten-Posten")] }))}
                      className="inline-flex items-center gap-1 text-xs text-[#C9A962] hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" /> Fixkosten-Posten hinzufügen
                    </button>
                  </td>
                </tr>
                <tr className="border-b border-stone-200 font-medium bg-stone-50">
                  <td className="py-2 pr-2">Summe Fixkosten</td>
                  <td className="py-2 pr-2 text-right">{formatEUR(fixkostenSollSum)}</td>
                  <td className="py-2 pr-2 text-right">{formatEUR(fixkostenIstSum)}</td>
                  <td className="py-2 pr-2 text-right">{formatEUR(nachFixkosten)}</td>
                  <td></td>
                </tr>

                <SectionHeaderRow label="OPs" cols={5} />
                {state.ops.map((p, i) => (
                  <tr key={p.id} className="border-b border-stone-100">
                    <td className="py-2 pr-2">
                      <TextField value={p.name} onChange={(v) => updateOp(p.id, { name: v })} />
                    </td>
                    <td className="py-2 pr-2 text-right">
                      <NumberField value={p.soll} onChange={(v) => updateOp(p.id, { soll: v })} />
                    </td>
                    <td className="py-2 pr-2 text-right">
                      <NumberField value={p.ist} onChange={(v) => updateOp(p.id, { ist: v })} />
                    </td>
                    <td className="py-2 pr-2 text-right whitespace-nowrap">{formatEUR(opsBalances[i])}</td>
                    <td className="py-2 pl-2">
                      <button onClick={() => removeOp(p.id)} className="text-stone-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="border-b border-stone-200">
                  <td colSpan={5} className="py-2">
                    <button
                      onClick={() => setState((s) => ({ ...s, ops: [...s.ops, newPosten("Neuer OP-Posten")] }))}
                      className="inline-flex items-center gap-1 text-xs text-[#C9A962] hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" /> OP-Posten hinzufügen
                    </button>
                  </td>
                </tr>
                <tr className="border-b border-stone-200 font-medium bg-stone-50">
                  <td className="py-2 pr-2">Summe OPs</td>
                  <td className="py-2 pr-2 text-right">{formatEUR(opsSollSum)}</td>
                  <td className="py-2 pr-2 text-right">{formatEUR(opsIstSum)}</td>
                  <td className="py-2 pr-2 text-right">{formatEUR(nachOps)}</td>
                  <td></td>
                </tr>

                <SectionHeaderRow label="Bargeldabhebungen" cols={5} />
                {state.bargeldabhebungen.map((a, i) => (
                  <tr key={a.id} className="border-b border-stone-100">
                    <td className="py-2 pr-2">
                      <div className="flex flex-col gap-1">
                        <TextField value={a.beschreibung} onChange={(v) => updateAbhebung(a.id, { beschreibung: v })} />
                        <DateField value={a.datum} onChange={(v) => updateAbhebung(a.id, { datum: v })} />
                      </div>
                    </td>
                    <td className="py-2 pr-2 text-right align-top">
                      <NumberField value={a.soll} onChange={(v) => updateAbhebung(a.id, { soll: v })} />
                    </td>
                    <td className="py-2 pr-2 text-right align-top">
                      <NumberField value={a.ist} onChange={(v) => updateAbhebung(a.id, { ist: v })} />
                    </td>
                    <td className="py-2 pr-2 text-right align-top whitespace-nowrap">{formatEUR(abhebungBalances[i])}</td>
                    <td className="py-2 pl-2 align-top">
                      <button onClick={() => removeAbhebung(a.id)} className="text-stone-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="border-b border-stone-200">
                  <td colSpan={5} className="py-2">
                    <button
                      onClick={() => setState((s) => ({ ...s, bargeldabhebungen: [...s.bargeldabhebungen, newBargeldabhebung()] }))}
                      className="inline-flex items-center gap-1 text-xs text-[#C9A962] hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" /> Bargeldabhebung hinzufügen
                    </button>
                  </td>
                </tr>
                <tr className="border-b border-stone-200 font-medium bg-stone-50">
                  <td className="py-2 pr-2">Summe Bargeldabhebungen</td>
                  <td className="py-2 pr-2 text-right">{formatEUR(abhebungSollSum)}</td>
                  <td className="py-2 pr-2 text-right">{formatEUR(abhebungIstSum)}</td>
                  <td className="py-2 pr-2 text-right">{formatEUR(endstandIst)}</td>
                  <td></td>
                </tr>

                <tr className="bg-stone-900 text-white font-medium">
                  <td className="py-3 pr-2">Endstand Bankkonto</td>
                  <td className="py-3 pr-2 text-right">{formatEUR(endstandSoll)}</td>
                  <td className="py-3 pr-2 text-right">{formatEUR(endstandIst)}</td>
                  <td className="py-3 pr-2 text-right">{formatEUR(endstandIst)}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Kasse / Barausgaben */}
        <section className="bg-white border border-stone-200 rounded-lg p-5 mb-6">
          <h2 className="text-sm font-medium tracking-[0.15em] uppercase text-stone-500 mb-4 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-[#C9A962]" /> Kasse – Barausgaben nach Kategorie
          </h2>
          <p className="text-sm text-stone-500 mb-4 font-light">
            Bareinnahmen = Summe der Bargeldabhebungen vom Konto (oben). Davon werden die
            Barausgaben je Kategorie abgezogen – der Kontostand des Bankkontos wird dadurch nicht
            nochmal verändert, da das Geld ja schon abgehoben wurde.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-stone-500 border-b border-stone-200">
                  <th className="py-2 pr-2">Kategorie</th>
                  <th className="py-2 pr-2 text-right">Soll</th>
                  <th className="py-2 pr-2 text-right">Ist</th>
                  <th className="py-2 pr-2 text-right">Kassenstand</th>
                  <th className="py-2 pl-2 w-8"></th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-stone-100 bg-stone-50 font-medium">
                  <td className="py-2 pr-2">Bareinnahmen (Abhebungen)</td>
                  <td className="py-2 pr-2 text-right">{formatEUR(abhebungSollSum)}</td>
                  <td className="py-2 pr-2 text-right">{formatEUR(bareinnahmen)}</td>
                  <td className="py-2 pr-2 text-right">{formatEUR(bareinnahmen)}</td>
                  <td></td>
                </tr>
                {state.barKategorien.map((k, i) => (
                  <tr key={k.id} className="border-b border-stone-100">
                    <td className="py-2 pr-2">
                      <TextField value={k.name} onChange={(v) => updateKategorie(k.id, { name: v })} />
                    </td>
                    <td className="py-2 pr-2 text-right">
                      <NumberField value={k.soll} onChange={(v) => updateKategorie(k.id, { soll: v })} />
                    </td>
                    <td className="py-2 pr-2 text-right whitespace-nowrap">{formatEUR(barIstByKategorie(k.id))}</td>
                    <td className="py-2 pr-2 text-right whitespace-nowrap">{formatEUR(kategorieBalances[i])}</td>
                    <td className="py-2 pl-2">
                      <button onClick={() => removeKategorie(k.id)} className="text-stone-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="border-b border-stone-200">
                  <td colSpan={5} className="py-2">
                    <button
                      onClick={() => setState((s) => ({ ...s, barKategorien: [...s.barKategorien, newBarKategorie()] }))}
                      className="inline-flex items-center gap-1 text-xs text-[#C9A962] hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" /> Kategorie hinzufügen
                    </button>
                  </td>
                </tr>
                <tr className="bg-stone-900 text-white font-medium">
                  <td className="py-3 pr-2">Kassenbestand</td>
                  <td className="py-3 pr-2 text-right">{formatEUR(kassenbestandSoll)}</td>
                  <td className="py-3 pr-2 text-right">{formatEUR(kassenbestandIst)}</td>
                  <td className="py-3 pr-2 text-right">{formatEUR(kassenbestandIst)}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Einzelne Barausgaben-Buchungen */}
          <div className="mt-8">
            <h3 className="text-xs font-medium tracking-[0.15em] uppercase text-stone-500 mb-3">
              Einzelne Barausgaben
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-stone-500 border-b border-stone-200">
                    <th className="py-2 pr-2">Datum</th>
                    <th className="py-2 pr-2">Kategorie</th>
                    <th className="py-2 pr-2">Beschreibung</th>
                    <th className="py-2 pr-2 text-right">Betrag</th>
                    <th className="py-2 pl-2 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {state.barBuchungen.map((b) => (
                    <tr key={b.id} className="border-b border-stone-100">
                      <td className="py-2 pr-2">
                        <DateField value={b.datum} onChange={(v) => updateBuchung(b.id, { datum: v })} />
                      </td>
                      <td className="py-2 pr-2">
                        <select
                          value={b.kategorieId}
                          onChange={(e) => updateBuchung(b.id, { kategorieId: e.target.value })}
                          className="px-2 py-1.5 bg-white border border-stone-300 rounded text-sm focus:outline-none focus:border-[#C9A962]"
                        >
                          {state.barKategorien.map((k) => (
                            <option key={k.id} value={k.id}>
                              {k.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 pr-2">
                        <TextField value={b.beschreibung} onChange={(v) => updateBuchung(b.id, { beschreibung: v })} placeholder="z. B. Einkauf" />
                      </td>
                      <td className="py-2 pr-2 text-right">
                        <NumberField value={b.betrag} onChange={(v) => updateBuchung(b.id, { betrag: v })} />
                      </td>
                      <td className="py-2 pl-2">
                        <button onClick={() => removeBuchung(b.id)} className="text-stone-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                onClick={() =>
                  setState((s) => ({
                    ...s,
                    barBuchungen: [...s.barBuchungen, newBarBuchung(s.barKategorien[0]?.id ?? "")],
                  }))
                }
                disabled={state.barKategorien.length === 0}
                className="mt-3 inline-flex items-center gap-1 text-xs text-[#C9A962] hover:underline disabled:opacity-40 disabled:pointer-events-none"
              >
                <Plus className="w-3.5 h-3.5" /> Barausgabe hinzufügen
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
