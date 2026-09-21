import { Menu } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/propdesk/theme-toggle";
import { useDeskStore } from "@/lib/propdesk/store";

export function Topbar() {
  const setSidebarOpen = useDeskStore((s) => s.setSidebarOpen);

  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border bg-bg px-3 desk:h-14 desk:px-5">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          className="grid size-9 shrink-0 place-items-center rounded-md text-fg hover:bg-hover desk:hidden"
          aria-label="Open menu"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="size-5" />
        </button>
        <Link to="/" className="brand-name truncate text-fg">
          PropDesk
        </Link>
      </div>
      <ThemeToggle />
    </header>
  );
}
