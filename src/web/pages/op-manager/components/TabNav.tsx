import type { OpManagerTabId } from "../types";

const TABS: { id: OpManagerTabId; label: string }[] = [
  { id: "kontoauszug", label: "Kontoauszug" },
  { id: "bargeld", label: "Bargeld" },
  { id: "offene-posten", label: "Offene Posten" },
  { id: "uebersicht", label: "Übersicht" },
];

interface TabNavProps {
  activeTab: OpManagerTabId;
  onChange: (tab: OpManagerTabId) => void;
}

export function TabNav({ activeTab, onChange }: TabNavProps) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-stone-200 px-2 sm:px-4">
      {TABS.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative shrink-0 px-4 sm:px-6 py-3 text-sm font-medium tracking-wide transition-colors duration-200 ${
              isActive ? "text-indigo-600" : "text-stone-500 hover:text-stone-800"
            }`}
          >
            {tab.label}
            {isActive && (
              <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
