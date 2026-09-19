import { ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { SUGGESTS, getFirm } from "@/lib/propdesk/engine";
import { firstPayout, plansFor } from "@/lib/propdesk/plans";
import { useDeskStore } from "@/lib/propdesk/store";

export function EmptyState() {
  const firmId = useDeskStore((s) => s.firmId);
  const send = useDeskStore((s) => s.send);
  const sending = useDeskStore((s) => s.sending);
  const firm = getFirm(firmId);
  const fp = firstPayout(firmId);
  const plans = plansFor(firmId);

  return (
    <div className="flex w-full flex-1 flex-col justify-start rounded-xl border border-line bg-elev px-4 py-5 desk:justify-center desk:px-6 desk:py-7">
      <p className="text-[11px] tracking-[0.14em] text-dim uppercase">{firm.short} · 24/7 FAQ</p>
      <h2 className="page-title mt-2 max-w-lg">
        Ask anything about {firm.name}
      </h2>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">
        Open around the clock. Replies in seconds. Rules, payouts, drawdown, which plan
        fits you. This desk answers questions — tickets come later.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          to="/compare"
          className="inline-flex min-h-11 items-center rounded-md border border-line bg-elev px-3.5 text-sm font-medium hover:bg-hover"
        >
          Compare firms
        </Link>
        <Link
          to="/payouts"
          className="inline-flex min-h-11 items-center rounded-md border border-line bg-elev px-3.5 text-sm font-medium hover:bg-hover"
        >
          Payouts issued
        </Link>
      </div>

      <div className="mt-5 max-w-lg rounded-lg border border-line bg-input px-3.5 py-3">
        <p className="text-[11px] tracking-[0.12em] text-dim uppercase">Plans on this firm</p>
        <p className="mt-1.5 text-sm text-fg">{plans.map((p) => p.name).join(" · ")}</p>
        <p className="mt-1 text-xs text-muted">
          {plans[0]?.note} Don’t mix 1-step numbers with 2-step.
        </p>
        <p className="mt-3 text-[11px] tracking-[0.12em] text-dim uppercase">First payout</p>
        <ul className="mt-1.5 space-y-1 text-sm text-muted">
          <li>
            <span className="text-fg">KYC.</span> {fp.kyc}
          </li>
          <li>
            <span className="text-fg">Days.</span> {fp.minDays}
          </li>
          <li>
            <span className="text-fg">Consistency.</span> {fp.consistency}
          </li>
          <li>
            <span className="text-fg">News.</span> {fp.news}
          </li>
          <li>
            <span className="text-fg">Request.</span> {fp.request}
          </li>
        </ul>
      </div>

      <div className="mt-5 grid w-full grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
        {SUGGESTS.map((s) => (
          <button
            key={s.title}
            type="button"
            disabled={sending}
            onClick={() => send(s.prompt)}
            className="flex min-h-12 items-center gap-3 bg-elev px-3.5 py-3 text-left hover:bg-hover disabled:opacity-50 desk:min-h-14 desk:px-4"
          >
            <span className="min-w-0 flex-1">
              <strong className="block text-sm font-medium">{s.title}</strong>
              <em className="mt-0.5 block text-xs not-italic text-dim">{s.blurb}</em>
            </span>
            <ChevronRight className="size-4 shrink-0 text-dim" />
          </button>
        ))}
      </div>
    </div>
  );
}
