import { KB } from "./knowledge";
import type { CaseDraft, ChipTone, FileRef, Firm } from "./types";

export function getFirm(id: string): Firm {
  return KB.firms[id] ?? KB.firms.ftmo;
}

export function firmList(): Firm[] {
  return Object.values(KB.firms);
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

export function think(
  firm: Firm,
  userText: string,
  files: FileRef[],
  email: string,
  accountId: string,
  priorUserTurns = 0,
): EngineReply {
  const { intent, topic, selfHit } = classify(userText, files.length > 0);
  const trimmed = userText.trim();
  const greet =
    /^(hi|hello|hey|yo|sup|hiya|good\s+(morning|afternoon|evening)|help|please help|what can you do)[\s!.?]*$/i.test(
      trimmed,
    );

  if (intent === "escalate") {
    const draft = buildCase(firm, userText, files, email, accountId);
    return {
      text:
        `I’ve treated this as a firm-side issue because you described an operational failure and attached evidence.\n\n` +
        `I compiled a letter to ${firm.name} support (${firm.supportEmail}) with you as reply-to. Read it. Send it only if the facts are right, and attach the same files to the email.\n\n` +
        KB.disclaimer,
      chips: [
        { text: "Firm-fault path", tone: "bad" },
        { text: draft.id, tone: "warn" },
        { text: files.length + " file(s)", tone: "ok" },
      ],
      caseDraft: draft,
    };
  }

  if (intent === "need_evidence") {
    return {
      text:
        `That could be on ${firm.name} — I’m not writing to them yet.\n\n` +
        `Tell me the sequence first: what you saw, roughly when, and the exact wording on the page or email. If you already have that screen, attach it. I’ll only ask for account details if we actually send a case.`,
      chips: [
        { text: "Tell me more", tone: "warn" },
        { text: firm.short, tone: "" },
      ],
    };
  }

  if (greet || (!topic && priorUserTurns <= 1)) {
    return {
      text:
        `I’m here. What happened on the ${firm.name} account?\n\n` +
        `Start from what you saw — a number that looked wrong, a payout that didn’t land, a breach you didn’t expect. I’ll ask for screenshots only if we need to write to the firm.`,
      chips: [{ text: "Listening", tone: "ok" }],
    };
  }

  if (topic) {
    let extra = "";
    if (selfHit) {
      extra =
        "\n\nFrom what you wrote this sounds like a rule you hit, not a back-office error. I can still walk the rule. I won’t email the firm just to relitigate a loss.";
    } else {
      extra = "\n\nIf that’s not the screen you’re on, paste what it actually says.";
    }
    return {
      text: topic.answer(firm) + extra,
      chips: [
        { text: topic.title, tone: "ok" },
        { text: firm.short, tone: "" },
      ],
    };
  }

  return {
    text:
      `I’ve got that. What did the dashboard or the email actually say — the wording, not a summary?\n\n` +
      `That’s enough for the next step. Screenshots only if you want this written to ${firm.name}.`,
    chips: [{ text: "One more beat", tone: "warn" }],
  };
}

export function mailtoHref(draft: CaseDraft, email: string) {
  return `mailto:${encodeURIComponent(draft.to)}?cc=${encodeURIComponent(email)}&subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`;
}

export function downloadCase(draft: CaseDraft) {
  const blob = new Blob([draft.body], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${draft.id}.txt`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export const SUGGESTS = [
  {
    title: "Daily drawdown rules",
    blurb: "Does floating loss count against me?",
    prompt: "What is the daily drawdown on my account and does floating loss count?",
  },
  {
    title: "Payout past SLA",
    blurb: "Approved, still not paid",
    prompt: "My payout was approved and I still have not received the funds. I want to understand what should happen next.",
  },
  {
    title: "Payout denied",
    blurb: "Consistency or min days?",
    prompt: "They denied my payout citing consistency. Can you walk me through that rule?",
  },
  {
    title: "Platform outage",
    blurb: "Breached while it was down",
    prompt: "I was breached while the platform was having issues. I want to talk through what happened before we decide anything.",
  },
] as const;
