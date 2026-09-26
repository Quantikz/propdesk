import { Menu } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/propdesk/theme-toggle";
import { useDeskStore } from "@/lib/propdesk/store";

function pageLabel(path: string) {
  if (path === "/") return "Home";
  if (path.startsWith("/desk") || path.startsWith("/ask")) return "Desk";
  if (path.startsWith("/compare")) return "Compare";
  if (path.startsWith("/payouts")) return "Payouts";
  if (path.startsWith("/rules")) return "Rules";
  if (path.startsWith("/firms")) return "Firms";
  if (path.startsWith("/firm")) return "Firm";
  if (path.startsWith("/staff")) return "Staff";
  return "PropDesk";
}

export function Topbar() {
  const setSidebarOpen = useDeskStore((s) => s.setSidebarOpen);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const label = pageLabel(path);

  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border bg-bg px-3 desk:h-12 desk:px-5">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          className="grid size-9 shrink-0 place-items-center rounded-md text-fg hover:bg-hover desk:hidden"
          aria-label="Open menu"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="size-5" />
        </button>
        <Link to="/" className="brand-name truncate text-fg desk:hidden">
          PropDesk
        </Link>
        <p className="hidden font-display text-sm font-semibold tracking-tight text-muted desk:block">
          {label}
        </p>
      </div>
      <ThemeToggle />
    </header>
  );
}
