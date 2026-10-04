import { useEffect, useState } from "react";
import { ExternalLink, X } from "lucide-react";
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
  type DeskFirmPayout,
  type FirmPayoutDetail,
  type PayoutFeed,
} from "@/lib/propdesk/payouts";

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-md border border-line bg-elev px-3.5 py-3">
      <p className="font-display text-[11px] tracking-[0.12em] text-dim uppercase">{label}</p>
      <p className="font-display mt-1 text-2xl font-bold tabular-nums tracking-tight">{value}</p>
      {sub ? <p className="mt-1 text-xs text-muted">{sub}</p> : null}
    </div>
  );
}

function GlassStat({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-lg px-3 py-2 pd-glass-tile">
      <p className="font-display text-[10px] tracking-[0.14em] text-dim uppercase">{label}</p>
      <p className="mt-1 text-sm font-medium tabular-nums">{value || "—"}</p>
    </div>
  );
}

function FocusCard({
  row,
  detail,
  loading,
  onClose,
}: {
  row: DeskFirmPayout;
  detail: FirmPayoutDetail | null;
  loading: boolean;
  onClose: () => void;
}) {
  const firm = getFirm(row.id);
  const fp = firstPayout(row.id);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`${firm.name} payouts`}>
      <button type="button" className="pd-scrim absolute inset-0 backdrop-blur-2xl" aria-label="Close payout card" onClick={onClose} />
      <article className="pd-glass-card relative aspect-square w-[min(100%,34rem)] overflow-y-auto overscroll-contain rounded-3xl p-5 backdrop-blur-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <FirmLogo firm={firm} size={28} />
            <div>
              <h3 className="font-display text-xl font-bold tracking-tight">{firm.name}</h3>
              <p className="text-xs text-dim">On-chain book · tap outside to close</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="pd-glass-tile grid size-9 place-items-center rounded-full text-muted" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>
        {loading && !detail ? <p className="mt-6 text-sm text-dim">Opening the book…</p> : null}
        {detail && !detail.ok ? <p className="mt-6 text-sm text-muted">{detail.error}</p> : null}
        {detail?.ok ? (
          <>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <GlassStat label="All-time" value={detail.allTime} />
              <GlassStat label="Last 30 days" value={detail.last30} />
              <GlassStat label="Payouts" value={detail.count} />
              <GlassStat label="Average" value={detail.average} />
              <GlassStat label="Median" value={detail.median} />
              <GlassStat label="Largest" value={detail.largest} />
            </div>
            <p className="font-display mt-4 text-[11px] tracking-[0.14em] text-dim uppercase">Daily payout</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <GlassStat label="Payouts / day" value={detail.perDay} />
              <GlassStat label="Days / week" value={detail.daysPerWeek} />
              <GlassStat label="Busiest day" value={detail.busiest} />
              <GlassStat label="Last print" value={detail.lastPayout} />
              <GlassStat label="Board slot" value={detail.rank} />
              <GlassStat label="Share of 30d" value={detail.share} />
            </div>
            {detail.recent.length ? (
              <ul className="pd-glass-line mt-3 divide-y text-sm">
                {detail.recent.slice(0, 5).map((item) => (
                  <li key={`${item.when}-${item.amount}`} className="flex justify-between gap-3 py-1.5">
                    <span className="text-muted">{item.when}</span>
                    <span className="tabular-nums">{item.amount}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        ) : null}
        <p className="mt-3 text-xs text-dim">
          {fp.kyc} {fp.minDays}
        </p>
        <div className="mt-2 flex gap-3 text-xs">
          <a href={row.pj} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-muted hover:text-fg">
            Junction <ExternalLink className="size-3" />
          </a>
          <a href={row.pfm} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-muted hover:text-fg">
            Match <ExternalLink className="size-3" />
          </a>
        </div>
      </article>
    </div>
  );
}

export function PayoutsView() {
  const [feed, setFeed] = useState<PayoutFeed | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [detail, setDetail] = useState<FirmPayoutDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void getPayoutFeed().then(setFeed);
  }, []);

  useEffect(() => {
    if (!openId) return;
    let live = true;
    setDetail(null);
    setLoading(true);
    void getFirmPayoutDetail({ data: { firmId: openId } })
      .then((next) => {
        if (live) setDetail(next);
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      live = false;
      html.style.overflow = prev;
    };
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
          . Bank wires that never hit a chain will not show here.
        </p>
        {boardAt ? (
          <p className="mt-2 font-display text-xs text-dim">Board stamp {boardAt}</p>
        ) : null}

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
            <Stat
              label="Last 24h"
              value={money(feed.last24h?.usd ?? 0)}
              sub={`${count(feed.last24h?.count ?? 0)} payouts · as of ${boardAt ?? "—"}`}
            />
            <Stat
              label="Last 30 days"
              value={money(feed.last30d?.usd ?? 0)}
              sub={`${count(feed.last30d?.count ?? 0)} · stamped ${boardAt ?? "—"}`}
            />
            <Stat
              label="This month"
              value={money(feed.month?.usd ?? 0)}
              sub={`${feed.month?.from ? `From ${dayStamp(feed.month.from)}` : "Month to date"} · ${boardAt ?? ""}`}
            />
            <Stat
              label="All time on-chain"
              value={money(feed.allTime?.usd ?? 0)}
              sub={`${feed.allTime?.since ? `Since ${dayStamp(feed.allTime.since)}` : count(feed.allTime?.count ?? 0)} · ${boardAt ?? ""}`}
            />
          </div>
        )}

        <h3 className="font-display mt-8 text-xl font-bold tracking-tight">Firms on this desk</h3>
        <p className="mt-1 text-xs text-dim">
          Figures stamped {boardAt ?? "when the board last loaded"}. Quiet here often means wire, not “doesn’t pay.”
        </p>
        <div className="mt-3 overflow-x-auto overscroll-x-contain">
          <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-bg py-2 pr-3 font-medium text-dim">Firm</th>
                <th className="py-2 pr-3 font-medium text-dim">30 days</th>
                <th className="py-2 pr-3 font-medium text-dim">Payouts</th>
                <th className="py-2 pr-3 font-medium text-dim">All-time</th>
                <th className="py-2 pr-3 font-medium text-dim">Largest</th>
                <th className="py-2 pr-3 font-medium text-dim">Stamped</th>
                <th className="py-2 font-medium text-dim">Open</th>
              </tr>
            </thead>
            <tbody>
              {ours.map((f) => {
                const firm = getFirm(f.id);
                return (
                  <tr
                    key={f.id}
                    className="cursor-pointer border-t border-border hover:bg-hover/40"
                    onClick={() => setOpenId(f.id)}
                  >
                    <td className="sticky left-0 z-10 bg-bg py-2.5 pr-3">
                      <span className="flex items-center gap-2 font-medium">
                        <FirmLogo firm={firm} size={16} />
                        <span>
                          {f.short}
                          {f.tracked ? null : (
                            <span className="mt-0.5 block text-[11px] font-normal text-dim">Not on this chain</span>
                          )}
                        </span>
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
                        Not on this chain — wire payouts will not show as $0
                      </td>
                    )}
                    <td className="py-2.5 pr-3 text-xs text-dim tabular-nums">
                      {stamp(f.updatedAt) ?? boardAt ?? "—"}
                    </td>
                    <td className="py-2.5" onClick={(e) => e.stopPropagation()}>
                      <span className="flex gap-3 text-xs">
                        <a href={f.pj} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-muted hover:text-fg">
                          Junction <ExternalLink className="size-3" />
                        </a>
                        <a href={f.pfm} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-muted hover:text-fg">
                          Match <ExternalLink className="size-3" />
                        </a>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <h3 className="font-display mt-8 text-xl font-bold tracking-tight">Payout rules</h3>
        <p className="mt-1 text-xs text-dim">
          Packed {rulesAt}. Confirm the live plan card before you pay — firms change SKUs.
        </p>
        <div className="mt-3 overflow-x-auto overscroll-x-contain">
          <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-bg py-2 pr-3 font-medium text-dim">Firm</th>
                <th className="py-2 pr-3 font-medium text-dim">KYC</th>
                <th className="py-2 pr-3 font-medium text-dim">Days</th>
                <th className="py-2 pr-3 font-medium text-dim">Consistency</th>
                <th className="py-2 font-medium text-dim">Rules as of</th>
              </tr>
            </thead>
            <tbody>
              {firms.map((f) => {
                const fp = firstPayout(f.id);
                return (
                  <tr key={f.id} className="border-t border-border">
                    <td className="sticky left-0 z-10 bg-bg py-2.5 pr-3">
                      <span className="flex items-center gap-2 font-medium">
                        <FirmLogo firm={f} size={16} />
                        {f.short}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 text-muted">{fp.kyc}</td>
                    <td className="py-2.5 pr-3 text-muted">{fp.minDays}</td>
                    <td className="py-2.5 pr-3 text-muted">{fp.consistency}</td>
                    <td className="py-2.5 text-xs text-dim tabular-nums">{rulesAt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
                Largest on record: {money(feed.largest.usd)} · {feed.largest.firm} ·{" "}
                {dayStamp(feed.largest.date) ?? feed.largest.date}
              </p>
            ) : null}
          </>
        ) : null}

        <p className="mt-6 max-w-2xl text-xs leading-relaxed text-dim">
          Junction figures are free to quote with attribution (
          <a href={PJ_STATS} className="underline-offset-2 hover:underline" target="_blank" rel="noreferrer">
            source
          </a>
          ). On-chain only.{" "}
          <a href={PJ_ALL} className="underline-offset-2 hover:underline" target="_blank" rel="noreferrer">
            All-time
          </a>
          {" · "}
          <a href={PFM_LEADERS} className="underline-offset-2 hover:underline" target="_blank" rel="noreferrer">
            Match trader leaderboard
          </a>
          .
        </p>
        {openId && ours.find((f) => f.id === openId) ? (
          <FocusCard
            row={ours.find((f) => f.id === openId)!}
            detail={detail}
            loading={loading}
            onClose={() => setOpenId(null)}
          />
        ) : null}
      </div>
    </div>
  );
}
