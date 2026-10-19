import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { SiteFooter } from "@/components/propdesk/site-footer";
import { ThemeToggle } from "@/components/propdesk/theme-toggle";
import { cn } from "@/lib/utils";

const LINKS = [
  ["/", "Home"],
  ["/firms", "Prop Firms"],
  ["/rules", "Rules Library"],
  ["/tools", "Tools"],
  ["/about", "About"],
  ["/contact", "Contact"],
] as const;

export function PublicPage({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="fixed inset-0 overflow-y-auto bg-bg text-fg">
      <header className="sticky top-0 z-20 flex h-12 items-center justify-between border-b border-border bg-bg px-3">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            className="grid size-9 place-items-center rounded-md text-fg hover:bg-hover"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <Link to="/" className="brand-name truncate">PropDesk</Link>
        </div>
        <ThemeToggle />
      </header>
      {open ? (
        <nav className="sticky top-12 z-20 border-b border-border bg-sidebar px-3 py-2">
          {LINKS.map(([to, label]) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={cn(
                "flex h-11 items-center rounded-md px-3 text-sm",
                path === to ? "bg-hover text-fg" : "text-muted hover:text-fg",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
      ) : null}
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="page-title">{title}</h1>
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted">{children}</div>
        <SiteFooter />
      </main>
    </div>
  );
}
