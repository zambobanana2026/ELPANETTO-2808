import { useEffect, useState } from "react";
import { parseAmount } from "../lib/csvParser";
import { computeRestbetrag, deriveItemStatus, STATUS_LABELS, STATUS_STYLES } from "../lib/openItems";
import { formatEuro } from "../lib/format";
import type { OpenItem } from "../types";

const fieldClass = "rounded border border-stone-200 bg-transparent px-1.5 py-1 text-sm focus:border-indigo-500 focus:outline-none";

// Always an editable input, committing on blur/Enter — every field of an
// open item stays directly correctable, never locked into read-only text.
function EditableTextCell({
  value,
  onCommit,
  placeholder,
  width = "w-32",
}: {
  value: string;
  onCommit: (value: string) => void;
  placeholder?: string;
  width?: string;
}) {
  const [draft, setDraft] = useState(value || "");
  useEffect(() => setDraft(value || ""), [value]);
  const commit = () => {
    if (draft === (value || "")) return;
    onCommit(draft);
  };
  return (
    <input
      type="text"
      value={draft}
      placeholder={placeholder}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
      className={`${fieldClass} ${width}`}
    />
  );
}

function EditableAmountCell({ value, onCommit, width = "w-20" }: { value: number; onCommit: (value: number) => void; width?: string }) {
  const [text, setText] = useState(() => String(value));
  useEffect(() => setText(String(value)), [value]);
  const commit = () => {
    const parsed = parseAmount(text);
    if (Number.isFinite(parsed)) onCommit(Math.round(Math.abs(parsed) * 100) / 100);
    else setText(String(value));
  };
  return (
    <div className="flex items-center gap-1">
      <span className="text-stone-400">€</span>
      <input
        type="text"
        inputMode="decimal"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          }
        }}
        className={`${fieldClass} text-right tabular-nums ${width}`}
      />
    </div>
  );
}

interface OpenItemsTableProps {
  items: OpenItem[];
  onUpdateField: <K extends keyof OpenItem>(id: string, field: K, value: OpenItem[K]) => void;
  onMarkPaidOff: (id: string) => void;
  onDelete: (id: string) => void;
}

export function OpenItemsTable({ items, onUpdateField, onMarkPaidOff, onDelete }: OpenItemsTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-stone-300 bg-white py-16 text-center text-stone-400">
        Noch keine offenen Posten erfasst.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
      <table className="w-full min-w-[1180px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-stone-200 bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
            <th className="px-3 py-3 font-medium">🎯</th>
            <th className="px-3 py-3 font-medium">Gläubiger / IBAN</th>
            <th className="px-3 py-3 font-medium">Kategorie</th>
            <th className="px-3 py-3 font-medium">Verwendungszweck</th>
            <th className="px-3 py-3 font-medium text-right">Gesamtbetrag</th>
            <th className="px-3 py-3 font-medium text-right">Bereits bezahlt</th>
            <th className="px-3 py-3 font-medium text-right">Restbetrag</th>
            <th className="px-3 py-3 font-medium text-right">Monatsrate</th>
            <th className="px-3 py-3 font-medium">Start</th>
            <th className="px-3 py-3 font-medium">Notiz</th>
            <th className="px-3 py-3 font-medium">Status</th>
            <th className="px-3 py-3 font-medium text-right">Aktion</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const status = deriveItemStatus(item);
            const restbetrag = computeRestbetrag(item);
            return (
              <tr key={item.id} className="border-b border-stone-100 last:border-0">
                <td className="px-3 py-2.5 text-center">
                  <input
                    type="checkbox"
                    checked={Boolean(item.istSchneeballZiel)}
                    onChange={(e) => onUpdateField(item.id, "istSchneeballZiel", e.target.checked)}
                    title="Als Schneeball-Ziel priorisieren"
                    className="h-4 w-4 rounded border-stone-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex flex-col gap-1">
                    <EditableTextCell value={item.glaeubiger} onCommit={(v) => onUpdateField(item.id, "glaeubiger", v)} width="w-36" />
                    <EditableTextCell
                      value={item.iban}
                      onCommit={(v) => onUpdateField(item.id, "iban", v.replace(/\s+/g, ""))}
                      placeholder="IBAN (optional)"
                      width="w-36"
                    />
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <EditableTextCell value={item.kategorie} onCommit={(v) => onUpdateField(item.id, "kategorie", v)} width="w-28" />
                </td>
                <td className="px-3 py-2.5">
                  <EditableTextCell value={item.verwendungszweck} onCommit={(v) => onUpdateField(item.id, "verwendungszweck", v)} width="w-40" />
                </td>
                <td className="px-3 py-2.5 text-right">
                  <EditableAmountCell value={item.gesamtbetrag} onCommit={(v) => onUpdateField(item.id, "gesamtbetrag", v)} />
                </td>
                <td className="px-3 py-2.5 text-right">
                  <EditableAmountCell value={item.bereitsBezahlt} onCommit={(v) => onUpdateField(item.id, "bereitsBezahlt", v)} />
                </td>
                <td className={`px-3 py-2.5 text-right font-medium tabular-nums ${restbetrag > 0 ? "text-stone-800" : "text-green-600"}`}>
                  {formatEuro(restbetrag)}
                </td>
                <td className="px-3 py-2.5 text-right">
                  <EditableAmountCell value={item.monatsrate} onCommit={(v) => onUpdateField(item.id, "monatsrate", v)} />
                </td>
                <td className="px-3 py-2.5">
                  <input
                    type="month"
                    value={item.startMonat}
                    onChange={(e) => onUpdateField(item.id, "startMonat", e.target.value)}
                    className={`${fieldClass} w-28 tabular-nums`}
                  />
                </td>
                <td className="px-3 py-2.5">
                  <EditableTextCell value={item.notiz} onCommit={(v) => onUpdateField(item.id, "notiz", v)} placeholder="–" width="w-32" />
                </td>
                <td className="px-3 py-2.5">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}>{STATUS_LABELS[status]}</span>
                </td>
                <td className="px-3 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {status === "aktiv" && (
                      <button
                        onClick={() => onMarkPaidOff(item.id)}
                        title="Restbetrag auf 0 setzen"
                        className="rounded-md border border-green-300 bg-green-50 px-2 py-1 text-xs font-medium text-green-700 transition-colors hover:bg-green-100"
                      >
                        ✓ Abbezahlt
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (window.confirm(`"${item.glaeubiger}" wirklich entfernen?`)) onDelete(item.id);
                      }}
                      className="text-xs font-medium text-stone-400 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
