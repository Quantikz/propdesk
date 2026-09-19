import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import {
  count,
  getPayoutFeed,
  money,
  PFM_LEADERS,
  PFM_PAYOUTS,
  PJ_30D,
  PJ_ALL,
  PJ_STATS,
  type PayoutFeed,
} from "@/lib/propdesk/payouts";

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-md border border-line bg-elev px-3.5 py-3">
      <p className="text-[11px] tracking-[0.12em] text-dim uppercase">{label}</p>
      <p className="font-display mt-1 text-xl font-semibold tabular-nums">{value}</p>
      {sub ? <p className="mt-1 text-xs text-muted">{sub}</p> : null}
    </div>
  );
}

export function PayoutsView() {
  const [feed, setFeed] = useState<PayoutFeed | null>(null);

  useEffect(() => {
    void getPayoutFeed().then(setFeed);
  }, []);

  const asOf = feed?.asOf
    ? new Date(feed.asOf).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
    : null;
  const ours = feed?.ours ?? [];

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <div className="mx-auto w-full max-w-[1100px] px-4 py-5 desk:px-6 desk:py-7">
        <p className="text-[11px] tracking-[0.14em] text-dim uppercase">Issued payouts</p>
        <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight desk:text-[1.85rem]">
          Who actually paid
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Live board from{" "}
          <a href={PJ_STATS} target="_blank" rel="noreferrer" className="text-fg underline-offset-2 hover:underline">
            Payout Junction
          </a>{" "}
          (on-chain, quoted with their license). Partner tracker:{" "}
          <a href={PFM_PAYOUTS} target="_blank" rel="noreferrer" className="text-fg underline-offset-2 hover:underline">
            Prop Firm Match
          </a>
          . Bank wires that never hit a chain will not show here.
        </p>

        {!feed ? (
          <p className="mt-6 text-sm text-dim">Loading live figures…</p>
        ) : !feed.ok ? (
          <p className="mt-6 text-sm text-muted">
            Live board did not load. Open{" "}
            <a href={PJ_30D} className="underline-offset-2 hover:underline" target="_blank" rel="noreferrer">
              Payout Junction 30 days
            </a>{" "}
            or{" "}
            <a href={PFM_PAYOUTS} className="underline-offset-2 hover:underline" target="_blank" rel="noreferrer">
              Prop Firm Match
            </a>
            .
          </p>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-2 gap-2 desk:grid-cols-4">
              <Stat
                label="Last 24h"
                value={money(feed.last24h?.usd ?? 0)}
                sub={`${count(feed.last24h?.count ?? 0)} payouts`}
              />
              <Stat
                label="Last 30 days"
                value={money(feed.last30d?.usd ?? 0)}
                sub={`${count(feed.last30d?.count ?? 0)} · median ${money(feed.last30d?.median ?? 0)}`}
              />
              <Stat
                label="This month"
                value={money(feed.month?.usd ?? 0)}
                sub={feed.month?.leading ? `Lead ${feed.month.leading}` : undefined}
              />
              <Stat
                label="All time on-chain"
                value={money(feed.allTime?.usd ?? 0)}
                sub={`${count(feed.allTime?.count ?? 0)} across ${feed.allTime?.firms ?? "—"} firms`}
              />
            </div>
            {asOf ? <p className="mt-2 text-xs text-dim">Junction stamp {asOf}</p> : null}
          </>
        )}

        <h3 className="font-display mt-8 text-lg font-semibold">Firms on this desk</h3>
        <p className="mt-1 text-xs text-dim">
          Goat Funded Trader first. 30-day and all-time are Junction on-chain. FTMO / Apex / Topstep
          often pay by wire — quiet here does not mean they don’t pay. Match is linked, not copied.
        </p>
        <div className="mt-3 overflow-x-auto overscroll-x-contain">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-bg py-2 pr-3 font-medium text-dim">Firm</th>
                <th className="py-2 pr-3 font-medium text-dim">30 days</th>
                <th className="py-2 pr-3 font-medium text-dim">Payouts</th>
                <th className="py-2 pr-3 font-medium text-dim">All-time</th>
                <th className="py-2 pr-3 font-medium text-dim">Largest</th>
                <th className="py-2 font-medium text-dim">Open</th>
              </tr>
            </thead>
            <tbody>
              {ours.map((f) => (
                <tr key={f.id} className="border-t border-border">
                  <td className="sticky left-0 z-10 bg-bg py-2.5 pr-3">
                    <span className="flex items-center gap-2 font-medium">
                      <span className="size-2 shrink-0 rounded-full" style={{ background: f.color }} />
                      {f.short}
                    </span>
                  </td>
                  {f.last30d || f.allTime ? (
                    <>
                      <td className="py-2.5 pr-3 tabular-nums">{f.last30d ? money(f.last30d.usd) : "—"}</td>
                      <td className="py-2.5 pr-3 tabular-nums">
                        {f.last30d ? count(f.last30d.count) : "—"}
                      </td>
                      <td className="py-2.5 pr-3 tabular-nums">{f.allTime ? money(f.allTime.usd) : "—"}</td>
                      <td className="py-2.5 pr-3 tabular-nums">
                        {f.allTime?.largest ? money(f.allTime.largest) : "—"}
                      </td>
                    </>
                  ) : (
                    <td className="py-2.5 pr-3 text-muted" colSpan={4}>
                      Not on this chain — open Match
                    </td>
                  )}
                  <td className="py-2.5">
                    <span className="flex gap-3 text-xs">
                      <a
                        href={f.pj}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-muted hover:text-fg"
                      >
                        Junction <ExternalLink className="size-3" />
                      </a>
                      <a
                        href={f.pfm}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-muted hover:text-fg"
                      >
                        Match <ExternalLink className="size-3" />
                      </a>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {feed?.ok && feed.top30d.length ? (
          <>
            <h3 className="font-display mt-8 text-lg font-semibold">Last 30 days · industry top</h3>
            <p className="mt-1 text-xs text-dim">Share of tracked dollars across all Junction firms, not only this desk.</p>
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
                Largest on record: {money(feed.largest.usd)} · {feed.largest.firm} · {feed.largest.date}
              </p>
            ) : null}
          </>
        ) : null}

        <p className="mt-6 max-w-2xl text-xs leading-relaxed text-dim">
          Payout Junction figures are free to quote with attribution (
          <a href={PJ_STATS} className="underline-offset-2 hover:underline" target="_blank" rel="noreferrer">
            source
          </a>
          ). On-chain only — Rise / crypto.{" "}
          <a href={PJ_ALL} className="underline-offset-2 hover:underline" target="_blank" rel="noreferrer">
            All-time
          </a>
          {" · "}
          <a href={PFM_LEADERS} className="underline-offset-2 hover:underline" target="_blank" rel="noreferrer">
            Match trader leaderboard
          </a>
          .
        </p>
      </div>
    </div>
  );
}
