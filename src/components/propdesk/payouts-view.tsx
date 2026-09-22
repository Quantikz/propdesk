import { useEffect, useState } from "react";
import { FirmLogo } from "@/components/propdesk/firm-logo";
import { firmList } from "@/lib/propdesk/engine";
import { RULES_AS_OF, firstPayout } from "@/lib/propdesk/plans";
import { getPayoutFeed, money, PFM_PAYOUTS, PJ_STATS, stamp, type PayoutFeed } from "@/lib/propdesk/payouts";

export function PayoutsView() {
  const [feed, setFeed] = useState<PayoutFeed | null>(null);
  useEffect(() => {
    void getPayoutFeed().then(setFeed);
  }, []);
  const boardAt = stamp(feed?.asOf) ?? stamp(feed?.fetchedAt);
  const rulesAt = stamp(RULES_AS_OF);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 desk:px-8 desk:py-10">
        <h1 className="page-title">Payout rules</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Eligibility, requirements, timing, and possible denial — kept separate from user-reported boards.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 desk:grid-cols-3">
          {[
            ["Eligibility", "What must be true before a payout request can be made."],
            ["Requirements", "KYC, minimum days, profit, consistency and other documented conditions."],
            ["Possible denial", "Conditions that can cause a request to be rejected or withheld."],
            ["Timing", "Documented payout windows and processing information."],
            ["Evidence", `Source and last verified ${rulesAt}. Official terms beat this desk.`],
            ["User reports", "Third-party boards are not official rules. Never shown as verified fact."],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl border border-line bg-elev px-4 py-4">
              <p className="text-[15px] font-semibold tracking-tight">{k}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{v}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-10 text-xl font-semibold tracking-tight">Documented checklist by firm</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead>
              <tr className="text-xs text-dim">
                <th className="py-2 pr-3">Firm</th>
                <th className="px-3 py-2">Requirements</th>
                <th className="px-3 py-2">Timing</th>
                <th className="px-3 py-2">Denial risk</th>
              </tr>
            </thead>
            <tbody>
              {firmList().map((f) => {
                const fp = firstPayout(f.id);
                return (
                  <tr key={f.id} className="border-t border-line align-top">
                    <td className="py-3 pr-3">
                      <span className="inline-flex items-center gap-2">
                        <FirmLogo firm={f} size={16} />
                        {f.short}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-muted">{fp.kyc} {fp.minDays}</td>
                    <td className="px-3 py-3 text-muted">{f.payoutCycle}</td>
                    <td className="px-3 py-3 text-muted">{fp.consistency}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-dim">Rules packed {rulesAt}. Needs confirmation on the live card.</p>

        <h2 className="mt-10 text-xl font-semibold tracking-tight">User reports</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Figures from{" "}
          <a className="underline underline-offset-2" href={PJ_STATS} target="_blank" rel="noreferrer">Payout Junction</a>
          {" "}and{" "}
          <a className="underline underline-offset-2" href={PFM_PAYOUTS} target="_blank" rel="noreferrer">Prop Firm Match</a>
          . These are observed payouts, not the firm’s official rule.
        </p>
        {boardAt ? <p className="mt-1 text-xs text-dim">Board stamp {boardAt}</p> : null}
        {feed?.ok ? (
          <div className="mt-4 grid grid-cols-2 gap-3 desk:grid-cols-4">
            <div className="rounded-2xl border border-line bg-elev px-4 py-4">
              <p className="text-xs text-dim">Last 24h</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">{money(feed.last24h?.usd ?? 0)}</p>
            </div>
            <div className="rounded-2xl border border-line bg-elev px-4 py-4">
              <p className="text-xs text-dim">Last 30 days</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">{money(feed.last30d?.usd ?? 0)}</p>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-dim">Live board loading or unavailable.</p>
        )}
      </div>
    </div>
  );
}
