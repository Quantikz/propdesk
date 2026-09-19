import { createServerFn } from "@tanstack/react-start";
import { getFirm, orderFirmIds } from "./engine";
import { compareTable, faqPack, firmRoster, firmsMentioned } from "./faq";
import { KB } from "./knowledge";

export type ChatTurn = { role: "user" | "assistant"; content: string };
export type Source = { url: string; title?: string };
export type DeskMode = "desk" | "compare";

function firmDomains(firmId: string): string[] {
  const f = getFirm(firmId);
  let host = "ftmo.com";
  try {
    host = new URL(f.portal).hostname.replace(/^www\./, "");
  } catch {
    /* keep default */
  }
  const extras: Record<string, string[]> = {
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
  return Array.from(new Set([host, ...(extras[firmId] ?? [])])).slice(0, 4);
}

function domainsFor(ids: string[]): string[] {
  return Array.from(new Set(ids.flatMap(firmDomains))).slice(0, 8);
}

function lastUserText(messages: ChatTurn[]) {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i]?.role === "user") return messages[i].content;
  }
  return "";
}

function siteLines(ids: string[]): string {
  return orderFirmIds(ids)
    .map((id) => {
      const f = getFirm(id);
      return `- ${f.name}: ${f.portal}`;
    })
    .join("\n");
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
  const packs = packIds.map((id) => faqPack(id)).join("\n\n");
  const names = packIds.map((id) => getFirm(id).name).join(", ");
  const table = mode === "compare" ? compareTable(packIds) : "";
  const who = mode === "compare" ? names : getFirm(firmId).name;

  return `You work PropDesk’s ${mode === "compare" ? "compare" : "FAQ"} desk for ${who}. Pre-support: you answer questions. You do not open tickets or email firms.

You CAN and SHOULD open live firm websites. Checking the official pages is in scope. Never say searching or scraping is out of scope. Never say this desk does not check live sites.

How to know things:
- Use the FAQ pack for standard rules when it already answers.
- If the pack is silent, vague, or the trader asks to check the site / current / last-month / highest / average figures — search the official pages below and answer from what you find.
- Official pages beat the pack when they disagree.
- If a ranked last-month payout leaderboard is not published, say that after looking, then report published split and advertised processing time.
- When you list firms, put Goat Funded Trader first if it is in the set. Do not invent facts for it.

Official pages to open:
${siteLines(packIds)}

Voice: plain speech, short paragraphs. No markdown tables, no ### headings, no | pipes. Bold is fine. No fake leaderboards. No trade signals.

${live ? "Search now. Then answer. Do not say you will look later." : "Answer from the pack. You may still mention the official URL if they should confirm a number."}

${mode === "compare" ? `Compare snapshot:\n${table}\n` : ""}FAQ packs (background; live pages win):
${packs}

${mode === "compare" ? "" : `Other firms we cover (Goat Funded Trader first):\n${firmRoster()}\n`}
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
  if (!res.ok) {
    const err = await res.text();
    return { ok: false, error: `xAI ${res.status} ${err.slice(0, 180)}` };
  }
  const body = (await res.json()) as { output?: unknown[] };
  const text = extractText(body.output ?? []);
  if (!text) return { ok: false, error: "empty model reply" };
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
  if (!res.ok) {
    const err = await res.text();
    return { ok: false, error: `xAI ${res.status} ${err.slice(0, 180)}` };
  }
  const body = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = body.choices?.[0]?.message?.content?.trim() ?? "";
  if (!text) return { ok: false, error: "empty model reply" };
  return { ok: true, text, sources: [] };
}

export const completeTicket = createServerFn({ method: "POST" })
  .validator((input: {
    firmId: string;
    firmIds?: string[];
    mode?: DeskMode;
    messages: ChatTurn[];
  }) => ({
    firmId: String(input.firmId || "ftmo"),
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
    const apiKey = process.env.XAI_API_KEY || "";
    if (!apiKey) return { ok: false as const, error: "unavailable" };
    if (!data.messages.length) return { ok: false as const, error: "no messages" };
    const ids = orderFirmIds(data.firmIds.length ? data.firmIds : [data.firmId]);
    const q = lastUserText(data.messages);
    const live = data.mode === "compare" || needsWebSearch(q);
    const openWeb = needsWebSearch(q);
    const system = systemPrompt(data.mode, data.firmId, ids, data.messages, live);
    const domains = domainsFor(ids);
    let result: GrokOk | GrokErr;
    if (live) {
      try {
        result = await callResponses(apiKey, system, data.messages, domains, openWeb);
      } catch {
        result = { ok: false, error: "search failed" };
      }
      if (!result.ok && !openWeb) {
        try {
          result = await callResponses(apiKey, system, data.messages, domains, true);
        } catch {
          result = { ok: false, error: "search failed" };
        }
      }
      if (!result.ok) {
        result = await callChat(
          apiKey,
          systemPrompt(data.mode, data.firmId, ids, data.messages, false) +
            "\nThe live pages did not load this turn. Answer from the pack. Do not say that checking websites is out of scope — it is in scope; this turn just failed.",
          data.messages,
        );
      }
    } else {
      result = await callChat(apiKey, system, data.messages);
    }
    return result.ok
      ? { ok: true as const, text: result.text, sources: result.sources }
      : { ok: false as const, error: result.error };
  });
