import { createServerFn } from "@tanstack/react-start";

export type DeskExtra = {
  id: string;
  challenge: string;
  funded: string;
  denials: string;
};

export type RuleChange = {
  firmId: string;
  checkedAt: string;
  before: string;
  after: string;
};

function keyOk(key: string) {
  const expected = (process.env.ADMIN_KEY || "").trim();
  if (!expected || expected.length < 8) return false;
  const given = key.trim();
  if (given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < given.length; i++) diff |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

function slug(name: string) {
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 24);
  return id || "firm";
}

async function research(name: string, portal: string) {
  const key = (process.env.GROQ_API_KEY || process.env.XAI_API_KEY || "").trim();
  const groq = Boolean(process.env.GROQ_API_KEY);
  let page = "";
  try {
    const res = await fetch(portal, {
      headers: { Accept: "text/html", "User-Agent": "PropDesk/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) page = (await res.text()).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 6000);
  } catch {
    page = "";
  }
  if (!key) {
    return {
      short: name.slice(0, 16),
      supportEmail: `support@${new URL(portal).hostname.replace(/^www\./, "")}`,
      models: ["See official plan card"],
      platforms: ["See official site"],
      profitSplit: "See official plan card",
      payoutCycle: "See official plan card",
      payoutSlaDays: 3,
      maxAccount: "See official site",
      drawdown: "See official plan card",
      consistency: "See official plan card",
      news: "See official plan card",
      ea: "See official plan card",
      kyc: "Required before payout on most firms. Confirm the live page.",
      notes: "Added from the admin desk. Confirm every number on the official page.",
      challenge: "Evaluation rules were not extracted. Open the official page.",
      funded: "Funded-account rules were not extracted. They often differ from the challenge.",
      denials: "IP, CID, copy trading, news, lot size, consistency.",
    };
  }
  const url = groq ? "https://api.groq.com/openai/v1/chat/completions" : "https://api.x.ai/v1/chat/completions";
  const model = groq ? "groq/compound" : "grok-3";
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content:
            "Extract prop-firm facts as JSON only. Do not rank the firm. Do not invent a number. If the page does not say it, write See official page. Fields: short, supportEmail, models, platforms, profitSplit, payoutCycle, payoutSlaDays, maxAccount, drawdown, consistency, news, ea, kyc, notes, challenge, funded, denials. challenge and funded must differ when the page says the funded account is stricter.",
        },
        { role: "user", content: `Firm: ${name}\nPage: ${portal}\n\n${page || "Page did not load."}` },
      ],
    }),
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error("research failed");
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const raw = data.choices?.[0]?.message?.content || "{}";
  const json = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
  return JSON.parse(json) as Record<string, unknown>;
}

export const adminSession = createServerFn({ method: "POST" })
  .validator((input: { key?: string }) => ({ key: String(input.key || "") }))
  .handler(async ({ data }) => ({ ok: keyOk(data.key) }));

export const adminFirms = createServerFn({ method: "POST" })
  .validator((input: { key?: string }) => ({ key: String(input.key || "") }))
  .handler(async ({ data }) => {
    if (!keyOk(data.key)) return { ok: false as const, error: "key" };
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ id: string; name: string; portal: string }>`
      select id, name, portal from firms order by sort_rank asc, name asc
    `;
    return { ok: true as const, firms: rows };
  });

export type FirmEdit = {
  id: string;
  name: string;
  short: string;
  color: string;
  supportEmail: string;
  portal: string;
  models: string;
  platforms: string;
  profitSplit: string;
  payoutCycle: string;
  payoutSlaDays: string;
  maxAccount: string;
  drawdown: string;
  consistency: string;
  news: string;
  ea: string;
  kyc: string;
  notes: string;
  challenge: string;
  funded: string;
  denials: string;
};

export const adminFirm = createServerFn({ method: "POST" })
  .validator((input: { key?: string; id?: string }) => ({
    key: String(input.key || ""),
    id: String(input.id || "").toLowerCase().replace(/[^a-z0-9]/g, ""),
  }))
  .handler(async ({ data }) => {
    if (!keyOk(data.key)) return { ok: false as const, error: "key" };
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<Record<string, string>>`select * from firms where id = ${data.id}`;
    const r = rows[0];
    if (!r) return { ok: false as const, error: "missing" };
    const models = (() => {
      try {
        return (JSON.parse(r.models) as string[]).join(", ");
      } catch {
        return r.models;
      }
    })();
    const platforms = (() => {
      try {
        return (JSON.parse(r.platforms) as string[]).join(", ");
      } catch {
        return r.platforms;
      }
    })();
    return {
      ok: true as const,
      firm: {
        id: r.id,
        name: r.name,
        short: r.short,
        color: r.color,
        supportEmail: r.support_email,
        portal: r.portal,
        models,
        platforms,
        profitSplit: r.profit_split,
        payoutCycle: r.payout_cycle,
        payoutSlaDays: String(r.payout_sla_days ?? "3"),
        maxAccount: r.max_account,
        drawdown: r.drawdown,
        consistency: r.consistency,
        news: r.news,
        ea: r.ea,
        kyc: r.kyc,
        notes: r.notes,
        challenge: r.challenge_rules || "",
        funded: r.funded_rules || "",
        denials: r.denials || "",
      } satisfies FirmEdit,
    };
  });

export const adminSave = createServerFn({ method: "POST" })
  .validator((input: { key?: string; firm?: FirmEdit }) => ({
    key: String(input.key || ""),
    firm: input.firm,
  }))
  .handler(async ({ data }) => {
    if (!keyOk(data.key) || !data.firm) return { ok: false as const, error: "key" };
    const f = data.firm;
    const id = f.id.toLowerCase().replace(/[^a-z0-9]/g, "");
    const models = JSON.stringify(f.models.split(",").map((s) => s.trim()).filter(Boolean));
    const platforms = JSON.stringify(f.platforms.split(",").map((s) => s.trim()).filter(Boolean));
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`
      update firms set
        name = ${f.name.slice(0, 80)},
        short = ${f.short.slice(0, 24)},
        color = ${f.color.slice(0, 16)},
        support_email = ${f.supportEmail.slice(0, 120)},
        portal = ${f.portal.slice(0, 200)},
        models = ${models},
        platforms = ${platforms},
        profit_split = ${f.profitSplit.slice(0, 200)},
        payout_cycle = ${f.payoutCycle.slice(0, 200)},
        payout_sla_days = ${Number(f.payoutSlaDays) || 3},
        max_account = ${f.maxAccount.slice(0, 80)},
        drawdown = ${f.drawdown.slice(0, 400)},
        consistency = ${f.consistency.slice(0, 400)},
        news = ${f.news.slice(0, 400)},
        ea = ${f.ea.slice(0, 400)},
        kyc = ${f.kyc.slice(0, 400)},
        notes = ${f.notes.slice(0, 800)},
        challenge_rules = ${f.challenge.slice(0, 800)},
        funded_rules = ${f.funded.slice(0, 800)},
        denials = ${f.denials.slice(0, 800)}
      where id = ${id}
    `;
    return { ok: true as const };
  });

export const adminRemove = createServerFn({ method: "POST" })
  .validator((input: { key?: string; id?: string }) => ({
    key: String(input.key || ""),
    id: String(input.id || "").toLowerCase().replace(/[^a-z0-9]/g, ""),
  }))
  .handler(async ({ data }) => {
    if (!keyOk(data.key)) return { ok: false as const, error: "key" };
    if (!data.id) return { ok: false as const, error: "id" };
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`delete from firms where id = ${data.id}`;
    return { ok: true as const };
  });

export const adminAdd = createServerFn({ method: "POST" })
  .validator((input: { key?: string; name?: string; portal?: string }) => ({
    key: String(input.key || ""),
    name: String(input.name || "").trim().slice(0, 80),
    portal: String(input.portal || "").trim(),
  }))
  .handler(async ({ data }) => {
    if (!keyOk(data.key)) return { ok: false as const, error: "key" };
    if (!data.name || !/^https:\/\//.test(data.portal)) return { ok: false as const, error: "Need a name and an https official page." };
    const id = slug(data.name);
    const found = await research(data.name, data.portal);
    const list = (v: unknown, fallback: string) => (Array.isArray(v) ? v.map(String) : [fallback]);
    const text = (v: unknown, fallback: string) => (typeof v === "string" && v.trim() ? v.trim() : fallback);
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`
      insert into firms (
        id, name, short, color, support_email, portal, models, platforms,
        profit_split, payout_cycle, payout_sla_days, max_account, drawdown,
        consistency, news, ea, kyc, notes, sort_rank, challenge_rules, funded_rules, denials
      ) values (
        ${id}, ${data.name}, ${text(found.short, data.name.slice(0, 16))}, ${"#8a847a"},
        ${text(found.supportEmail, "support@example.com")}, ${data.portal},
        ${JSON.stringify(list(found.models, "See official page"))},
        ${JSON.stringify(list(found.platforms, "See official page"))},
        ${text(found.profitSplit, "See official page")},
        ${text(found.payoutCycle, "See official page")},
        ${Number(found.payoutSlaDays) || 3},
        ${text(found.maxAccount, "See official page")},
        ${text(found.drawdown, "See official page")},
        ${text(found.consistency, "See official page")},
        ${text(found.news, "See official page")},
        ${text(found.ea, "See official page")},
        ${text(found.kyc, "See official page")},
        ${text(found.notes, "Added from the admin desk. Confirm the official page.")},
        ${200},
        ${text(found.challenge, "See official page")},
        ${text(found.funded, "See official page")},
        ${text(found.denials, "IP, CID, copy, news, lot size, consistency.")}
      )
      on conflict (id) do update set
        name = excluded.name,
        portal = excluded.portal,
        notes = excluded.notes,
        challenge_rules = excluded.challenge_rules,
        funded_rules = excluded.funded_rules,
        denials = excluded.denials
    `;
    await sql`
      insert into faqs (firm_id, sort, question, answer)
      values (${id}, 0, ${"What can deny a payout?"}, ${text(found.denials, "Confirm IP, CID, copy, news, and consistency on the official page.")})
    `;
    return { ok: true as const, id };
  });

export const firmExtras = createServerFn({ method: "GET" }).handler(async () => {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const rows = await sql<{ id: string; challenge_rules: string; funded_rules: string; denials: string }>`
    select id, challenge_rules, funded_rules, denials from firms
  `;
  const changes = await sql<{ firm_id: string; checked_at: string; before: string; after: string }>`
    select firm_id, checked_at::text, before, after from rule_changes order by id desc limit 20
  `;
  return {
    extras: rows.map((r) => ({
      id: r.id,
      challenge: r.challenge_rules,
      funded: r.funded_rules,
      denials: r.denials,
    })) satisfies DeskExtra[],
    changes: changes.map((r) => ({
      firmId: r.firm_id,
      checkedAt: r.checked_at,
      before: r.before,
      after: r.after,
    })) satisfies RuleChange[],
  };
});
