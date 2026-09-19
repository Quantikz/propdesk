import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { CompareView } from "@/components/propdesk/compare-view";
import { Composer } from "@/components/propdesk/composer";
import { ProfileDialog } from "@/components/propdesk/profile-dialog";
import { Sidebar } from "@/components/propdesk/sidebar";
import { Thread } from "@/components/propdesk/thread";
import { Topbar } from "@/components/propdesk/topbar";
import { getFirm } from "@/lib/propdesk/engine";
import { useDeskStore } from "@/lib/propdesk/store";
import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

export function AppShell() {
  const sidebarOpen = useDeskStore((s) => s.sidebarOpen);
  const setSidebarOpen = useDeskStore((s) => s.setSidebarOpen);
  const toast = useDeskStore((s) => s.toast);
  const firmId = useDeskStore((s) => s.firmId);
  const firm = getFirm(firmId);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const comparing = path.startsWith("/compare");

  useEffect(() => {
    void useDeskStore.persist.rehydrate();
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

  return (
    <div
      className="relative flex h-dvh min-h-0 overflow-hidden bg-bg text-fg"
      style={{ "--firm": firm.color } as CSSProperties}
    >
      <aside className="relative z-10 hidden h-full w-72 shrink-0 flex-col border-r border-border desk:flex">
        <Sidebar idPrefix="desk" />
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-bg/60 backdrop-blur-sm transition-opacity duration-[var(--motion-fast)] ease-[var(--ease-smooth-out)] desk:hidden",
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setSidebarOpen(false)}
        aria-hidden={!sidebarOpen}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(18.75rem,86vw)] flex-col border-r border-border bg-sidebar shadow-[8px_0_24px_rgba(0,0,0,0.4)] transition-transform duration-[var(--motion-fast)] ease-[var(--ease-smooth-out)] desk:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-hidden={!sidebarOpen}
        {...(!sidebarOpen ? { inert: true } : {})}
      >
        <Sidebar idPrefix="mobile" onNavigate={() => setSidebarOpen(false)} />
      </aside>

      <section className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col border-l-2 border-l-[var(--firm)]">
        <Topbar comparing={comparing} />
        {comparing ? (
          <CompareView />
        ) : (
          <>
            <Thread />
            <Composer />
          </>
        )}
      </section>

      <ProfileDialog />

      <div
        role="status"
        className={cn(
          "pointer-events-none fixed bottom-[5.5rem] left-1/2 z-[60] max-w-[calc(100vw-2rem)] -translate-x-1/2 truncate rounded-sm border border-line bg-elev px-4 py-2.5 text-sm text-fg transition-opacity duration-[var(--motion-quick)] desk:bottom-6",
          toast ? "opacity-100" : "opacity-0",
        )}
      >
        {toast}
      </div>
    </div>
  );
}
