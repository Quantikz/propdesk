import { Link, useParams } from "@tanstack/react-router";
import { FirmLogo } from "@/components/propdesk/firm-logo";
import { getFirm } from "@/lib/propdesk/engine";
import { RULES_AS_OF, firstPayout, plansFor } from "@/lib/propdesk/plans";
import { stamp } from "@/lib/propdesk/payouts";
import { useDeskStore } from "@/lib/propdesk/store";
import { firmValue } from "@/lib/propdesk/value";

export function FirmSheet() {
  const params = useParams({ strict: false }) as { firmId?: string };
  const storeFirm = useDeskStore((s) => s.firmId);
  const setFirm = useDeskStore((s) => s.setFirm);
  const id = params.firmId || storeFirm;
  const firm = getFirm(id);
  const plans = plansFor(firm.id);
  const fp = firstPayout(firm.id);
  const value = firmValue(firm.id);
  const rulesAt = stamp(RULES_AS_OF);

  if (params.firmId && params.firmId !== storeFirm) {
    setFirm(firm.id);
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <div className="mx-auto w-full max-w-3xl px-4 py-5 desk:px-8 desk:py-7">
        <div className="flex items-center gap-3">
          <FirmLogo firm={firm} size={36} />
          <div>
            <p className="font-display text-[11px] tracking-[0.14em] text-dim uppercase">Firm sheet</p>
            <h1 className="font-display text-3xl font-bold tracking-tight">{firm.name}</h1>
          </div>
        </div>
        <p className="mt-2 text-sm text-muted">{firm.notes}</p>
        <p className="mt-1 text-xs text-dim">Rules packed {rulesAt}. Confirm checkout and the live terms.</p>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            to="/desk"
            onClick={() => setFirm(firm.id)}
            className="inline-flex h-10 items-center rounded-md bg-paper px-4 font-display text-sm font-semibold text-ink"
          >
            Ask this book
          </Link>
          <Link
            to="/compare"
            className="inline-flex h-10 items-center rounded-md border border-line px-4 font-display text-sm font-semibold"
          >
            Compare
          </Link>
          <a
            href={value.terms}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center rounded-md border border-line px-4 font-display text-sm font-semibold"
          >
            Official terms
          </a>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            ["Drawdown", firm.drawdown],
            ["Split", firm.profitSplit],
            ["Payout cycle", firm.payoutCycle],
            ["Fee", value.fee],
            ["Reset", value.reset],
            ["Time to funded", value.timeToFunded],
            ["Platforms", firm.platforms.join(", ")],
            ["News", firm.news],
          ].map(([k, v]) => (
            <div key={k} className="rounded-md border border-line bg-elev px-3 py-3">
              <dt className="font-display text-[11px] tracking-[0.12em] text-dim uppercase">{k}</dt>
              <dd className="mt-1 text-sm leading-relaxed">{v}</dd>
            </div>
          ))}
        </dl>

        <h2 className="mt-8 font-display text-xl font-bold tracking-tight">Plans</h2>
        <div className="mt-3 grid gap-2">
          {plans.map((p) => (
            <div key={p.name} className="rounded-md border border-line bg-elev px-3 py-3">
              <p className="font-display font-semibold tracking-tight">
                {p.name} <span className="text-xs font-normal text-dim">({p.kind})</span>
              </p>
              <p className="mt-1 text-sm text-muted">
                Target {p.target}. Daily {p.daily}. Max {p.max}.
              </p>
              <p className="mt-1 text-xs text-dim">{p.note}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-8 font-display text-xl font-bold tracking-tight">First payout</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted">
          <li><span className="text-fg">KYC.</span> {fp.kyc}</li>
          <li><span className="text-fg">Days.</span> {fp.minDays}</li>
          <li><span className="text-fg">Consistency.</span> {fp.consistency}</li>
          <li><span className="text-fg">News.</span> {fp.news}</li>
          <li><span className="text-fg">Request.</span> {fp.request}</li>
        </ul>
      </div>
    </div>
  );
}
