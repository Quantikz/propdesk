import { Link } from "@tanstack/react-router";
import { FirmLogo } from "@/components/propdesk/firm-logo";
import { firmList } from "@/lib/propdesk/engine";
import { useDeskStore } from "@/lib/propdesk/store";

export function HomeLanding() {
  const firms = firmList();
  const setFirm = useDeskStore((s) => s.setFirm);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 desk:px-8 desk:py-8">
        <p className="font-display text-[11px] tracking-[0.16em] text-dim uppercase">Independent research desk</p>
        <h1 className="page-title mt-2 max-w-2xl">Know the rules before you buy.</h1>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
          Read drawdown, payouts, news, and consistency. Compare books. Spend on the plan you can trade.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link to="/desk" className="inline-flex h-10 items-center rounded-md bg-paper px-4 font-display text-sm font-semibold text-ink">
            Open desk
          </Link>
          <Link to="/compare" className="inline-flex h-10 items-center rounded-md border border-line px-4 font-display text-sm font-semibold">
            Compare firms
          </Link>
          <Link to="/rules" className="inline-flex h-10 items-center rounded-md border border-line px-4 font-display text-sm font-semibold">
            Rule library
          </Link>
          <Link to="/payouts" className="inline-flex h-10 items-center rounded-md border border-line px-4 font-display text-sm font-semibold">
            Payouts
          </Link>
        </div>
        <h2 className="mt-8 font-display text-xl font-bold tracking-tight">Firms</h2>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {firms.map((f) => (
            <Link
              key={f.id}
              to="/firm/$firmId"
              params={{ firmId: f.id }}
              onClick={() => setFirm(f.id)}
              className="flex items-center gap-3 rounded-md border border-line bg-elev px-3 py-3 hover:bg-hover"
            >
              <FirmLogo firm={f} size={28} />
              <span className="min-w-0">
                <span className="block truncate font-display text-sm font-semibold tracking-tight">{f.name}</span>
                <span className="block truncate text-xs text-dim">{f.models[0]}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
