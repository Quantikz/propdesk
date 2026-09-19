import { getSql, type Sql } from "@/lib/db";
import { faqItems } from "./faq";
import { FIRST, PLANS } from "./plans";
import { KB } from "./knowledge";
import { PFM_FIRM, pjUrl } from "./payouts";
import { orderFirmIds } from "./engine";
import type { CatalogPayload, FirmLink } from "./catalog-cache";
import type { Firm } from "./types";
import type { FirstPayout, Plan } from "./plans";
import type { FaqItem } from "./faq";

const HELP_HOSTS: Record<string, string[]> = {
  ftmo: ["help.ftmo.com"],
  fundednext: ["help.fundednext.com"],
  the5ers: ["help.the5ers.com"],
  topstep: ["help.topstep.com", "www.topstep.com"],
  apex: ["support.apextraderfunding.com"],
  goat: ["goatfundedtrader.com", "www.goatfundedtrader.com"],
  fundingpips: ["fundingpips.com", "www.fundingpips.com"],
  e8: ["e8markets.com", "www.e8markets.com"],
  instant: ["instantfunding.io", "www.instantfunding.io"],
  acg: ["alphacapitalgroup.uk", "www.alphacapitalgroup.uk"],
};

function portalHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

async function ensureSeed(sql: Sql) {
  const count = await sql<{ n: number }>`select count(*)::int as n from firms`;
  if ((count[0]?.n ?? 0) > 0) return;

  const firms = orderFirmIds(Object.keys(KB.firms)).map((id) => KB.firms[id]);
  for (let i = 0; i < firms.length; i++) {
    const f = firms[i];
    const rank = f.id === "goat" ? 0 : i + 1;
    await sql`
      insert into firms (
        id, name, short, color, support_email, portal, models, platforms,
        profit_split, payout_cycle, payout_sla_days, max_account, drawdown,
        consistency, news, ea, kyc, notes, sort_rank
      ) values (
        ${f.id}, ${f.name}, ${f.short}, ${f.color}, ${f.supportEmail}, ${f.portal},
        ${JSON.stringify(f.models)}, ${JSON.stringify(f.platforms)},
        ${f.profitSplit}, ${f.payoutCycle}, ${f.payoutSlaDays}, ${f.maxAccount},
        ${f.drawdown}, ${f.consistency}, ${f.news}, ${f.ea}, ${f.kyc}, ${f.notes}, ${rank}
      )
      on conflict (id) do nothing
    `;

    const links: FirmLink[] = [
      { kind: "portal", title: "Official site", url: f.portal },
    ];
    const pfm = PFM_FIRM[f.id];
    if (pfm) links.push({ kind: "payouts_pfm", title: "Prop Firm Match payouts", url: pfm });
    const pj = pjUrl(f.id);
    if (pj) links.push({ kind: "payouts_pj", title: "Payout Junction", url: pj });
    for (const host of HELP_HOSTS[f.id] ?? []) {
      links.push({ kind: "help", title: "Help center", url: `https://${host}` });
    }
    for (const l of links) {
      await sql`
        insert into firm_links (firm_id, kind, title, url)
        values (${f.id}, ${l.kind}, ${l.title}, ${l.url})
        on conflict (firm_id, kind, url) do nothing
      `;
    }

    const hosts = Array.from(
      new Set([portalHost(f.portal), ...(HELP_HOSTS[f.id] ?? [])].filter(Boolean)),
    );
    for (const host of hosts) {
      await sql`
        insert into search_hosts (firm_id, host)
        values (${f.id}, ${host})
        on conflict (firm_id, host) do nothing
      `;
    }

    const faqs = faqItems(f.id);
    for (let q = 0; q < faqs.length; q++) {
      await sql`
        insert into faqs (firm_id, sort, question, answer)
        values (${f.id}, ${q}, ${faqs[q].q}, ${faqs[q].a})
      `;
    }

    const plans = PLANS[f.id] ?? [];
    for (let p = 0; p < plans.length; p++) {
      const pl = plans[p];
      await sql`
        insert into plans (firm_id, sort, kind, name, target, daily, max_dd, note)
        values (${f.id}, ${p}, ${pl.kind}, ${pl.name}, ${pl.target}, ${pl.daily}, ${pl.max}, ${pl.note})
      `;
    }

    const fp = FIRST[f.id];
    if (fp) {
      await sql`
        insert into first_payouts (firm_id, kyc, min_days, consistency, news, request)
        values (${f.id}, ${fp.kyc}, ${fp.minDays}, ${fp.consistency}, ${fp.news}, ${fp.request})
        on conflict (firm_id) do nothing
      `;
    }
  }
}

function parseJsonList(raw: string): string[] {
  try {
    const v = JSON.parse(raw) as unknown;
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

export async function loadDeskCatalog(): Promise<CatalogPayload> {
  const sql = await getSql();
  await ensureSeed(sql);

  const firmRows = await sql<{
    id: string;
    name: string;
    short: string;
    color: string;
    support_email: string;
    portal: string;
    models: string;
    platforms: string;
    profit_split: string;
    payout_cycle: string;
    payout_sla_days: number;
    max_account: string;
    drawdown: string;
    consistency: string;
    news: string;
    ea: string;
    kyc: string;
    notes: string;
  }>`select * from firms order by sort_rank asc, name asc`;

  const firms: Firm[] = firmRows.map((r) => ({
    id: r.id,
    name: r.name,
    short: r.short,
    color: r.color,
    supportEmail: r.support_email,
    portal: r.portal,
    models: parseJsonList(r.models),
    platforms: parseJsonList(r.platforms),
    profitSplit: r.profit_split,
    payoutCycle: r.payout_cycle,
    payoutSlaDays: Number(r.payout_sla_days) || 3,
    maxAccount: r.max_account,
    drawdown: r.drawdown,
    consistency: r.consistency,
    news: r.news,
    ea: r.ea,
    kyc: r.kyc,
    notes: r.notes,
  }));

  const faqRows = await sql<{
    firm_id: string;
    question: string;
    answer: string;
  }>`select firm_id, question, answer from faqs order by sort asc`;
  const faqs: Record<string, FaqItem[]> = {};
  for (const r of faqRows) {
    (faqs[r.firm_id] ??= []).push({ q: r.question, a: r.answer });
  }

  const planRows = await sql<{
    firm_id: string;
    kind: Plan["kind"];
    name: string;
    target: string;
    daily: string;
    max_dd: string;
    note: string;
  }>`select firm_id, kind, name, target, daily, max_dd, note from plans order by sort asc`;
  const plans: Record<string, Plan[]> = {};
  for (const r of planRows) {
    (plans[r.firm_id] ??= []).push({
      kind: r.kind,
      name: r.name,
      target: r.target,
      daily: r.daily,
      max: r.max_dd,
      note: r.note,
    });
  }

  const firstRows = await sql<{
    firm_id: string;
    kyc: string;
    min_days: string;
    consistency: string;
    news: string;
    request: string;
  }>`select * from first_payouts`;
  const first: Record<string, FirstPayout> = {};
  for (const r of firstRows) {
    first[r.firm_id] = {
      kyc: r.kyc,
      minDays: r.min_days,
      consistency: r.consistency,
      news: r.news,
      request: r.request,
    };
  }

  const linkRows = await sql<{
    firm_id: string;
    kind: string;
    title: string;
    url: string;
  }>`select firm_id, kind, title, url from firm_links`;
  const links: Record<string, FirmLink[]> = {};
  for (const r of linkRows) {
    (links[r.firm_id] ??= []).push({ kind: r.kind, title: r.title, url: r.url });
  }

  const hostRows = await sql<{ firm_id: string; host: string }>`select firm_id, host from search_hosts`;
  const hosts: Record<string, string[]> = {};
  for (const r of hostRows) {
    (hosts[r.firm_id] ??= []).push(r.host);
  }

  return { firms, faqs, plans, first, links, hosts };
}

let memo: { at: number; data: CatalogPayload } | null = null;

export async function cachedCatalog(): Promise<CatalogPayload> {
  if (memo && Date.now() - memo.at < 60_000) return memo.data;
  const data = await loadDeskCatalog();
  memo = { at: Date.now(), data };
  return data;
}

export function firmFromCatalog(cat: CatalogPayload, id: string): Firm {
  return cat.firms.find((f) => f.id === id) ?? cat.firms[0] ?? KB.firms.goat;
}

export function faqPackFromCatalog(cat: CatalogPayload, firmId: string): string {
  const f = firmFromCatalog(cat, firmId);
  const items = cat.faqs[firmId] ?? [];
  const plans = cat.plans[firmId] ?? [];
  const fp = cat.first[firmId];
  const planLines = plans
    .map((p) => `- ${p.name} (${p.kind}): target ${p.target}. Daily ${p.daily}. Max ${p.max}. ${p.note}`)
    .join("\n");
  const firstLines = fp
    ? `First payout checklist:\n- KYC: ${fp.kyc}\n- Min days: ${fp.minDays}\n- Consistency: ${fp.consistency}\n- News window: ${fp.news}\n- When to request: ${fp.request}`
    : "";
  return [
    `${f.name} FAQ pack (pre-support, may lag the live dashboard):`,
    `Models: ${f.models.join("; ")}`,
    `Platforms: ${f.platforms.join(", ")}`,
    `Split: ${f.profitSplit}`,
    `Payout: ${f.payoutCycle}`,
    `Drawdown: ${f.drawdown}`,
    `Consistency: ${f.consistency}`,
    `News: ${f.news}`,
    `EAs: ${f.ea}`,
    `KYC: ${f.kyc}`,
    `Size path: ${f.maxAccount}`,
    `Notes: ${f.notes}`,
    "",
    `${f.name} plans (SKU matters — never mix 1-step numbers with 2-step):`,
    planLines,
    "",
    firstLines,
    "",
    ...items.map((i) => `Q: ${i.q}\nA: ${i.a}`),
  ].join("\n");
}

export function rosterFromCatalog(cat: CatalogPayload): string {
  return cat.firms
    .map((f) => `- ${f.name} (${f.short}): ${f.models[0] ?? ""}. Split ${f.profitSplit}. ${f.drawdown}`)
    .join("\n");
}

export function compareFromCatalog(cat: CatalogPayload, ids: string[]): string {
  const firms = ids.map((id) => firmFromCatalog(cat, id));
  const rows: { label: string; value: (f: Firm) => string }[] = [
    {
      label: "Plans",
      value: (f) => (cat.plans[f.id] ?? []).map((p) => p.name).join(" · ") || "—",
    },
    { label: "Platforms", value: (f) => f.platforms.join(", ") },
    { label: "Profit split", value: (f) => f.profitSplit },
    {
      label: "First payout",
      value: (f) => cat.first[f.id]?.request ?? f.payoutCycle,
    },
    { label: "Payout cycle", value: (f) => f.payoutCycle },
    { label: "Drawdown", value: (f) => f.drawdown },
    { label: "Consistency", value: (f) => f.consistency },
    { label: "News", value: (f) => f.news },
    { label: "EAs / bots", value: (f) => f.ea },
    { label: "KYC", value: (f) => f.kyc },
    { label: "Size path", value: (f) => f.maxAccount },
    { label: "Best for", value: (f) => f.notes },
  ];
  return rows
    .map((row) => {
      const cells = firms.map((f) => `${f.short}: ${row.value(f)}`).join(" | ");
      return `${row.label} — ${cells}`;
    })
    .join("\n");
}

export function hostsFor(cat: CatalogPayload, ids: string[]): string[] {
  const extra = ["payoutjunction.com", "propfirmmatch.com", "www.propfirmmatch.com"];
  return Array.from(new Set([...ids.flatMap((id) => cat.hosts[id] ?? []), ...extra])).slice(0, 10);
}
