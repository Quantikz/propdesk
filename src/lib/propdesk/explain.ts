import { firmList, getFirm } from "./engine";
import { RULES_AS_OF, firstPayout, plansFor } from "./plans";
import { firmValue } from "./value";
import { stamp } from "./payouts";
import type { Firm } from "./types";

export type Trust = "verified" | "confirm" | "unverified";
export type RuleTopic = "rules" | "breaches" | "payouts" | "restrictions";

export type RuleExplain = {
  id: string;
  firmId: string;
  topic: RuleTopic;
  title: string;
  short: string;
  official: string;
  means: string;
  example: string;
  mistake: string;
  source: string;
  sourceUrl: string;
  verified: string;
  trust: Trust;
};

export const TOPICS: { id: string; label: string }[] = [
  { id: "drawdown", label: "Drawdown" },
  { id: "payouts", label: "Payouts" },
  { id: "news", label: "News" },
  { id: "eas", label: "EAs" },
  { id: "weekend", label: "Weekend" },
  { id: "consistency", label: "Consistency" },
];

function trustFor(text: string): Trust {
  const t = text.toLowerCase();
  if (/plan card|model card|program pdf|confirm|often|generally|typical|varies/.test(t)) return "confirm";
  if (/not published|unknown|could not/.test(t)) return "unverified";
  return "confirm";
}

function card(
  firm: Firm,
  topic: RuleTopic,
  title: string,
  short: string,
  official: string,
  means: string,
  example: string,
  mistake: string,
): RuleExplain {
  const value = firmValue(firm.id);
  return {
    id: `${firm.id}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    firmId: firm.id,
    topic,
    title,
    short,
    official,
    means,
    example,
    mistake,
    source: "Packed desk notes + official site. Confirm the live terms.",
    sourceUrl: value.terms,
    verified: stamp(RULES_AS_OF) || RULES_AS_OF,
    trust: trustFor(`${short} ${official}`),
  };
}

export function explainFirm(firmId: string): RuleExplain[] {
  const f = getFirm(firmId);
  const fp = firstPayout(f.id);
  const plans = plansFor(f.id);
  const planLine = plans.map((p) => `${p.name}: target ${p.target}, daily ${p.daily}, max ${p.max}`).join(" ");
  return [
    card(f, "rules", "How is drawdown measured?", f.drawdown, `Published desk note for ${f.name}: ${f.drawdown}`,
      "Drawdown is the loss limit that can fail the account. Whether open (floating) loss counts depends on equity vs balance vs end-of-day measurement on that SKU.",
      "On a $100,000 book, a 5% daily limit is $5,000. If floating loss counts, an open -$5,100 trade can fail the account before you close it.",
      "Treating every firm like static FTMO 5/10, or ignoring floating loss when the dashboard is equity-based."),
    card(f, "rules", "What is the profit target?", planLine || f.models.join(" · "),
      plans.length ? plans.map((p) => `${p.name} (${p.kind}): ${p.target}. ${p.note}`).join(" ") : "Target is on the live plan card.",
      "Targets differ by 1-step, 2-step, instant, and futures SKUs. Do not mix those numbers.",
      "Passing a 10% 1-step target does not mean a 2-step verification target is also 10%.",
      "Reading the homepage SKU instead of the plan you actually buy."),
    card(f, "rules", "Is there a consistency rule?", f.consistency, `Desk note: ${f.consistency}`,
      "Consistency usually limits how much of a payout or pass can come from one day. A large first day can park a withdrawal even if you are in profit.",
      "If the cap is 30% of profit from the best day, $3,000 of $4,000 on one day will not clear until more eligible days dilute that share.",
      "Assuming no consistency because the evaluation had none. Payout books often add it later."),
    card(f, "breaches", "What can fail the account?", `${f.drawdown} Prohibited strategy and copy-trading rules also apply.`,
      `Daily and max loss: ${f.drawdown}. EAs: ${f.ea}. News: ${f.news}.`,
      "A breach is usually hitting daily or max loss as the dashboard defines it, or using a banned method (copy farms, prohibited HFT/grid as that firm writes it).",
      "Holding a loser overnight when daily is equity-based can print a daily-loss fail at a price gap.",
      "Arguing you closed green when the dashboard already counted floating loss."),
    card(f, "payouts", "When can I request a payout?", fp.request,
      `KYC: ${fp.kyc} Days: ${fp.minDays} Consistency: ${fp.consistency} Request: ${fp.request}`,
      "Eligibility is a checklist: identity, minimum days, minimum profit, and any consistency cap. Missing one item parks the request; it is not always a ban.",
      "Requesting on day two with KYC pending will be denied even if profit is large.",
      "Treating a tracker screenshot as the official payout rule."),
    card(f, "payouts", "What can deny a payout?", `${fp.consistency} ${fp.news}`,
      `Documented gates: KYC, min days, consistency, and strategy rules. Split: ${f.profitSplit}. Cycle: ${f.payoutCycle}.`,
      "Denials are usually incomplete KYC, consistency, banned strategy flags, or requesting before the window.",
      "A large single day can sit until more days bring the best-day share under the cap.",
      "Calling a delayed request a they-do-not-pay fact. Delay and refusal are different."),
    card(f, "restrictions", "News, EAs, weekend, copy trading", `${f.news} ${f.ea}`,
      `News: ${f.news}. Automation: ${f.ea}. Platforms: ${f.platforms.join(", ")}.`,
      "Restrictions are SKU-specific. A fill inside a news window can count even if you clicked earlier. Copying the same strategy onto several accounts is a common freeze.",
      "An EA that hedges two accounts of the same firm can look like a copy farm in risk review.",
      "Believing a marketing line news allowed without reading the minute-window on that product."),
  ];
}

export function explainAll(): RuleExplain[] {
  return firmList().flatMap((f) => explainFirm(f.id));
}

export function libraryTopics() {
  return [
    { id: "library", title: "Rule library", blurb: "Browse the rules that matter before trading.", href: "/rules" },
    { id: "breaches", title: "Breach conditions", blurb: "See what can actually cause an account violation.", href: "/rules" },
    { id: "payouts", title: "Payout rules", blurb: "Understand eligibility and possible denial conditions.", href: "/payouts" },
    { id: "restrictions", title: "Trading restrictions", blurb: "News, weekend holding, EAs, copy trading, hedging and more.", href: "/rules" },
    { id: "changes", title: "Rule changes", blurb: "See current information and documented changes.", href: "/rules" },
    { id: "ask", title: "Ask PropDesk", blurb: "Ask a plain-English question and get a sourced explanation.", href: "/ask" },
  ] as const;
}

export function trustLabel(trust: Trust) {
  if (trust === "verified") return "Verified";
  if (trust === "confirm") return "Needs confirmation";
  return "Not verified";
}
