import type { FaqItem } from "./faq";

export type RuleHit = {
  firmId: string;
  firm: string;
  title: string;
  body: string;
  score: number;
};

type FirmSlice = {
  id: string;
  name: string;
  short: string;
  drawdown: string;
  consistency: string;
  news: string;
  ea: string;
  kyc: string;
  profitSplit: string;
  payoutCycle: string;
  notes: string;
};

type PlanSlice = {
  name: string;
  kind: string;
  target: string;
  daily: string;
  max: string;
  note: string;
};

type FirstSlice = {
  kyc: string;
  minDays: string;
  consistency: string;
  news: string;
  request: string;
};

const STOP = new Set([
  "the",
  "and",
  "for",
  "with",
  "this",
  "that",
  "what",
  "how",
  "does",
  "can",
  "are",
  "you",
  "your",
  "from",
  "about",
  "when",
  "have",
  "not",
  "but",
  "its",
  "it",
  "on",
  "of",
  "a",
  "an",
  "to",
  "is",
  "my",
  "me",
]);

/** Asking about one of these pulls every FAQ / card in the same gate, not the single best line. */
const CLUSTERS: { id: string; ask: string[]; hit: string[] }[] = [
  {
    id: "drawdown",
    ask: [
      "drawdown",
      "draw down",
      "daily loss",
      "max loss",
      "maximum loss",
      "trailing",
      "equity",
      "floating",
      "open loss",
      "open p",
      "eod",
      "end of day",
      "breach",
      "blown",
      "fail the account",
      "mll",
      "daily dd",
    ],
    hit: ["drawdown", "daily", "max", "trailing", "equity", "floating", "breach", "eod", "loss"],
  },
  {
    id: "payout",
    ask: [
      "payout",
      "pay out",
      "withdraw",
      "withdrawal",
      "profit split",
      "split",
      "paid",
      "payment",
      "first payout",
      "processing",
      "when can i request",
    ],
    hit: ["payout", "split", "withdraw", "kyc", "consistency", "minimum", "min day", "processing", "refund"],
  },
  {
    id: "news",
    ask: ["news", "nfp", "fomc", "cpi", "high impact", "news window", "red folder"],
    hit: ["news", "nfp", "window", "high-impact", "high impact"],
  },
  {
    id: "ea",
    ask: [
      "ea",
      "eas",
      "expert advisor",
      "bot",
      "bots",
      "robot",
      "copy",
      "copier",
      "hft",
      "arbitrage",
      "martingale",
      "grid",
      "automation",
      "hedg",
    ],
    hit: ["ea", "bot", "copy", "hft", "arbitrage", "martingale", "grid", "automation", "prohibited", "hedg"],
  },
  {
    id: "weekend",
    ask: ["weekend", "overnight", "swap", "hold over", "friday", "sunday"],
    hit: ["weekend", "overnight", "swap", "hold"],
  },
  {
    id: "consistency",
    ask: ["consistency", "best day", "best-day", "one day"],
    hit: ["consistency", "best day", "best-day"],
  },
  {
    id: "kyc",
    ask: ["kyc", "identity", "verification", "verify my"],
    hit: ["kyc", "identity"],
  },
  {
    id: "days",
    ask: ["minimum days", "min days", "trading days", "how many days"],
    hit: ["minimum", "min day", "trading day", "days"],
  },
  {
    id: "refund",
    ask: ["refund", "reset", "retry", "fee back"],
    hit: ["refund", "reset", "retry", "fee"],
  },
  {
    id: "plan",
    ask: [
      "which plan",
      "1-step",
      "2-step",
      "one step",
      "two step",
      "instant",
      "sku",
      "challenge",
      "evaluation",
      "who is it for",
    ],
    hit: ["program", "plan", "1-step", "2-step", "instant", "who is it", "how does"],
  },
];

function norm(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9%+.\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(s: string) {
  return norm(s)
    .split(" ")
    .filter((w) => w.length > 2 && !STOP.has(w));
}

function blobHits(blob: string, needles: string[]) {
  return needles.some((n) => blob.includes(n));
}

export function matchRules(input: {
  question: string;
  firms: FirmSlice[];
  faqs: Record<string, FaqItem[]>;
  plans?: Record<string, PlanSlice[]>;
  first?: Record<string, FirstSlice>;
}): RuleHit[] {
  const q = norm(input.question);
  const qTokens = tokens(input.question);
  const active = CLUSTERS.filter((c) => c.ask.some((t) => q.includes(t)));
  const broad =
    active.length === 0 &&
    (qTokens.length <= 2 || /\b(rules|everything|all rules|faq|tell me about|how does)\b/.test(q));

  const hits: RuleHit[] = [];

  for (const firm of input.firms) {
    const items = input.faqs[firm.id] ?? [];
    for (const item of items) {
      const blob = norm(`${item.q} ${item.a}`);
      let score = 0;
      for (const t of qTokens) {
        if (blob.includes(t)) score += t.length > 6 ? 3 : 2;
      }
      const clusterHit = active.some((c) => blobHits(blob, c.hit));
      if (clusterHit) score += 5;
      if (broad) score += 3;
      if (score >= 3 || clusterHit || broad) {
        hits.push({
          firmId: firm.id,
          firm: firm.short,
          title: item.q.replace(/\?$/, ""),
          body: item.a,
          score,
        });
      }
    }

    const fields: { title: string; body: string; ids: string[] }[] = [
      { title: "Drawdown rule", body: firm.drawdown, ids: ["drawdown"] },
      { title: "Consistency rule", body: firm.consistency, ids: ["consistency", "payout"] },
      { title: "News rule", body: firm.news, ids: ["news", "weekend"] },
      { title: "EA and copy rule", body: firm.ea, ids: ["ea"] },
      { title: "KYC rule", body: firm.kyc, ids: ["kyc", "payout"] },
      { title: "Profit split", body: firm.profitSplit, ids: ["payout"] },
      { title: "Payout cycle", body: firm.payoutCycle, ids: ["payout"] },
      { title: "Desk note", body: firm.notes, ids: ["plan"] },
    ];
    for (const field of fields) {
      if (!field.body.trim()) continue;
      const on = broad || active.some((c) => field.ids.includes(c.id));
      if (!on) continue;
      hits.push({
        firmId: firm.id,
        firm: firm.short,
        title: field.title,
        body: field.body,
        score: broad ? 2 : 4,
      });
    }

    const wantPlans = broad || active.some((c) => c.id === "drawdown" || c.id === "plan");
    if (wantPlans) {
      for (const plan of input.plans?.[firm.id] ?? []) {
        hits.push({
          firmId: firm.id,
          firm: firm.short,
          title: `${plan.name} (${plan.kind})`,
          body: `Target ${plan.target}. Daily ${plan.daily}. Max ${plan.max}. ${plan.note}`.trim(),
          score: 4,
        });
      }
    }

    const wantFirst =
      broad || active.some((c) => ["payout", "kyc", "days", "consistency", "news"].includes(c.id));
    const fp = input.first?.[firm.id];
    if (wantFirst && fp) {
      hits.push({
        firmId: firm.id,
        firm: firm.short,
        title: "First payout checklist",
        body: `KYC: ${fp.kyc}. Min days: ${fp.minDays}. Consistency: ${fp.consistency}. News: ${fp.news}. Request: ${fp.request}`,
        score: 6,
      });
    }
  }

  const seen = new Set<string>();
  return hits
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .filter((h) => {
      const key = `${h.firmId}:${h.title.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 18);
}

export function formatRuleList(hits: RuleHit[]): string {
  if (!hits.length) return "";
  const multi = hits.some((h) => h.firmId !== hits[0]?.firmId);
  const lines = ["**Rules on file for this question**", ""];
  hits.forEach((h, i) => {
    const who = multi ? `${h.firm} — ` : "";
    lines.push(`**${i + 1}. ${who}${h.title}**`);
    lines.push(h.body);
    lines.push("");
  });
  return lines.join("\n").trim();
}
