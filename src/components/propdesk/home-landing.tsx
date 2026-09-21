import { Link } from "@tanstack/react-router";
import { firmList } from "@/lib/propdesk/engine";
import { useDeskStore } from "@/lib/propdesk/store";

const TOOLS = [
  { n: "01", title: "Desk", to: "/desk" as const, line: "Ask one firm before you pay." },
  { n: "02", title: "Compare", to: "/compare" as const, line: "Line two to four books up." },
  { n: "03", title: "Payouts", to: "/payouts" as const, line: "See who has been paying." },
];

export function HomeLanding() {
  const firms = firmList();
  const setFirm = useDeskStore((s) => s.setFirm);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <div className="mx-auto w-full max-w-4xl px-4 py-5 desk:px-8 desk:py-7">
        <div className="flex flex-col gap-5 desk:flex-row desk:items-end desk:justify-between">
          <div className="max-w-xl">
            <p className="font-display text-[11px] tracking-[0.16em] text-dim uppercase">PropDesk</p>
            <h1 className="page-title mt-2">Rules before you buy.</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Drawdown, payouts, news, consistency. Compare the book. Then spend.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              to="/desk"
              className="inline-flex h-10 items-center rounded-md bg-paper px-4 font-display text-sm font-semibold text-ink"
            >
              Open desk
            </Link>
            <Link
              to="/compare"
              className="inline-flex h-10 items-center rounded-md border border-line px-4 font-display text-sm font-semibold"
            >
              Compare
            </Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-line bg-line">
          {TOOLS.map((t) => (
            <Link key={t.n} to={t.to} className="bg-elev px-3 py-4 hover:bg-hover desk:px-4">
              <p className="font-mono text-[11px] text-dim">{t.n}</p>
              <h2 className="mt-1 font-display text-lg font-bold tracking-tight">{t.title}</h2>
              <p className="mt-1 hidden text-xs leading-snug text-muted sm:block">{t.line}</p>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex items-end justify-between gap-3">
          <h2 className="font-display text-xl font-bold tracking-tight">Firms</h2>
          <p className="text-xs text-dim">{firms.length} on file</p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 desk:grid-cols-3">
          {firms.map((f) => (
            <Link
              key={f.id}
              to="/desk"
              onClick={() => setFirm(f.id)}
              className="flex items-center gap-2.5 rounded-md border border-line bg-elev px-3 py-3 hover:bg-hover"
            >
              <span className="size-2 shrink-0 rounded-full" style={{ background: f.color }} />
              <span className="min-w-0 truncate font-display text-sm font-semibold tracking-tight">
                {f.short}
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-8 pb-6 text-[11px] leading-relaxed text-dim">
          Independent. Confirm the current terms before you pay.
        </p>
      </div>
    </div>
  );
}
