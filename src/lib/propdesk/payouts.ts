import { createServerFn } from "@tanstack/react-start";
import { firmList } from "./engine";

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

export const PJ_SLUG: Record<string, string> = {
  goat: "goatfundedtrader",
  fundednext: "fundednext",
  the5ers: "the5ers",
  fundingpips: "fundingpips",
  e8: "e8markets",
  acg: "alphacapitalgroup",
  instant: "instantfunding",
};

export function pjUrl(id: string) {
  const slug = PJ_SLUG[id];
  return slug ? `https://payoutjunction.com/firms/${slug}` : PJ_ALL;
}

export type WindowStat = {
  usd: number;
  count: number;
  firms?: number;
  avg?: number;
  median?: number;
  leading?: string;
};

export type TopFirm = { firm: string; usd: number; count: number; share: number };

export type TrackRow = {
  usd: number;
  count: number;
  largest?: number;
  avg?: number;
};

export type DeskFirmPayout = {
  id: string;
  name: string;
  short: string;
  color: string;
  pfm: string;
  pj: string;
  tracked: boolean;
  allTime?: TrackRow;
  last30d?: TrackRow;
};

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
  ours: DeskFirmPayout[];
  error?: string;
};

function num(v: unknown) {
  const n = typeof v === "number" ? v : Number(String(v).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function parseMoney(s: string) {
  return num(s.replace(/[$,]/g, ""));
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

/** Junction all-time / 30d HTML tables → slug keyed rows. */
export function parseJunctionBoard(html: string): Record<string, TrackRow> {
  const body = html.match(/<tbody[\s\S]+?<\/tbody>/i)?.[0] ?? "";
  const out: Record<string, TrackRow> = {};
  for (const tr of body.matchAll(/<tr[\s\S]*?<\/tr>/gi)) {
    const slug = tr[0].match(/\/firms\/([a-z0-9-]+)/i)?.[1]?.toLowerCase();
    if (!slug) continue;
    const text = tr[0].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const dollars = [...text.matchAll(/\$[\d,]+/g)].map((m) => parseMoney(m[0]));
    const countMatch = text.match(/\$[\d,]+\s+([\d,]+)\s+\$/);
    out[slug] = {
      usd: dollars[0] ?? 0,
      count: countMatch ? parseMoney(countMatch[1]) : 0,
      largest: dollars[1],
      avg: dollars[2],
    };
  }
  return out;
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

function emptyOurs(): DeskFirmPayout[] {
  return firmList().map((f) => ({
    id: f.id,
    name: f.name,
    short: f.short,
    color: f.color,
    pfm: PFM_FIRM[f.id] ?? PFM_PAYOUTS,
    pj: pjUrl(f.id),
    tracked: Boolean(PJ_SLUG[f.id]),
  }));
}

async function grab(url: string) {
  const res = await fetch(url, {
    headers: { Accept: "text/html,application/json", "User-Agent": "PropDesk/1.0" },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  return res;
}

export const getPayoutFeed = createServerFn({ method: "POST" }).handler(async () => {
  if (cache && Date.now() - cache.at < TTL) return cache.feed;
  try {
    const [statsRes, allRes, d30Res] = await Promise.all([
      grab(PJ_JSON),
      grab(PJ_ALL),
      grab(PJ_30D),
    ]);
    const raw = (await statsRes.json()) as Record<string, unknown>;
    const allMap = parseJunctionBoard(await allRes.text());
    const d30Map = parseJunctionBoard(await d30Res.text());
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
    const ours = emptyOurs().map((row) => {
      const slug = PJ_SLUG[row.id];
      const allTime = slug ? allMap[slug] : undefined;
      const last30d = slug ? d30Map[slug] : undefined;
      return {
        ...row,
        tracked: Boolean(allTime || last30d),
        allTime,
        last30d,
      };
    });
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
      ours,
    };
    cache = { at: Date.now(), feed };
    return feed;
  } catch {
    return { ok: false, top30d: [], ours: emptyOurs(), error: "junction unreachable" } satisfies PayoutFeed;
  }
});
