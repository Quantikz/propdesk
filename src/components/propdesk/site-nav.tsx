import { Columns2, House, MoreHorizontal, Search } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/propdesk/theme-toggle";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/desk" as const, label: "Desk" },
  { to: "/firms" as const, label: "Firms" },
  { to: "/compare" as const, label: "Compare" },
  { to: "/rules" as const, label: "Rules" },
  { to: "/payouts" as const, label: "Payouts" },
];

export function TopNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-line bg-bg/90 px-4 backdrop-blur-md desk:px-8">
      <Link to="/" className="brand-name text-fg">
        PropDesk
      </Link>
      <nav className="hidden items-center gap-1 desk:flex">
        {LINKS.map((l) => {
          const on = path === l.to || path.startsWith(`${l.to}/`);
          return (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm",
                on ? "bg-paper text-ink" : "text-muted hover:text-fg",
              )}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
      <ThemeToggle />
    </header>
  );
}

export function BottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const items = [
    { to: "/" as const, label: "Home", icon: House, on: path === "/" },
    { to: "/desk" as const, label: "Desk", icon: Search, on: path.startsWith("/ask") || path.startsWith("/desk") },
    { to: "/compare" as const, label: "Compare", icon: Columns2, on: path.startsWith("/compare") },
    { to: "/firms" as const, label: "More", icon: MoreHorizontal, on: path.startsWith("/firms") || path.startsWith("/rules") || path.startsWith("/payouts") || path.startsWith("/firm") },
  ];
  return (
    <nav className="grid h-14 shrink-0 grid-cols-4 border-t border-line bg-bg/95 backdrop-blur-md desk:hidden">
      {items.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 text-[11px]",
            item.on ? "text-fg" : "text-dim",
          )}
        >
          <item.icon className="size-5" strokeWidth={1.75} />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
