import { getFirm } from "./engine";
import { catalogOverlay } from "./catalog-cache";

export type PlanKind = "1-step" | "2-step" | "instant" | "futures" | "scale";

export type Plan = {
  kind: PlanKind;
  name: string;
  target: string;
  daily: string;
  max: string;
  note: string;
};

export type FirstPayout = {
  kyc: string;
  minDays: string;
  consistency: string;
  news: string;
  request: string;
};

/** When this packed rulebook was last reviewed. */
export const RULES_AS_OF = "2026-09-21T12:00:00Z";

export const PLANS: Record<string, Plan[]> = {
  goat: [
    { kind: "1-step", name: "1-Step", target: "Single profit target on the plan card", daily: "Plan card", max: "Plan card", note: "Faster path, tighter risk than 2-Step on many SKUs." },
    { kind: "2-step", name: "2-Step", target: "Two phases — first then verification", daily: "Plan card", max: "Plan card", note: "Usually more room on daily/max than 1-Step." },
  ],
  fundednext: [
    { kind: "1-step", name: "Stellar 1-Step", target: "One evaluation target", daily: "Model card", max: "Model card", note: "Do not mix with 2-Step numbers." },
    { kind: "2-step", name: "Stellar 2-Step", target: "Two phases", daily: "Model card", max: "Model card", note: "Classic two-phase; Lite is a cheaper, tighter cousin." },
    { kind: "instant", name: "Stellar Instant", target: "Skip or shorten eval", daily: "Tighter", max: "Tighter", note: "Pay more up front; watch consistency on payouts." },
  ],
  the5ers: [
    { kind: "2-step", name: "High Stakes", target: "Program PDF", daily: "Defined bands", max: "Defined bands", note: "Scaling is the point of this book." },
    { kind: "scale", name: "Hyper Growth", target: "Target + risk", daily: "Program PDF", max: "Program PDF", note: "Less of a classic 30% consistency day." },
    { kind: "scale", name: "Bootcamp", target: "Program PDF", daily: "Program PDF", max: "Program PDF", note: "Longer path, lower ticket." },
  ],
  fundingpips: [
    { kind: "1-step", name: "1-Step", target: "Single target", daily: "Plan card", max: "Plan card", note: "Rules are not the 2-Step book." },
    { kind: "2-step", name: "2-Step", target: "Two phases", daily: "Plan card", max: "Plan card", note: "Usually more headroom than 1-Step." },
    { kind: "instant", name: "Zero / instant-style", target: "When offered", daily: "Tighter", max: "Tighter", note: "Only if that SKU is live on your dashboard." },
  ],
  e8: [
    { kind: "2-step", name: "E8 Evaluation", target: "Plan card", daily: "EOD vs equity — screenshot it", max: "Plan card", note: "Drawdown definition is the usual dispute." },
    { kind: "1-step", name: "E8 One", target: "Single step", daily: "Plan card", max: "Plan card", note: "Not the same math as Evaluation." },
    { kind: "scale", name: "E8 Track", target: "Track card", daily: "Track card", max: "Track card", note: "Built for a longer path." },
  ],
  acg: [
    { kind: "1-step", name: "1-Step", target: "Plan PDF", daily: "Static on many", max: "Static on many", note: "UK-facing; check country list." },
    { kind: "2-step", name: "2-Step", target: "Two phases", daily: "Static on many", max: "Static on many", note: "Slower payout shop than 1-step CFD brands." },
  ],
  ftmo: [
    { kind: "2-step", name: "Challenge + Verification", target: "Often ~10% then ~5%", daily: "Commonly 5% equity", max: "Commonly 10% static", note: "US residents generally not accepted. No instant book." },
  ],
  apex: [
    { kind: "futures", name: "Eval → PA", target: "Eval profit + trailing rules", daily: "N/A — trailing threshold", max: "Trailing / EOD trail", note: "Futures only. Not an FX 1-step." },
  ],
  topstep: [
    { kind: "futures", name: "Combine → Funded", target: "Combine objectives", daily: "N/A — MLL", max: "Maximum Loss Limit", note: "Futures only. Scaling plan caps contracts." },
  ],
  instant: [
    { kind: "instant", name: "Instant funded", target: "Skip challenge", daily: "Tighter than 2-step", max: "Tighter than 2-step", note: "You pay to skip eval. Early payout caps are common." },
    { kind: "2-step", name: "Evaluation hybrid", target: "When offered", daily: "Plan card", max: "Plan card", note: "Only if that SKU is on your invoice." },
  ],
};

export const FIRST: Record<string, FirstPayout> = {
  goat: {
    kyc: "Required before the first payout.",
    minDays: "Plan card — do not assume zero days on 1-Step.",
    consistency: "Often on payouts. A big first day can park the request.",
    news: "Generally allowed on many Goat plans. Still confirm the SKU.",
    request: "KYC done, min days, profit above min withdrawal, consistency if the card has it. Then request in the dashboard.",
  },
  fundednext: {
    kyc: "Required before payouts.",
    minDays: "Model-specific. Instant/Lite differ from Stellar 2-Step.",
    consistency: "Some models cap the best day before they pay.",
    news: "Model-specific. Instant is often looser than some Stellar books.",
    request: "Match the Stellar/Instant SKU you bought. KYC, eligible days, then request. Advertised ~24h after approval on some models.",
  },
  the5ers: {
    kyc: "Required before withdrawals.",
    minDays: "Program PDF — High Stakes is not Bootcamp.",
    consistency: "Hyper Growth is less of a classic 30% day; still read the PDF.",
    news: "Generally more permissive than FTMO-style windows.",
    request: "After the first cycle (often bi-weekly). KYC first.",
  },
  fundingpips: {
    kyc: "Required before first payout.",
    minDays: "Plan card. 1-Step ≠ 2-Step.",
    consistency: "Appears on some types. Parked payouts are usually this.",
    news: "Model-specific.",
    request: "KYC, min days, consistency if listed, then weekly/24h as the card says.",
  },
  e8: {
    kyc: "Required.",
    minDays: "Plan card.",
    consistency: "On some payout paths.",
    news: "More permissive than FTMO on several products.",
    request: "On-demand after eligibility. Screenshot EOD vs equity before you argue a breach.",
  },
  acg: {
    kyc: "Required.",
    minDays: "Plan PDF.",
    consistency: "Check the PDF — not always a 30% rule.",
    news: "Restricted around selected high-impact events on some accounts.",
    request: "Often bi-weekly after approval. Several business days is normal here.",
  },
  ftmo: {
    kyc: "Required before the first payout.",
    minDays: "Challenge/Verification have a minimum trading-day count. Funded is on-demand after the window.",
    consistency: "No classic best-day % on a standard FTMO Account.",
    news: "Funded generally allows news; short window on some products around selected releases.",
    request: "KYC, payout window met, then on-demand. Often 1–2 business days after approval.",
  },
  apex: {
    kyc: "Required plus Rise (or current provider) onboarding.",
    minDays: "Winning-day count is the usual gate, not calendar days.",
    consistency: "Yes — payouts need consistency / winning days.",
    news: "Usually allowed. Flatten and contract caps matter more.",
    request: "Hit threshold + consistency, request via the PA dashboard, wait on the payout provider.",
  },
  topstep: {
    kyc: "Required.",
    minDays: "Consistency days and often a winning-day count.",
    consistency: "Yes — this is the usual first-payout delay.",
    news: "Allowed; a gap through MLL is on you.",
    request: "Funded account, consistency met, then weekly via their partner.",
  },
  instant: {
    kyc: "Required before payout.",
    minDays: "Yes — instant does not mean day-one withdrawal.",
    consistency: "Common. Early caps on first payouts are common.",
    news: "Often allowed — still confirm.",
    request: "Min days, min profit, consistency, KYC. First payout is often capped.",
  },
};

export function plansFor(firmId: string): Plan[] {
  const over = catalogOverlay()?.plans[firmId];
  if (over?.length) return over;
  return PLANS[firmId] ?? PLANS.goat;
}

export function firstPayout(firmId: string): FirstPayout {
  const over = catalogOverlay()?.first[firmId];
  if (over) return over;
  return FIRST[firmId] ?? FIRST.goat;
}

export function plansLine(firmId: string): string {
  return plansFor(firmId)
    .map((p) => p.name)
    .join(" · ");
}

export function plansPack(firmId: string): string {
  const f = getFirm(firmId);
  const fp = firstPayout(firmId);
  const planLines = plansFor(firmId)
    .map((p) => `- ${p.name} (${p.kind}): target ${p.target}. Daily ${p.daily}. Max ${p.max}. ${p.note}`)
    .join("\n");
  return `${f.name} plans (SKU matters — never mix 1-step numbers with 2-step):
${planLines}

First payout checklist:
- KYC: ${fp.kyc}
- Min days: ${fp.minDays}
- Consistency: ${fp.consistency}
- News window: ${fp.news}
- When to request: ${fp.request}`;
}
