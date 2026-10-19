import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/propdesk/site-footer";
import { ThemeToggle } from "@/components/propdesk/theme-toggle";

const LINKS = [
  ["/", "Home"],
  ["/firms", "Prop Firms"],
  ["/rules", "Rules Library"],
  ["/tools", "Tools"],
  ["/about", "About"],
  ["/contact", "Contact"],
] as const;

export function PublicPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="fixed inset-0 overflow-y-auto bg-bg text-fg">
      <header className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-3 px-4">
          <Link to="/" className="brand-name">PropDesk</Link>
          <nav className="hidden gap-1 sm:flex">
            {LINKS.map(([to, label]) => (
              <Link key={to} to={to} className="rounded-full px-3 py-1.5 text-sm text-muted hover:text-fg">{label}</Link>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="page-title">{title}</h1>
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted">{children}</div>
        <SiteFooter />
      </main>
    </div>
  );
}
