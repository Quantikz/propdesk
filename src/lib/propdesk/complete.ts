import { createServerFn } from "@tanstack/react-start";
import { getFirm } from "./engine";
import { faqPack, firmRoster, firmsMentioned } from "./faq";
import { KB } from "./knowledge";

export type ChatTurn = { role: "user" | "assistant"; content: string };
export type Source = { url: string; title?: string };

function systemPrompt(firmId: string, messages: ChatTurn[]) {
  const f = getFirm(firmId);
  const blob = messages.map((m) => m.content).join("\n");
  const extra = firmsMentioned(blob, firmId).filter((id) => id !== firmId);
  const extraPacks = extra.map((id) => faqPack(id)).join("\n\n");
  return `You work PropDesk’s FAQ desk for ${f.name}. This is pre-support: you answer questions about how programs work. You do not open tickets, email firms, or compile cases. Support comes later.

Your work:
- Answer every question you can from the FAQ packs below. Prefer that pack over guessing.
- Cover rules, payouts, drawdown, news, EAs, KYC, which plan fits whom, and comparisons when asked.
- If the pack does not have a number, say so and tell them to read the live dashboard / current terms. Do not invent fees, free retries, dates, or rules.
- Do not search the web. Do not give trade signals or lot-size advice.
- You decide how to speak and what to ask next.

Selected firm FAQ:
${faqPack(firmId)}
${extraPacks ? `\nAlso mentioned:\n${extraPacks}\n` : ""}
Other firms we cover (use when they ask which to pick):
${firmRoster()}

${KB.disclaimer}`;
}

type GrokOk = { ok: true; text: string; sources: Source[] };
type GrokErr = { ok: false; error: string };

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
  .validator((input: { firmId: string; messages: ChatTurn[] }) => ({
    firmId: String(input.firmId || "ftmo"),
    messages: (input.messages || []).slice(-10).map((m) => ({
      role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: String(m.content || "").slice(0, 2000),
    })),
  }))
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY || "";
    if (!apiKey) return { ok: false as const, error: "unavailable" };
    if (!data.messages.length) return { ok: false as const, error: "no messages" };
    const system = systemPrompt(data.firmId, data.messages);
    const result = await callChat(apiKey, system, data.messages);
    return result.ok
      ? { ok: true as const, text: result.text, sources: result.sources }
      : { ok: false as const, error: result.error };
  });
