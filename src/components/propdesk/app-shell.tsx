import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { CompareView } from "@/components/propdesk/compare-view";
import { Composer } from "@/components/propdesk/composer";
import { FirmSheet } from "@/components/propdesk/firm-sheet";
import { FirmsView } from "@/components/propdesk/firms-view";
import { HomeLanding } from "@/components/propdesk/home-landing";
import { RulesView } from "@/components/propdesk/rules-view";
import { PayoutsView } from "@/components/propdesk/payouts-view";
import { Sidebar } from "@/components/propdesk/sidebar";
import { Thread } from "@/components/propdesk/thread";
import { Topbar } from "@/components/propdesk/topbar";
import { hydrateCatalog } from "@/lib/propdesk/catalog-cache";
import { getCatalog } from "@/lib/propdesk/catalog";
import { getFirm } from "@/lib/propdesk/engine";
import { useDeskStore } from "@/lib/propdesk/store";
import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

export function AppShell() {
  const sidebarOpen = useDeskStore((s) => s.sidebarOpen);
  const setSidebarOpen = useDeskStore((s) => s.setSidebarOpen);
  const toast = useDeskStore((s) => s.toast);
  const firmId = useDeskStore((s) => s.firmId);
  const [, setCatalogTick] = useState(0);
  const firm = getFirm(firmId);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const home = path === "/";
  const comparing = path.startsWith("/compare");
  const payouts = path.startsWith("/payouts");
  const sheet = path.startsWith("/firm");
  const firms = path.startsWith("/firms");
  const rules = path.startsWith("/rules");

  useEffect(() => {
    void useDeskStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    const page = home
      ? "Understand the rules before you buy"
      : comparing
        ? "Compare firms"
        : payouts
          ? "Who actually paid"
          : rules
            ? "Explain this rule"
            : firms
              ? "Firms"
              : sheet
                ? firm.name
                : "Ask PropDesk";
    document.title = `${page} · PropDesk`;
  }, [home, comparing, payouts, rules, firms, sheet, firm.name]);

  useEffect(() => {
    void getCatalog()
      .then((cat) => {
        if (cat?.firms?.length) {
          hydrateCatalog(cat);
          setCatalogTick((n) => n + 1);
        }
      })
      .catch(() => {
        /* packed fallback in engine */
      });
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSidebarOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSidebarOpen]);

  useEffect(() => {
    function onResize() {
      if (window.matchMedia("(min-width: 900px)").matches) {
        setSidebarOpen(false);
      }
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [setSidebarOpen]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, [sidebarOpen]);

  return (
    <div
      className="relative flex h-dvh min-h-0 overflow-hidden bg-bg text-fg"
      style={{ "--firm": firm.color } as CSSProperties}
    >
      <aside className="relative z-10 hidden h-full w-80 shrink-0 flex-col border-r border-border desk:flex">
        <Sidebar idPrefix="desk" />
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-40 overflow-hidden overscroll-none bg-bg/60 backdrop-blur-sm transition-opacity duration-[var(--motion-fast)] ease-[var(--ease-smooth-out)] desk:hidden",
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setSidebarOpen(false)}
        aria-hidden={!sidebarOpen}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(20rem,90vw)] flex-col overflow-hidden border-r border-border bg-sidebar shadow-[8px_0_24px_rgba(0,0,0,0.12)] transition-transform duration-[var(--motion-fast)] ease-[var(--ease-smooth-out)] desk:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-hidden={!sidebarOpen}
        {...(!sidebarOpen ? { inert: true } : {})}
      >
        <Sidebar idPrefix="mobile" onNavigate={() => setSidebarOpen(false)} />
      </aside>

      <section className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col bg-bg">
        <Topbar />
        {home ? (
          <HomeLanding />
        ) : comparing ? (
          <CompareView />
        ) : payouts ? (
          <PayoutsView />
        ) : sheet ? (
          <FirmSheet />
        ) : firms ? (
          <FirmsView />
        ) : rules ? (
          <RulesView />
        ) : (
          <>
            <Thread />
            <Composer />
          </>
        )}
      </section>

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-md bg-paper px-4 py-2 font-display text-sm text-ink shadow-lg">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
