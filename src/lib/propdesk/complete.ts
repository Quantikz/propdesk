import { createServerFn } from "@tanstack/react-start";
import { getFirm } from "./engine";
import { KB } from "./knowledge";

export type ChatTurn = { role: "user" | "assistant"; content: string };
export type Source = { url: string; title?: string };

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
    topstep: ["help.topstep.com"],
  };
  return Array.from(new Set([host, ...(extras[firmId] ?? [])])).slice(0, 5);
}

function firmBrief(firmId: string) {
  const f = getFirm(firmId);
  return [
    `Firm: ${f.name} (${f.short})`,
    `Official site: ${f.portal}`,
    `Support inbox: ${f.supportEmail}`,
    `Models: ${f.models.join(", ")}`,
    `Platforms: ${f.platforms.join(", ")}`,
    `Profit split (snapshot): ${f.profitSplit}`,
    `Payout cycle (snapshot): ${f.payoutCycle}`,
    `Typical payout SLA after approval: ${f.payoutSlaDays} business days`,
    `Drawdown (snapshot): ${f.drawdown}`,
    `Consistency (snapshot): ${f.consistency}`,
    `News (snapshot): ${f.news}`,
    `EAs (snapshot): ${f.ea}`,
    `KYC (snapshot): ${f.kyc}`,
    `Notes: ${f.notes}`,
  ].join("\n");
}

function systemPrompt(firmId: string, email: string, accountId: string, files: string[]) {
  const f = getFirm(firmId);
  const domains = firmDomains(firmId);
  return `You work PropDesk, an independent support desk for traders at ${f.name}. You are not ${f.name}, not a lawyer, and not the firm's staff.

Your work:
- Hear the trader. Find out what happened before you conclude anything.
- When a rule, payout, drawdown, news, EA, KYC, or terms question is in play, look it up on ${domains.join(", ")}. The live site beats the snapshot below.
- Explain what the current rules mean for this person.
- Draft a case the trader can send to ${f.name} support (${f.supportEmail}) only when the firm itself is at fault and there is evidence. Firm-fault means: figures that do not match the dashboard, an approved payout that has not been paid past the SLA, a breach caused by an outage, a charge for an account that was never issued, or a penalty that is not in the current terms.
- Ordinary losses, daily drawdown hits, consistency parks, requesting payout too early, and unfinished KYC stay with the trader. You still explain them.
- Do not invent money, retries, dates, or rules that are not on the site.
- Do not give trade signals or lot-size advice.

You decide how to speak, what to ask next, and when you have enough to act.

On file:
- Email: ${email || "not given"}
- Account / login: ${accountId || "not given"}
- Files this turn: ${files.length ? files.join(", ") : "none"}

Snapshot of ${f.name} (may be stale — search the site):
${firmBrief(firmId)}

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
  const urls: Source[] = [];
  const seen = new Set<string>();
  const add = (raw: string, title?: string) => {
    const url = cleanUrl(raw);
    if (!url) return;
    const key = url.replace(/\/$/, "");
    if (seen.has(key)) return;
    seen.add(key);
    let host = key;
    try {
      host = new URL(url).hostname.replace(/^www\./, "");
    } catch {
      /* keep */
    }
    urls.push({ url, title: title && title.length > 3 ? title : host });
  };
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    if (o.type === "message" && Array.isArray(o.content)) {
      for (const c of o.content as { annotations?: { type?: string; url?: string; title?: string }[] }[]) {
        for (const a of c.annotations ?? []) {
          if (a.type === "url_citation" && a.url) add(a.url, a.title);
        }
      }
    }
    if (o.type === "web_search_call") {
      const action = o.action as { type?: string; url?: string } | undefined;
      if (action?.type === "open_page" && action.url) add(action.url);
    }
  }
  return urls.slice(0, 4);
}

function extractText(output: unknown[]): string {
  const parts: string[] = [];
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const o = item as { type?: string; content?: { type?: string; text?: string }[] };
    if (o.type !== "message" || !Array.isArray(o.content)) continue;
    for (const c of o.content) {
      if ((c.type === "output_text" || c.type === "text") && c.text) parts.push(c.text);
    }
  }
  return parts.join("\n").trim();
}

export const getAiStatus = createServerFn({ method: "POST" }).handler(async () => {
  return { hosted: Boolean(process.env.XAI_API_KEY) };

});

type GrokOk = { ok: true; text: string; sources: Source[] };
type GrokErr = { ok: false; error: string };

async function callResponses(
  apiKey: string,
  system: string,
  messages: ChatTurn[],
  domains: string[],
): Promise<GrokOk | GrokErr> {
  const res = await fetch("https://api.x.ai/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-4.5",
      temperature: 0.55,
      max_output_tokens: 700,
      max_tool_calls: 4,
      tools: [
        {
          type: "web_search",
          filters: { allowed_domains: domains },
        },
      ],
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
  const body = (await res.json()) as { output?: unknown[]; status?: string };
  const text = extractText(body.output ?? []);
  if (!text) return { ok: false, error: "empty model reply" };
  return { ok: true, text, sources: collectSources(body.output ?? []) };
}

async function callChatFallback(
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
      temperature: 0.55,
      max_tokens: 700,
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
    email: string;
    accountId: string;
    files: string[];
    messages: ChatTurn[];
  }) => ({
    firmId: String(input.firmId || "ftmo"),
    email: String(input.email || "").slice(0, 200),
    accountId: String(input.accountId || "").slice(0, 80),
    files: (input.files || []).slice(0, 8).map((n) => String(n).slice(0, 120)),
    messages: (input.messages || []).slice(-10).map((m) => ({
      role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: String(m.content || "").slice(0, 2000),
    })),
  }))
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY || "";
    if (!apiKey) return { ok: false as const, error: "AI is not available" };
    if (!data.messages.length) return { ok: false as const, error: "no messages" };

    const system = systemPrompt(data.firmId, data.email, data.accountId, data.files);
    const domains = firmDomains(data.firmId);
    let result = await callResponses(apiKey, system, data.messages, domains);
    if (!result.ok) {
      result = await callChatFallback(apiKey, system, data.messages);
    }
    return result.ok
      ? { ok: true as const, text: result.text, sources: result.sources }
      : { ok: false as const, error: result.error };
  });
