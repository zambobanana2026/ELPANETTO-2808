import { useState } from "react";
import { TabNav } from "./components/TabNav";
import { BargeldTab } from "./tabs/BargeldTab";
import { KontoauszugTab } from "./tabs/KontoauszugTab";
import { OffenePostenTab } from "./tabs/OffenePostenTab";
import { PlaceholderTab } from "./tabs/PlaceholderTab";
import type { OpManagerTabId } from "./types";

export default function OpManager() {
  const [activeTab, setActiveTab] = useState<OpManagerTabId>("kontoauszug");

  return (
    <div className="min-h-screen bg-stone-100">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
          <h1 className="text-xl font-semibold tracking-tight text-stone-900 sm:text-2xl">
            💼 OP Manager
          </h1>
          <p className="text-sm text-stone-500">Kontoauszug, Bargeld und offene Posten im Griff.</p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl">
        <div className="bg-white">
          <TabNav activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {activeTab === "kontoauszug" && <KontoauszugTab />}
        {activeTab === "bargeld" && <BargeldTab />}
        {activeTab === "offene-posten" && <OffenePostenTab />}
        {activeTab === "uebersicht" && <PlaceholderTab title="Übersicht" />}
      </main>
    </div>
  );
}
