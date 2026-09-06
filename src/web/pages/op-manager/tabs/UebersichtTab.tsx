import { useMemo, useState } from "react";
import { OverviewSummaryCards } from "../components/OverviewSummaryCards";
import { RecentActivityList } from "../components/RecentActivityList";
import { UpcomingDueList } from "../components/UpcomingDueList";
import { computeSummary } from "../lib/balance";
import { computeCashSummary } from "../lib/cashBalance";
import { loadCashState } from "../lib/cashStorage";
import { computeOverviewSummary, buildRecentActivity } from "../lib/overview";
import { computeOpenItemsSummary, sortOpenItems } from "../lib/openItems";
import { loadOpenItemsState } from "../lib/openItemsStorage";
import { loadState } from "../lib/storage";

export function UebersichtTab() {
  // Read-only snapshot of the other three tabs' saved data. Each tab owns
  // and persists its own state independently; this tab just aggregates a
  // fresh snapshot whenever it mounts (i.e. whenever the user switches to
  // it), rather than duplicating their state management.
  const [kontoauszugState] = useState(() => loadState());
  const [cashState] = useState(() => loadCashState());
  const [openItemsState] = useState(() => loadOpenItemsState());

  const kontoauszugSummary = useMemo(
    () => computeSummary(kontoauszugState.transactions, kontoauszugState.anfangsbestand, kontoauszugState.startDatum),
    [kontoauszugState]
  );
  const cashSummary = useMemo(
    () => computeCashSummary(cashState.entries, cashState.anfangsbestand, cashState.startDatum),
    [cashState]
  );
  const openItemsSummary = useMemo(() => computeOpenItemsSummary(openItemsState.items), [openItemsState]);
  const overviewSummary = useMemo(
    () => computeOverviewSummary(kontoauszugSummary, cashSummary, openItemsSummary),
    [kontoauszugSummary, cashSummary, openItemsSummary]
  );

  const sortedOpenItems = useMemo(() => sortOpenItems(openItemsState.items), [openItemsState]);
  const recentActivity = useMemo(
    () => buildRecentActivity(kontoauszugState.transactions, cashState.entries),
    [kontoauszugState, cashState]
  );

  return (
    <div className="flex flex-col gap-8 p-4 sm:p-6">
      <OverviewSummaryCards summary={overviewSummary} />

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">📅 Nächste Fälligkeiten</h2>
        <UpcomingDueList items={sortedOpenItems} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">🕓 Letzte Bewegungen</h2>
        <RecentActivityList entries={recentActivity} />
      </section>
    </div>
  );
}
