import { createServerFn } from "@tanstack/react-start";
import { getFirm } from "./engine";
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

function needsWebSearch(text: string) {
  const t = text.toLowerCase();
  return (
    /last month|this month|this week|yesterday|today|right now|currently|as of|2025|2026/.test(t) ||
    /highest payout|biggest payout|single payout|largest payout|payout proof|who paid|must pay/.test(t) ||
    /average (payout|processing)|processing time|how long.{0,20}payout|payout.{0,20}(sla|speed|time)/.test(t) ||
    /leaderboard|most paid|reliability|do they (actually )?pay/.test(t) ||
    /\b(check|verify|confirm|live look|look up|search|current rule)\b/.test(t)
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
  const packIds =
    mode === "compare"
      ? Array.from(new Set([...firmIds, ...mentioned])).slice(0, 4)
      : Array.from(new Set([firmId, ...mentioned])).slice(0, 4);
  const packs = packIds.map((id) => faqPack(id)).join("\n\n");
  const names = packIds.map((id) => getFirm(id).name).join(", ");
  const table = mode === "compare" ? compareTable(firmIds.length ? firmIds : packIds) : "";
  const who = mode === "compare" ? names : getFirm(firmId).name;

  const liveBlock = live
    ? `The FAQ pack does not answer this. Search the public web first — official firm pages, help centers, and recent payout-proof / processing-time reports. Then answer with what you found. Do not say you will look it up later. Do not say “the pack doesn’t have it” without searching. If there is no ranked last-month leaderboard, say that after the search and report published split, advertised processing time, and any recent payout-proof commentary. Name sources in plain words.`
    : `Answer from the FAQ packs. Do not search.`;

  return `You work PropDesk’s ${mode === "compare" ? "compare" : "FAQ"} desk for ${who}. Pre-support only — no tickets, no emails to firms.

${liveBlock}

Voice: plain speech, short paragraphs. No markdown tables, no ### headings, no | pipes. Bold is fine. Do not invent fees, retries, dates, or a fake leaderboard. No trade signals.

${mode === "compare" ? `Compare snapshot:\n${table}\n` : ""}FAQ packs (background only${live ? " — search beats these if they disagree" : ""}):
${packs}

${mode === "compare" ? "" : `Other firms we cover:\n${firmRoster()}\n`}
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
    const ids = data.firmIds.length ? data.firmIds : [data.firmId];
    const live = needsWebSearch(lastUserText(data.messages));
    const system = systemPrompt(data.mode, data.firmId, ids, data.messages, live);
    const domains = domainsFor(ids);
    let result: GrokOk | GrokErr;
    if (live) {
      try {
        result = await callResponses(apiKey, system, data.messages, domains, true);
      } catch {
        result = { ok: false, error: "search failed" };
      }
      if (!result.ok) {
        const fallback = systemPrompt(data.mode, data.firmId, ids, data.messages, false);
        result = await callChat(
          apiKey,
          fallback +
            "\nLive web lookup failed this turn. Say you could not reach live pages, then answer from the pack. Do not pretend you searched.",
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
