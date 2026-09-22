import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { CompareView } from "@/components/propdesk/compare-view";
import { Composer } from "@/components/propdesk/composer";
import { FirmSheet } from "@/components/propdesk/firm-sheet";
import { FirmsView } from "@/components/propdesk/firms-view";
import { HomeLanding } from "@/components/propdesk/home-landing";
import { PayoutsView } from "@/components/propdesk/payouts-view";
import { RulesView } from "@/components/propdesk/rules-view";
import { BottomNav, TopNav } from "@/components/propdesk/site-nav";
import { Thread } from "@/components/propdesk/thread";
import { hydrateCatalog } from "@/lib/propdesk/catalog-cache";
import { getCatalog } from "@/lib/propdesk/catalog";
import { useDeskStore } from "@/lib/propdesk/store";

export function AppShell() {
  const toast = useDeskStore((s) => s.toast);
  const [, setCatalogTick] = useState(0);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const asking = path.startsWith("/ask") || path.startsWith("/desk");

  useEffect(() => {
    void useDeskStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    void getCatalog()
      .then((cat) => {
        if (cat?.firms?.length) {
          hydrateCatalog(cat);
          setCatalogTick((n) => n + 1);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="relative flex h-dvh min-h-0 flex-col overflow-hidden bg-bg text-fg">
      <TopNav />
      <section className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        {path === "/" ? (
          <HomeLanding />
        ) : path.startsWith("/compare") ? (
          <CompareView />
        ) : path.startsWith("/payouts") ? (
          <PayoutsView />
        ) : path.startsWith("/firm") ? (
          <FirmSheet />
        ) : path.startsWith("/firms") ? (
          <FirmsView />
        ) : path.startsWith("/rules") ? (
          <RulesView />
        ) : asking ? (
          <>
            <Thread />
            <Composer />
          </>
        ) : (
          <HomeLanding />
        )}
      </section>
      <BottomNav />
      {toast ? (
        <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-paper px-4 py-2 text-sm text-ink desk:bottom-6">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
