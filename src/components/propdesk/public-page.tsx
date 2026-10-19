import type { ReactNode } from "react";
import { SiteFooter } from "@/components/propdesk/site-footer";

export function PublicPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="page-title">{title}</h1>
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted">{children}</div>
        <SiteFooter />
      </main>
    </div>
  );
}
