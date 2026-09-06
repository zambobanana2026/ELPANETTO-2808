import { useRef, useState } from "react";
import { parseBankCsv } from "../lib/csvParser";
import { playNeutralChime, playSuccessChime } from "../lib/sound";
import type { ImportResult } from "../types";

interface CsvImporterProps {
  onFileParsed: (rows: ReturnType<typeof parseBankCsv>) => ImportResult;
  soundEnabled: boolean;
}

interface Feedback {
  kind: "success" | "empty" | "error";
  message: string;
}

export function CsvImporter({ onFileParsed, soundEnabled }: CsvImporterProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFile = async (file: File) => {
    setIsProcessing(true);
    setFeedback(null);
    try {
      const text = await file.text();
      const rows = parseBankCsv(text);
      const result = onFileParsed(rows);

      if (result.added.length > 0) {
        setFeedback({
          kind: "success",
          message:
            result.duplicateCount > 0
              ? `🎉 ${result.added.length} neue Buchungen importiert, ${result.duplicateCount} Duplikate übersprungen.`
              : `🎉 ${result.added.length} neue Buchungen importiert!`,
        });
        if (soundEnabled) playSuccessChime();
      } else if (result.totalRows === 0) {
        setFeedback({ kind: "error", message: "Es konnten keine Buchungen aus dieser Datei erkannt werden." });
        if (soundEnabled) playNeutralChime();
      } else {
        setFeedback({ kind: "empty", message: "Alle Buchungen aus dieser Datei wurden bereits importiert." });
        if (soundEnabled) playNeutralChime();
      }
    } catch {
      setFeedback({ kind: "error", message: "Die Datei konnte nicht gelesen werden." });
    } finally {
      setIsProcessing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={isProcessing}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-transform duration-150 hover:bg-indigo-700 active:scale-95 disabled:opacity-60"
        >
          {isProcessing ? "Importiere…" : "📄 CSV-Kontoauszug importieren"}
        </button>
      </div>

      {feedback && (
        <div
          key={feedback.message}
          className={`animate-op-feedback-in rounded-lg px-4 py-3 text-sm font-medium ${
            feedback.kind === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : feedback.kind === "empty"
                ? "bg-amber-50 text-amber-700 border border-amber-200"
                : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {feedback.message}
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
