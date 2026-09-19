import { catalogOverlay } from "./catalog-cache";
import { KB } from "./knowledge";
import type { CaseDraft, ChipTone, FileRef, Firm } from "./types";

export function orderFirmIds(ids: string[]): string[] {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  const head = unique.filter((id) => id === "goat");
  const rest = unique.filter((id) => id !== "goat");
  return [...head, ...rest];
}

function firmMap(): Record<string, Firm> {
  const overlay = catalogOverlay();
  if (overlay?.firms.length) {
    return Object.fromEntries(overlay.firms.map((f) => [f.id, f]));
  }
  return KB.firms;
}

export function getFirm(id: string): Firm {
  const map = firmMap();
  return map[id] ?? map.goat ?? KB.firms.goat ?? KB.firms.ftmo;
}

export function firmList(): Firm[] {
  const map = firmMap();
  return orderFirmIds(Object.keys(map)).map((id) => map[id]);
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function scoreTopic(q: string, topic: (typeof KB.topics)[number]) {
  const t = q.toLowerCase();
  let score = 0;
  for (const tag of topic.tags) {
    if (t.includes(tag)) score += tag.length > 8 ? 3 : 2;
  }
  for (const w of topic.title.toLowerCase().split(" ")) {
    if (w.length > 3 && t.includes(w)) score += 1;
  }
  return score;
}

export function classify(q: string, hasFiles: boolean) {
  const t = q.toLowerCase();
  const escalateHit = KB.escalateSignals.some((s) => t.includes(s));
  const selfHit = KB.notFirmFaultSignals.some((s) => t.includes(s));
  const scores = KB.topics
    .map((topic) => ({ topic, score: scoreTopic(t, topic) }))
    .sort((a, b) => b.score - a.score);
  const best = scores[0] && scores[0].score >= 2 ? scores[0].topic : null;
  let intent: "faq" | "escalate" | "need_evidence" | "clarify" = "faq";
  if (escalateHit && hasFiles && !selfHit) intent = "escalate";
  else if (escalateHit && !hasFiles) intent = "need_evidence";
  else if (best) intent = "faq";
  else intent = "clarify";
  return { intent, topic: best, escalateHit, selfHit };
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function buildCase(
  firm: Firm,
  userText: string,
  files: FileRef[],
  email: string,
  accountId: string,
): CaseDraft {
  const id =
    "PD-" +
    new Date().toISOString().slice(0, 10).replace(/-/g, "") +
    "-" +
    uid().slice(0, 4).toUpperCase();
  const fileList = files.length
    ? files
        .map((x, i) => `  ${i + 1}. ${x.name} (${Math.round(x.size / 1024)} KB)`)
        .join("\n")
    : "  (trader will attach screenshots to the email)";
  const body = `SUBJECT: Formal review request — ${firm.name} account ${accountId || "[missing]"} [${id}]

To: ${firm.supportEmail}
From / reply-to: ${email}
CC: ${email}

Hello ${firm.name} Support,

This case was compiled by PropDesk, an independent trader support desk. The trader believes the issue is on the firm side and has provided evidence. Please reply directly to the trader at ${email}.

CASE ID: ${id}
FIRM: ${firm.name}
TRADER EMAIL: ${email}
ACCOUNT / LOGIN: ${accountId || "Not provided — trader to confirm"}
DATE OPENED: ${new Date().toUTCString()}

ISSUE AS DESCRIBED BY THE TRADER
${userText.trim()}

EVIDENCE ATTACHED
${fileList}

WHAT WE ARE ASKING
1. Confirm the exact rule clause (quote the current terms) that applies.
2. Reconcile dashboard figures against the attached statement / screenshots.
3. If a payout was already approved, provide the processor reference and ETA.
4. If an operational error is confirmed, state the remedy (restore account, honor payout, or refund).

Please keep the trader copied on all replies.

Regards,
PropDesk on behalf of ${email}
${id}
`;
  return {
    id,
    to: firm.supportEmail,
    firmName: firm.name,
    subject: `Formal review request — ${firm.name} account ${accountId || "unknown"} [${id}]`,
    body,
  };
}

export type EngineReply = {
  text: string;
  chips?: { text: string; tone?: ChipTone }[];
  caseDraft?: CaseDraft | null;
  sources?: { url: string; title?: string }[];
};

export const SUGGESTS = [
  {
    title: "Daily drawdown",
    blurb: "Does floating loss count?",
    prompt: "Does floating (open) loss count against daily drawdown on this firm, or is it end-of-day / balance based? Check the current rule if the pack is vague.",
  },
  {
    title: "Payouts",
    blurb: "Split, timing, first payout",
    prompt: "Walk the first-payout checklist on this firm: KYC, min days, consistency, news, and how to request. Don’t mix 1-step with 2-step.",
  },
  {
    title: "News and EAs",
    blurb: "What is actually allowed?",
    prompt: "Can I trade news and use an EA on a funded account here? What is actually banned vs allowed on the plan?",
  },
  {
    title: "Which plan fits",
    blurb: "1-step, 2-step, or instant",
    prompt: "Which plan on this firm should I actually buy — 1-step, 2-step, instant, or futures — and what changes on payouts and drawdown?",
  },
] as const;

export function mailtoHref(draft: CaseDraft, replyTo: string) {
  const cc = replyTo ? `&cc=${encodeURIComponent(replyTo)}` : "";
  return `mailto:${encodeURIComponent(draft.to)}?subject=${encodeURIComponent(draft.subject)}${cc}&body=${encodeURIComponent(draft.body)}`;
}

export function downloadCase(draft: CaseDraft) {
  const blob = new Blob([draft.body], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${draft.id}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

