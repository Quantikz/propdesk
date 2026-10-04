import { useEffect, useState } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";
import { FirmLogo } from "@/components/propdesk/firm-logo";
import { firmList, getFirm } from "@/lib/propdesk/engine";
import { RULES_AS_OF, firstPayout } from "@/lib/propdesk/plans";
import {
  count,
  dayStamp,
  getFirmPayoutDetail,
  getPayoutFeed,
  money,
  PFM_LEADERS,
  PFM_PAYOUTS,
  PJ_30D,
  PJ_ALL,
  PJ_STATS,
  stamp,
  type FirmPayoutDetail,
  type PayoutFeed,
} from "@/lib/propdesk/payouts";
import { cn } from "@/lib/utils";

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-md border border-line bg-elev px-3.5 py-3">
      <p className="font-display text-[11px] tracking-[0.12em] text-dim uppercase">{label}</p>
      <p className="font-display mt-1 text-2xl font-bold tabular-nums tracking-tight">{value}</p>
      {sub ? <p className="mt-1 text-xs text-muted">{sub}</p> : null}
    </div>
  );
}

function Mini({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-md border border-line px-3 py-2">
      <p className="font-display text-[11px] tracking-[0.12em] text-dim uppercase">{label}</p>
      <p className="mt-1 text-sm font-medium tabular-nums">{value || "—"}</p>
    </div>
  );
}

export function PayoutsView() {
  const [feed, setFeed] = useState<PayoutFeed | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [detail, setDetail] = useState<FirmPayoutDetail | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    void getPayoutFeed().then(setFeed);
  }, []);

  useEffect(() => {
    if (!openId) return;
    setDetail(null);
    setLoadingId(openId);
    void getFirmPayoutDetail({ data: { firmId: openId } })
      .then(setDetail)
      .finally(() => setLoadingId(null));
  }, [openId]);

  const boardAt = stamp(feed?.asOf) ?? stamp(feed?.fetchedAt);
  const rulesAt = stamp(RULES_AS_OF);
  const ours = feed?.ours ?? [];
  const firms = firmList();

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <div className="mx-auto w-full max-w-[1100px] px-4 py-5 desk:px-6 desk:py-7">
        <p className="font-display text-[11px] tracking-[0.14em] text-dim uppercase">Issued payouts</p>
        <h2 className="page-title mt-2">Who actually paid</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Live board from{" "}
          <a href={PJ_STATS} target="_blank" rel="noreferrer" className="text-fg underline-offset-2 hover:underline">
            Payout Junction
          </a>
          . Partner tracker:{" "}
          <a href={PFM_PAYOUTS} target="_blank" rel="noreferrer" className="text-fg underline-offset-2 hover:underline">
            Prop Firm Match
          </a>
          . Open a firm for the daily rate, the all-time book, and the latest prints. Bank wires that never hit a chain will not show here.
        </p>
        {boardAt ? <p className="mt-2 font-display text-xs text-dim">Board stamp {boardAt}</p> : null}

        {!feed ? (
          <p className="mt-6 text-sm text-dim">Loading live figures…</p>
        ) : !feed.ok ? (
          <p className="mt-6 text-sm text-muted">
            Live board did not load. Open{" "}
            <a href={PJ_30D} className="underline-offset-2 hover:underline" target="_blank" rel="noreferrer">
              Payout Junction 30 days
            </a>
            .
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-2 desk:grid-cols-4">
            <Stat label="Last 24h" value={money(feed.last24h?.usd ?? 0)} sub={`${count(feed.last24h?.count ?? 0)} payouts · as of ${boardAt ?? "—"}`} />
            <Stat label="Last 30 days" value={money(feed.last30d?.usd ?? 0)} sub={`${count(feed.last30d?.count ?? 0)} · stamped ${boardAt ?? "—"}`} />
            <Stat label="This month" value={money(feed.month?.usd ?? 0)} sub={`${feed.month?.from ? `From ${dayStamp(feed.month.from)}` : "Month to date"} · ${boardAt ?? ""}`} />
            <Stat label="All time on-chain" value={money(feed.allTime?.usd ?? 0)} sub={`${feed.allTime?.since ? `Since ${dayStamp(feed.allTime.since)}` : count(feed.allTime?.count ?? 0)} · ${boardAt ?? ""}`} />
          </div>
        )}

        <h3 className="font-display mt-8 text-xl font-bold tracking-tight">Firms on this desk</h3>
        <p className="mt-1 text-xs text-dim">Click a firm. The card opens its payout book. Quiet here often means wire, not “doesn’t pay.”</p>
        <div className="mt-3 space-y-2">
          {(ours.length ? ours : firms.map((f) => ({ id: f.id, name: f.name, short: f.short, color: f.color, pfm: PFM_PAYOUTS, pj: PJ_ALL, tracked: false }))).map((f) => {
            const firm = getFirm(f.id);
            const open = openId === f.id;
            const fp = firstPayout(f.id);
            return (
              <article key={f.id} className="overflow-hidden rounded-md border border-line bg-elev">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : f.id)}
                  aria-expanded={open}
                  className="flex w-full items-center gap-3 px-3 py-3 text-left"
                >
                  <FirmLogo firm={firm} size={22} />
                  <span className="min-w-0 flex-1">
                    <span className="block font-display font-semibold tracking-tight">{firm.name}</span>
                    <span className="mt-0.5 block text-xs text-dim">
                      {f.last30d ? `${money(f.last30d.usd)} · ${count(f.last30d.count)} in 30 days` : "Not on this chain"}
                      {f.allTime ? ` · ${money(f.allTime.usd)} all-time` : ""}
                    </span>
                  </span>
                  <ChevronDown className={cn("size-4 text-dim transition-transform", open && "rotate-180")} />
                </button>
                {open ? (
                  <div className="border-t border-line px-3 py-3">
                    {loadingId === f.id && !detail ? <p className="text-sm text-dim">Opening the payout book…</p> : null}
                    {detail && detail.id === f.id && !detail.ok ? (
                      <p className="text-sm text-muted">{detail.error}</p>
                    ) : null}
                    {detail && detail.id === f.id && detail.ok ? (
                      <>
                        <div className="grid grid-cols-2 gap-2 desk:grid-cols-4">
                          <Mini label="All-time" value={detail.allTime} />
                          <Mini label="Last 30 days" value={detail.last30} />
                          <Mini label="Payouts" value={detail.count} />
                          <Mini label="Average" value={detail.average} />
                          <Mini label="Median" value={detail.median} />
                          <Mini label="Largest" value={detail.largest} />
                          <Mini label="30d average" value={detail.avg30} />
                          <Mini label="Verified since" value={detail.since} />
                        </div>
                        <h4 className="font-display mt-4 text-sm font-semibold">Daily payout</h4>
                        <div className="mt-2 grid grid-cols-2 gap-2 desk:grid-cols-4">
                          <Mini label="Payouts / day" value={detail.perDay} />
                          <Mini label="Payout days / week" value={detail.daysPerWeek} />
                          <Mini label="Busiest day" value={detail.busiest} />
                          <Mini label="Last print" value={detail.lastPayout} />
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 desk:grid-cols-4">
                          <Mini label="30d rank" value={detail.rank} />
                          <Mini label="Share of 30d" value={detail.share} />
                          <Mini label="Board 30d" value={f.last30d ? money(f.last30d.usd) : undefined} />
                          <Mini label="Board largest" value={f.allTime?.largest ? money(f.allTime.largest) : undefined} />
                        </div>
                        {detail.recent.length ? (
                          <>
                            <h4 className="font-display mt-4 text-sm font-semibold">Latest prints</h4>
                            <ul className="mt-2 divide-y divide-line text-sm">
                              {detail.recent.map((row) => (
                                <li key={`${row.when}-${row.amount}`} className="flex justify-between gap-3 py-1.5">
                                  <span className="text-muted">{row.when}</span>
                                  <span className="tabular-nums">{row.amount}</span>
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : null}
                      </>
                    ) : null}
                    <div className="mt-3 rounded-md border border-line px-3 py-2 text-xs text-muted">
                      Rules packed {rulesAt}. KYC: {fp.kyc} Days: {fp.minDays} Consistency: {fp.consistency}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs">
                      <a href={f.pj} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-muted hover:text-fg">
                        Junction <ExternalLink className="size-3" />
                      </a>
                      <a href={f.pfm} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-muted hover:text-fg">
                        Match <ExternalLink className="size-3" />
                      </a>
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>

        {feed?.ok && feed.top30d.length ? (
          <>
            <h3 className="font-display mt-8 text-xl font-bold tracking-tight">Last 30 days · industry top</h3>
            <p className="mt-1 text-xs text-dim">Share of tracked dollars. Window stamped {boardAt ?? "—"}.</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
                <thead>
                  <tr>
                    <th className="py-2 pr-3 font-medium text-dim">Firm</th>
                    <th className="py-2 pr-3 font-medium text-dim">Paid</th>
                    <th className="py-2 pr-3 font-medium text-dim">Payouts</th>
                    <th className="py-2 font-medium text-dim">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {feed.top30d.map((row) => (
                    <tr key={row.firm} className="border-t border-border">
                      <td className="py-2.5 pr-3 font-medium">{row.firm}</td>
                      <td className="py-2.5 pr-3 tabular-nums">{money(row.usd)}</td>
                      <td className="py-2.5 pr-3 tabular-nums">{count(row.count)}</td>
                      <td className="py-2.5 tabular-nums text-muted">{row.share.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {feed.largest ? (
              <p className="mt-3 text-sm text-muted">
                Largest on record: {money(feed.largest.usd)} · {feed.largest.firm} · {dayStamp(feed.largest.date) ?? feed.largest.date}
              </p>
            ) : null}
          </>
        ) : null}

        <p className="mt-6 max-w-2xl text-xs leading-relaxed text-dim">
          Junction figures are free to quote with attribution (
          <a href={PJ_STATS} className="underline-offset-2 hover:underline" target="_blank" rel="noreferrer">source</a>
          ). On-chain only.{" "}
          <a href={PJ_ALL} className="underline-offset-2 hover:underline" target="_blank" rel="noreferrer">All-time</a>
          {" · "}
          <a href={PFM_LEADERS} className="underline-offset-2 hover:underline" target="_blank" rel="noreferrer">Match trader leaderboard</a>
          .
        </p>
      </div>
    </div>
  );
}
