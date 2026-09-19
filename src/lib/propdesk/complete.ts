import { createServerFn } from "@tanstack/react-start";
import { orderFirmIds } from "./engine";
import { firmsMentioned } from "./faq";
import { KB } from "./knowledge";
import type { CatalogPayload } from "./catalog-cache";

export type ChatTurn = { role: "user" | "assistant"; content: string };
export type Source = { url: string; title?: string };
export type DeskMode = "desk" | "compare";

const GROQ_CHAT = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_UA = "PropDesk/1.0 (+https://propdesk-beta.vercel.app)";

function lastUserText(messages: ChatTurn[]) {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i]?.role === "user") return messages[i].content;
  }
  return "";
}

function needsWebSearch(text: string) {
  const t = text.toLowerCase();
  return (
    /last month|this month|this week|yesterday|today|right now|currently|as of|2025|2026/.test(t) ||
    /highest payout|biggest payout|single payout|largest payout|payout proof|who paid|must pay/.test(t) ||
    /average (payout|processing)|processing time|how long.{0,20}payout|payout.{0,20}(sla|speed|time)/.test(t) ||
    /leaderboard|most paid|reliability|do they (actually )?pay/.test(t) ||
    /\b(check|chexk|verify|confirm|look up|search|website|web site|firm site|official|live page|their page|their site)\b/.test(
      t,
    )
  );
}

function systemPrompt(
  cat: CatalogPayload,
  pack: {
    faqPackFromCatalog: (c: CatalogPayload, id: string) => string;
    rosterFromCatalog: (c: CatalogPayload) => string;
    compareFromCatalog: (c: CatalogPayload, ids: string[]) => string;
    firmFromCatalog: (c: CatalogPayload, id: string) => { name: string; portal: string };
  },
  mode: DeskMode,
  firmId: string,
  firmIds: string[],
  messages: ChatTurn[],
  live: boolean,
) {
  const blob = messages.map((m) => m.content).join("\n");
  const mentioned = firmsMentioned(blob, firmId);
  const packIds = orderFirmIds(
    mode === "compare"
      ? Array.from(new Set([...firmIds, ...mentioned]))
      : Array.from(new Set([firmId, ...mentioned])),
  ).slice(0, 4);
  const packs = packIds.map((id) => pack.faqPackFromCatalog(cat, id)).join("\n\n");
  const names = packIds.map((id) => pack.firmFromCatalog(cat, id).name).join(", ");
  const table = mode === "compare" ? pack.compareFromCatalog(cat, packIds) : "";
  const who = mode === "compare" ? names : pack.firmFromCatalog(cat, firmId).name;
  const sites = packIds
    .map((id) => {
      const f = pack.firmFromCatalog(cat, id);
      return `- ${f.name}: ${f.portal}`;
    })
    .join("\n");

  return `You work PropDesk’s ${mode === "compare" ? "compare" : "FAQ"} desk for ${who}. Pre-support: you answer questions. You do not open tickets or email firms.

You CAN and SHOULD open live firm websites. Checking the official pages is in scope. Never say searching or scraping is out of scope. Never say this desk does not check live sites.

How to know things:
- Use the FAQ pack for standard rules when it already answers.
- If the pack is silent, vague, or the trader asks to check the site / current / last-month / highest / average figures — search the official pages below and answer from what you find.
- Official pages beat the pack when they disagree.
- If a ranked last-month payout leaderboard is not published, say that after looking, then report published split and advertised processing time.
- When you list firms, put Goat Funded Trader first if it is in the set. Do not invent facts for it.

Official pages to open:
${sites}
Payout trackers (use for last-month / count / largest / processing time — quote the source):
- https://payoutjunction.com/statistics (on-chain JSON they license for quoting)
- https://payoutjunction.com/30d
- https://propfirmmatch.com/payouts
- https://propfirmmatch.com/payouts-leaderboard
- Per-firm Junction pages for Goat Funded Trader, FundedNext, The5ers, FundingPips, E8, ACG, Instant Funding

Never mix 1-step, 2-step, instant, and futures SKUs. Ask which plan they bought if it changes the answer.

Voice: plain speech, short paragraphs. No markdown tables, no ### headings, no | pipes. Bold is fine. No fake leaderboards. No trade signals.

${live ? "Search now. Then answer. Do not say you will look later." : "Answer from the pack. You may still mention the official URL if they should confirm a number."}

${mode === "compare" ? `Compare snapshot:\n${table}\n` : ""}FAQ packs (background; live pages win):
${packs}

${mode === "compare" ? "" : `Other firms we cover (Goat Funded Trader first):\n${pack.rosterFromCatalog(cat)}\n`}
${KB.disclaimer}`;
}

function cleanUrl(raw: string): string | null {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return null;
    ["gclid", "gbraid", "wbraid", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "_gl", "_gs"].forEach(
      (k) => u.searchParams.delete(k),
    );
    u.hash = "";
    return u.toString();
  } catch {
    return null;
  }
}

function collectSources(output: unknown[]): Source[] {
  const found = new Map<string, Source>();
  const walk = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    const o = node as Record<string, unknown>;
    const url = typeof o.url === "string" ? o.url : typeof o.uri === "string" ? o.uri : "";
    if (url.startsWith("https://")) {
      const cleaned = cleanUrl(url);
      if (cleaned && !found.has(cleaned)) {
        found.set(cleaned, {
          url: cleaned,
          title: typeof o.title === "string" ? o.title : undefined,
        });
      }
    }
    for (const v of Object.values(o)) {
      if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === "object") walk(v);
    }
  };
  output.forEach(walk);
  return [...found.values()].slice(0, 6);
}

function extractText(output: unknown[]): string {
  const parts: string[] = [];
  const walk = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    const o = node as { type?: string; text?: string; content?: unknown };
    if ((o.type === "output_text" || o.type === "text") && typeof o.text === "string" && o.text.trim()) {
      parts.push(o.text.trim());
    }
    if (Array.isArray(o.content)) o.content.forEach(walk);
  };
  output.forEach(walk);
  return [...new Set(parts)].join("\n\n").trim();
}

function sourcesFromGroq(message: Record<string, unknown>): Source[] {
  const found = new Map<string, Source>();
  const add = (raw: string, title?: string) => {
    const cleaned = cleanUrl(raw);
    if (cleaned && !found.has(cleaned)) found.set(cleaned, { url: cleaned, title });
  };
  const blob = JSON.stringify(message);
  for (const m of blob.matchAll(/https:\/\/[^\s"'<>\\]+/g)) {
    add(m[0].replace(/[),.;]+$/, ""));
  }
  const tools = message.executed_tools;
  if (Array.isArray(tools)) {
    for (const tool of tools) {
      if (!tool || typeof tool !== "object") continue;
      const o = tool as Record<string, unknown>;
      const output = typeof o.output === "string" ? o.output : "";
      for (const line of output.split("\n")) {
        const url = line.match(/URL:\s*(https:\/\/\S+)/i)?.[1];
        const title = line.match(/^Title:\s*(.+)$/i)?.[1];
        if (url) add(url, title?.trim());
      }
    }
  }
  return [...found.values()].slice(0, 6);
}

type GrokOk = { ok: true; text: string; sources: Source[] };
type GrokErr = { ok: false; error: string };

async function callResponses(
  apiKey: string,
  system: string,
  messages: ChatTurn[],
  domains: string[],
  openWeb: boolean,
): Promise<GrokOk | GrokErr> {
  const tool: Record<string, unknown> = { type: "web_search" };
  if (!openWeb && domains.length) {
    tool.filters = { allowed_domains: domains };
  }
  const res = await fetch("https://api.x.ai/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    signal: AbortSignal.timeout(openWeb ? 35000 : 12000),
    body: JSON.stringify({
      model: "grok-4.5",
      temperature: 0.4,
      max_output_tokens: 700,
      max_tool_calls: openWeb ? 4 : 2,
      tools: [tool],
      input: [
        { role: "system", content: system },
        ...messages.map((m) => ({
          role: m.role,
          content: m.content.slice(0, 2000),
        })),
      ],
    }),
  });
  if (!res.ok) return { ok: false, error: "unavailable" };
  const body = (await res.json()) as { output?: unknown[] };
  const text = extractText(body.output ?? []);
  if (!text) return { ok: false, error: "unavailable" };
  return { ok: true, text, sources: collectSources(body.output ?? []) };
}

async function callChat(
  apiKey: string,
  system: string,
  messages: ChatTurn[],
): Promise<GrokOk | GrokErr> {
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-4.5",
      temperature: 0.4,
      max_tokens: 650,
      messages: [
        { role: "system", content: system },
        ...messages.map((m) => ({
          role: m.role,
          content: m.content.slice(0, 2000),
        })),
      ],
    }),
  });
  if (!res.ok) return { ok: false, error: "unavailable" };
  const body = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = body.choices?.[0]?.message?.content?.trim() ?? "";
  if (!text) return { ok: false, error: "unavailable" };
  return { ok: true, text, sources: [] };
}

async function groqRequest(
  apiKey: string,
  payload: Record<string, unknown>,
  timeoutMs: number,
): Promise<GrokOk | GrokErr> {
  const live = String(payload.model || "").includes("compound") || Array.isArray(payload.tools);
  const run = async () =>
    fetch(GROQ_CHAT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "User-Agent": GROQ_UA,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(timeoutMs),
      body: JSON.stringify(payload),
    });

  let res: Response;
  try {
    res = await run();
  } catch (err) {
    console.error("[desk] groq network", err instanceof Error ? err.message : "fail");
    return { ok: false, error: "unavailable" };
  }
  if (res.status === 429) {
    await new Promise((r) => setTimeout(r, 900));
    try {
      res = await run();
    } catch {
      return { ok: false, error: "unavailable" };
    }
  }

  let body: {
    error?: { message?: string; code?: string };
    choices?: { message?: Record<string, unknown> }[];
  } = {};
  try {
    body = (await res.json()) as typeof body;
  } catch {
    console.error("[desk] groq bad json", res.status);
    return { ok: false, error: "unavailable" };
  }
  if (!res.ok || body.error) {
    console.error("[desk] groq", res.status, body.error?.code || "", (body.error?.message || "").slice(0, 180));
    return { ok: false, error: "unavailable" };
  }
  const message = body.choices?.[0]?.message ?? {};
  const text = typeof message.content === "string" ? message.content.trim() : "";
  if (!text) {
    console.error("[desk] groq empty", payload.model);
    return { ok: false, error: "unavailable" };
  }
  return { ok: true, text, sources: live ? sourcesFromGroq(message) : [] };
}

async function callGroq(
  apiKey: string,
  system: string,
  messages: ChatTurn[],
  live: boolean,
): Promise<GrokOk | GrokErr> {
  const turns = messages.map((m) => ({
    role: m.role,
    content: m.content.slice(0, 1600),
  }));
  const packSystem =
    system.slice(0, 8000) +
    "\nAnswer from the pack. Do not request tools. If a number is missing, say what to confirm on the official help page.";
  const packMessages = [{ role: "system" as const, content: packSystem }, ...turns];

  if (live) {
    const searched = await groqRequest(
      apiKey,
      {
        model: "groq/compound-mini",
        messages: [{ role: "system", content: system.slice(0, 6000) }, ...turns],
      },
      22000,
    );
    if (searched.ok) return searched;
  }

  const packed = await groqRequest(
    apiKey,
    {
      model: "qwen/qwen3.8-27b",
      temperature: 0.3,
      max_tokens: 900,
      disable_tool_validation: true,
      messages: packMessages,
    },
    15000,
  );
  if (packed.ok) return packed;

  const withSearch = await groqRequest(
    apiKey,
    {
      model: "openai/gpt-oss-20b",
      temperature: 0.3,
      max_completion_tokens: 1200,
      reasoning_effort: "low",
      tools: [{ type: "browser_search" }],
      messages: [{ role: "system", content: system.slice(0, 7000) }, ...turns],
    },
    25000,
  );
  if (withSearch.ok) return withSearch;

  return groqRequest(
    apiKey,
    {
      model: "groq/compound-mini",
      messages: packMessages,
    },
    22000,
  );
}

async function completeWithXai(
  apiKey: string,
  cat: CatalogPayload,
  pack: typeof import("./catalog.server"),
  data: { firmId: string; firmIds: string[]; mode: DeskMode; messages: ChatTurn[] },
  ids: string[],
  live: boolean,
  openWeb: boolean,
): Promise<GrokOk | GrokErr> {
  const system = systemPrompt(cat, pack, data.mode, data.firmId, ids, data.messages, live);
  const domains = pack.hostsFor(cat, ids);
  let result: GrokOk | GrokErr;
  if (live) {
    try {
      result = await callResponses(apiKey, system, data.messages, domains, openWeb);
    } catch {
      result = { ok: false, error: "unavailable" };
    }
    if (!result.ok && !openWeb) {
      try {
        result = await callResponses(apiKey, system, data.messages, domains, true);
      } catch {
        result = { ok: false, error: "unavailable" };
      }
    }
    if (!result.ok) {
      result = await callChat(
        apiKey,
        systemPrompt(cat, pack, data.mode, data.firmId, ids, data.messages, false) +
          "\nThe live pages did not load this turn. Answer from the pack. Do not say that checking websites is out of scope — it is in scope; this turn just failed.",
        data.messages,
      );
    }
  } else {
    result = await callChat(apiKey, system, data.messages);
  }
  return result;
}

export const completeTicket = createServerFn({ method: "POST" })
  .validator((input: {
    firmId: string;
    firmIds?: string[];
    mode?: DeskMode;
    messages: ChatTurn[];
  }) => ({
    firmId: String(input.firmId || "goat"),
    firmIds: Array.isArray(input.firmIds)
      ? input.firmIds.map(String).slice(0, 4)
      : [],
    mode: input.mode === "compare" ? ("compare" as const) : ("desk" as const),
    messages: (input.messages || []).slice(-10).map((m) => ({
      role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: String(m.content || "").slice(0, 2000),
    })),
  }))
  .handler(async ({ data }) => {
    const groqKey = (process.env.GROQ_API_KEY || "").trim();
    const xaiKey = (process.env.XAI_API_KEY || "").trim();
    if (!groqKey && !xaiKey) return { ok: false as const, error: "unavailable" };
    if (!data.messages.length) return { ok: false as const, error: "unavailable" };

    const pack = await import("./catalog.server");
    const cat = await pack.cachedCatalog();

    const ids = orderFirmIds(data.firmIds.length ? data.firmIds : [data.firmId]);
    const q = lastUserText(data.messages);
    const live = data.mode === "compare" || needsWebSearch(q);
    const openWeb = needsWebSearch(q);
    const system = systemPrompt(cat, pack, data.mode, data.firmId, ids, data.messages, live);

    let result: GrokOk | GrokErr = { ok: false, error: "unavailable" };

    if (groqKey) {
      try {
        result = await callGroq(groqKey, system, data.messages, live);
      } catch {
        result = { ok: false, error: "unavailable" };
      }
      if (!result.ok && live) {
        try {
          result = await callGroq(
            groqKey,
            systemPrompt(cat, pack, data.mode, data.firmId, ids, data.messages, false) +
              "\nThe live pages did not load this turn. Answer from the pack. Do not say that checking websites is out of scope — it is in scope; this turn just failed.",
            data.messages,
            false,
          );
        } catch {
          result = { ok: false, error: "unavailable" };
        }
      }
    }

    if (!result.ok && xaiKey) {
      result = await completeWithXai(xaiKey, cat, pack, data, ids, live, openWeb);
    }

    return result.ok
      ? { ok: true as const, text: result.text, sources: result.sources }
      : { ok: false as const, error: "unavailable" };
  });
