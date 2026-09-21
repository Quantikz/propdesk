import { Link } from "@tanstack/react-router";
import { firmList } from "@/lib/propdesk/engine";
import { useDeskStore } from "@/lib/propdesk/store";

export function HomeLanding() {
  const firms = firmList();
  const setFirm = useDeskStore((s) => s.setFirm);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 desk:px-6 desk:py-8">
        <p className="text-[11px] tracking-[0.14em] text-dim uppercase">Independent research desk</p>
        <h1 className="page-title mt-3 max-w-3xl">
          Know every rule before you buy a challenge.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
          PropDesk is not firm support. Read drawdown, payouts, news, and consistency
          first. Compare books. Spend on the plan you can actually trade.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            to="/desk"
            className="inline-flex min-h-12 items-center rounded-md bg-paper px-4 text-sm font-medium text-ink hover:bg-accent-hover"
          >
            Ask a firm
          </Link>
          <Link
            to="/compare"
            className="inline-flex min-h-12 items-center rounded-md border border-line bg-elev px-4 text-sm font-medium hover:bg-hover"
          >
            Compare firms
          </Link>
        </div>

        <section className="mt-10 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-line bg-elev p-4">
            <h2 className="font-display text-xl font-bold tracking-tight">Desk</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              One firm at a time. Ask what the current book actually says before you pay the fee.
            </p>
          </div>
          <div className="rounded-lg border border-line bg-elev p-4">
            <h2 className="font-display text-xl font-bold tracking-tight">Compare</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Two to four firms side by side on the rules that change the trade: loss limits, news, split.
            </p>
          </div>
          <div className="rounded-lg border border-line bg-elev p-4">
            <h2 className="font-display text-xl font-bold tracking-tight">Payouts</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Who has been paying. Use it to judge the fee, not as a ticket to their support inbox.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold tracking-tight">Firms on the desk</h2>
          <p className="mt-2 text-sm text-muted">Tap one to open the desk on that book.</p>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {firms.map((f) => (
              <Link
                key={f.id}
                to="/desk"
                onClick={() => setFirm(f.id)}
                className="rounded-lg border border-line bg-elev p-4 text-left hover:border-paper/40"
              >
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full" style={{ background: f.color }} />
                  <span className="font-medium">{f.name}</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-dim">{f.drawdown}</p>
              </Link>
            ))}
          </div>
        </section>

        <p className="mt-10 pb-8 text-xs leading-relaxed text-dim">
          PropDesk is independent. Confirm numbers on the firm’s current terms before you pay.
        </p>
      </div>
    </div>
  );
}
