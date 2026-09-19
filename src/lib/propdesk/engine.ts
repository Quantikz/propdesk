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
): EngineReply {
  const { intent, topic, selfHit } = classify(userText, files.length > 0);

  if (intent === "escalate") {
    const draft = buildCase(firm, userText, files, email, accountId);
    return {
      text:
        `I treated this as a firm-side issue because you described an operational failure and attached evidence.\n\n` +
        `I will not argue trading performance. I compiled a case for ${firm.name} support (${firm.supportEmail}) with your email as the reply-to so they talk to you, not to this desk.\n\n` +
        `Review the draft below. Send it only if the facts are accurate. Attach the same files to the email — mailbox drafts cannot carry browser uploads automatically.\n\n` +
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
        `This sounds like it could be on ${firm.name} — but I will not email them without evidence. Empty accusations get ignored and can flag your profile.\n\n` +
        `Attach at least two of:\n` +
        `• Dashboard screenshot showing the rule / payout status\n` +
        `• Account statement or trade list with server timestamps\n` +
        `• Denial / breach email with the exact wording\n` +
        `• Payment receipt if this is a double charge or missing account\n\n` +
        `Also confirm your email and account ID in the menu so the case has a reply path.\n\n` +
        `Then resend the same description. If the facts hold, I will compile and open an email to ${firm.supportEmail}.`,
      chips: [
        { text: "Evidence required", tone: "warn" },
        { text: firm.short, tone: "" },
      ],
    };
  }

  if (topic) {
    let extra = "";
    if (selfHit) {
      extra =
        "\n\nFrom what you wrote, this looks like a rule you triggered — not a back-office error. I can still explain the rule and the cleanest next step. I will not email the firm just to relitigate a loss.";
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
      `I need two things to answer this for ${firm.name}:\n` +
      `1. Exact plan name (from the dashboard, not the ad)\n` +
      `2. What the dashboard or email actually says — paste it\n\n` +
      `If this is an operational fault, attach screenshots. I only escalate with evidence.`,
    chips: [{ text: "Need a bit more", tone: "warn" }],
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
    prompt:
      "My payout has been approved for more than the published SLA and I still have not received funds. I have the approval screenshot.",
  },
  {
    title: "Payout denied",
    blurb: "Consistency or min days?",
    prompt:
      "They denied my payout citing consistency. Explain the rule and whether I should keep trading or escalate.",
  },
  {
    title: "Platform outage breach",
    blurb: "Escalate with evidence",
    prompt:
      "I was breached during a platform outage. I have logs and screenshots. This is the firm's fault.",
  },
] as const;
