import { createServerFn } from "@tanstack/react-start";
import { firmList } from "./engine";

export const PJ_HOME = "https://payoutjunction.com";
export const PJ_STATS = "https://payoutjunction.com/statistics";
export const PJ_JSON = "https://payoutjunction.com/statistics/data.json";
export const PJ_30D = "https://payoutjunction.com/30d";
export const PJ_ALL = "https://payoutjunction.com/alltime";
export const PFM_PAYOUTS = "https://propfirmmatch.com/payouts";
export const PFM_LEADERS = "https://propfirmmatch.com/payouts-leaderboard";

export const PFM_FIRM: Record<string, string> = {
  goat: "https://propfirmmatch.com/prop-firms/goat-funded-trader/payouts",
  fundednext: "https://propfirmmatch.com/prop-firms/fundednext/payouts",
  the5ers: "https://propfirmmatch.com/prop-firms/the5ers/payouts",
  fundingpips: "https://propfirmmatch.com/prop-firms/funding-pips/payouts",
  e8: "https://propfirmmatch.com/prop-firms/e8-markets/payouts",
  acg: "https://propfirmmatch.com/prop-firms/alpha-capital-group/payouts",
  instant: "https://propfirmmatch.com/prop-firms/instant-funding/payouts",
  ftmo: "https://propfirmmatch.com/payouts",
  apex: "https://propfirmmatch.com/payouts",
  topstep: "https://propfirmmatch.com/payouts",
};

export const PJ_FIRM: Record<string, string> = {
  goat: "https://payoutjunction.com/alltime",
  fundednext: "https://payoutjunction.com/alltime",
  the5ers: "https://payoutjunction.com/alltime",
  fundingpips: "https://payoutjunction.com/alltime",
  e8: "https://payoutjunction.com/alltime",
  acg: "https://payoutjunction.com/alltime",
  instant: "https://payoutjunction.com/alltime",
  ftmo: "https://payoutjunction.com/alltime",
  apex: "https://payoutjunction.com/alltime",
  topstep: "https://payoutjunction.com/alltime",
};

export type WindowStat = {
  usd: number;
  count: number;
  firms?: number;
  avg?: number;
  median?: number;
  leading?: string;
};

export type TopFirm = { firm: string; usd: number; count: number; share: number };

export type PayoutFeed = {
  ok: boolean;
  asOf?: string;
  license?: string;
  allTime?: WindowStat;
  last30d?: WindowStat;
  last24h?: WindowStat;
  month?: WindowStat;
  top30d: TopFirm[];
  largest?: { usd: number; firm: string; date: string };
  error?: string;
};

function num(v: unknown) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function windowOf(raw: unknown): WindowStat | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  return {
    usd: num(o.usd),
    count: num(o.count),
    firms: o.firms != null ? num(o.firms) : undefined,
    avg: o.avg != null ? num(o.avg) : undefined,
    median: o.median != null ? num(o.median) : undefined,
    leading: typeof o.leading_firm === "string" ? o.leading_firm : undefined,
  };
}

let cache: { at: number; feed: PayoutFeed } | null = null;
const TTL = 8 * 60 * 1000;

export function money(n: number) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${Math.round(n)}`;
}

export function count(n: number) {
  return Math.round(n).toLocaleString("en-US");
}

export function coveredFirms() {
  return firmList().map((f) => ({
    id: f.id,
    name: f.name,
    short: f.short,
    color: f.color,
    pfm: PFM_FIRM[f.id] ?? PFM_PAYOUTS,
    pj: PJ_FIRM[f.id] ?? PJ_ALL,
  }));
}

export const getPayoutFeed = createServerFn({ method: "POST" }).handler(async () => {
  if (cache && Date.now() - cache.at < TTL) return cache.feed;
  try {
    const res = await fetch(PJ_JSON, {
      headers: { Accept: "application/json", "User-Agent": "PropDesk/1.0" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      const feed: PayoutFeed = { ok: false, top30d: [], error: `junction ${res.status}` };
      return feed;
    }
    const raw = (await res.json()) as Record<string, unknown>;
    const top = Array.isArray(raw.top5_30d)
      ? (raw.top5_30d as Record<string, unknown>[]).map((row) => ({
          firm: String(row.firm ?? ""),
          usd: num(row.usd),
          count: num(row.count),
          share: num(row.share),
        }))
      : [];
    const largest =
      raw.largest_on_record && typeof raw.largest_on_record === "object"
        ? {
            usd: num((raw.largest_on_record as Record<string, unknown>).usd),
            firm: String((raw.largest_on_record as Record<string, unknown>).firm ?? ""),
            date: String((raw.largest_on_record as Record<string, unknown>).date ?? ""),
          }
        : undefined;
    const feed: PayoutFeed = {
      ok: true,
      asOf: typeof raw.generated_at === "string" ? raw.generated_at : undefined,
      license: typeof raw.license_note === "string" ? raw.license_note : undefined,
      allTime: windowOf(raw.all_time),
      last30d: windowOf(raw.last_30d),
      last24h: windowOf(raw.last_24h),
      month: windowOf(raw.month_to_date),
      top30d: top,
      largest,
    };
    cache = { at: Date.now(), feed };
    return feed;
  } catch {
    return { ok: false, top30d: [], error: "junction unreachable" } satisfies PayoutFeed;
  }
});
