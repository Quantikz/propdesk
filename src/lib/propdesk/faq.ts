import { firmList, getFirm, orderFirmIds } from "./engine";
import { firstPayout, plansLine, plansPack } from "./plans";

export type FaqItem = { q: string; a: string };

const PACKS: Record<string, FaqItem[]> = {
  ftmo: [
    { q: "How does the program work?", a: "FTMO is a 2-step evaluation: Challenge then Verification, then an FTMO Account. Typical first-step profit target is around 10%, second step around 5%, with a minimum number of trading days. US residents are generally not accepted on the CFD book." },
    { q: "Daily drawdown?", a: "Commonly 5% daily loss. On many account types floating (open) P&L counts against daily loss — check whether your dashboard says equity-based. Hitting daily loss fails that account." },
    { q: "Max drawdown?", a: "Commonly 10% max loss from initial balance (static on many types). It does not trail up with profits on the classic FTMO Account the way futures trailing thresholds do." },
    { q: "News trading?", a: "Funded FTMO Accounts generally allow news. Some products restrict placing or closing trades in a short window (often about 2 minutes) around selected high-impact releases. A fill inside the window counts even if you clicked earlier." },
    { q: "EAs and copy trading?", a: "EAs are generally allowed if they are not prohibited classes: latency/tick HFT, arbitrage, martingale/grid as FTMO defines them, or unmanaged copy trading across accounts. Copiers onto several FTMO accounts are a common ban reason." },
    { q: "Payouts?", a: "Profit split starts around 80% and can scale toward 90%. Payouts are on demand after you meet the window and KYC. Processing after approval is often 1–2 business days. KYC is required before the first payout." },
    { q: "Weekend / overnight?", a: "Holding overnight is normally allowed. Weekend holding depends on the instrument and account; swaps can apply. Do not assume weekend holding on every symbol." },
    { q: "Minimum days and consistency?", a: "Challenge/Verification have a minimum trading-day count. There is no classic ‘best-day %’ consistency cap on a standard FTMO Account the way some instant/1-step books use. Objectives still apply on the challenge." },
    { q: "Refunds and resets?", a: "Fees are generally not refunded after credentials are issued. Free retries appear only if the live offer on your dashboard says so. A hard breach ends that account; a new challenge or a discounted retry (if offered) is the path." },
    { q: "Who is it for?", a: "Traders who want a long-running forex/CFD book, documented payout history, and a classic 2-step. Not for US residents. Stricter on news windows and banned strategies than some 1-step brands." },
  ],
  fundednext: [
    { q: "How does the program work?", a: "Several books: Stellar 1-Step, 2-Step, Lite, and Instant-style products. Targets, daily loss, and payout speed differ by model — always read the plan you bought, not the homepage." },
    { q: "Daily / max drawdown?", a: "Varies by model. Some use a daily loss plus a max loss; Instant/Lite numbers are often tighter than Stellar 2-Step. Confirm whether daily is equity or balance based on that plan’s card." },
    { q: "Consistency?", a: "Some FundedNext models apply a consistency / best-day share rule before a payout. If a payout is parked, the usual fix is more eligible days until the best day is under the cap." },
    { q: "News?", a: "Model-specific. Instant and some Stellar plans are more flexible; others restrict high-impact windows. Check the plan FAQ, not a generic ‘news allowed’ tweet." },
    { q: "EAs?", a: "Usually allowed except banned classes (HFT/arbitrage, abusive grid/martingale, copy farms). Unique entries matter if they flag copy trading." },
    { q: "Payouts?", a: "Split can reach ~90–95% with add-ons. Several models advertise ~24-hour processing after approval. KYC first. Challenge-phase profit share exists on some products." },
    { q: "Who is it for?", a: "Traders who want a choice of 1-step vs 2-step vs instant, and faster advertised payouts. You must match rules to the exact Stellar/Instant SKU." },
  ],
  the5ers: [
    { q: "How does the program work?", a: "Programs include High Stakes, Hyper Growth, and Bootcamp. Mostly MT5. Scaling is a core pitch — account size can grow after milestones rather than staying capped at the evaluation notional." },
    { q: "Drawdown and targets?", a: "Program-specific. High Stakes uses defined daily/max loss bands. Hyper Growth emphasizes a target plus risk rather than a classic 30% consistency day. Read that program’s PDF." },
    { q: "Payouts?", a: "Often bi-weekly after the first cycle. Split can scale; High Stakes can reach very high splits (up to 100% after milestones on some tracks). KYC before withdrawals." },
    { q: "News and EAs?", a: "Generally more permissive on news than many 2-step CFD firms. EAs allowed within strategy restrictions. Still confirm the program PDF." },
    { q: "Who is it for?", a: "Traders who want a long scaling path and can live with MT5 and program-specific risk rules. Not the cheapest instant book." },
  ],
  fundingpips: [
    { q: "How does the program work?", a: "1-Step, 2-Step, and occasional Zero/instant-style products. Platforms include MT5, cTrader, Match-Trader, TradeLocker. 1-step and 2-step rules are not interchangeable." },
    { q: "Drawdown?", a: "Daily and max loss vary by step model. Instant/zero-style books are usually tighter. Read the plan card for equity vs EOD." },
    { q: "Consistency and payouts?", a: "Payout consistency rules appear on some types. Split often 80% base, scaling toward 90–100% on ranks. Weekly payouts on many plans; some advertised within 24 hours after approval. KYC before first payout." },
    { q: "News / EAs?", a: "News is model-specific. EAs allowed with a banned-strategy list. Copy trading across accounts is a common freeze reason." },
    { q: "Who is it for?", a: "Popular 1-step option. Good if you want simpler evaluation; watch consistency on payouts." },
  ],
  e8: [
    { q: "How does the program work?", a: "E8 Evaluation, E8 One, E8 Track. Platforms: MT5, Match-Trader, TradeLocker. Drawdown definition (balance vs equity vs EOD) is the #1 dispute — screenshot the dashboard definition." },
    { q: "Drawdown?", a: "EOD vs intraday vs equity-based daily loss differs by account. Do not assume FTMO-style static 5/10. If the live card says EOD, open P&L may not count until the day closes (or the opposite — believe the card)." },
    { q: "Payouts?", a: "On-demand / frequent cycles after eligibility. Split up to 100% on some configurations. Consistency can apply on some payout paths. KYC required." },
    { q: "News / EAs?", a: "More permissive than FTMO on several products. EAs allowed except prohibited classes." },
    { q: "Who is it for?", a: "Traders who like frequent payouts and can live with product-specific drawdown math. Verify EOD vs equity before you size up." },
  ],
  goat: [
    { q: "How does the program work?", a: "1-Step and 2-Step. Platforms: MT5, cTrader, Match-Trader, TradeLocker. Marketed as news-friendly relative to stricter 2-step books." },
    { q: "Drawdown and consistency?", a: "Plan-specific daily + max. Consistency is often present on payouts. Do not skip the plan card." },
    { q: "News / EAs?", a: "News generally allowed on many Goat plans. EAs allowed with restrictions. Still a banned-strategy list." },
    { q: "Payouts?", a: "Split often 80–100% with add-ons. Frequent cycles; confirm current SLA in the dashboard. KYC required." },
    { q: "Who is it for?", a: "Traders who want news freedom more than a classic FTMO-style window. Confirm the exact plan you purchased." },
  ],
  acg: [
    { q: "How does the program work?", a: "Alpha Capital Group: 1-Step and 2-Step. Platforms: MT4, MT5, cTrader, DXtrade. UK-facing brand. Confirm restricted-country list before buying." },
    { q: "Drawdown?", a: "Daily + max, static on many plans. Consistency: check the plan PDF." },
    { q: "News / EAs?", a: "News may be restricted around selected high-impact events on some accounts. EAs allowed within terms." },
    { q: "Payouts?", a: "Split typically 80–90%. Bi-weekly payouts are common. KYC required. SLA after approval is often several business days." },
    { q: "Who is it for?", a: "UK/EU-leaning traders who want MT4/cTrader/DXtrade options. Not the fastest payout shop." },
  ],
  apex: [
    { q: "How does the program work?", a: "Futures, not forex. Evaluation → PA (Performance Account). Platforms: NinjaTrader, Tradovate, Rithmic, some TradingView bridges. US traders are commonly accepted. Payouts often via Rise." },
    { q: "Drawdown?", a: "Trailing threshold / EOD trailing depending on account generation. The floor can move up as you profit. Treating it like a static FX max DD is the usual way people blow a PA." },
    { q: "Consistency / payouts?", a: "Payouts need consistency and often a count of winning days. Split is often 100% of the first $25k then 90% (confirm current promo). Processing can take several business days after approval via the payout provider." },
    { q: "News / automation?", a: "News is usually allowed in futures props; the real constraints are flattening, contract-size/scaling caps, and overnight. Autos and copy tools are restricted — read Apex policy, do not assume an EA is fine." },
    { q: "Who is it for?", a: "US and global futures traders. Wrong shop if you want FX/CFD. Most issues are trailing DD, consistency days, and contract limits — not news windows." },
  ],
  topstep: [
    { q: "How does the program work?", a: "Futures Trading Combine → Funded Account. Platforms: TopstepX, Tradovate, NinjaTrader, others. US-friendly. Scaling plan caps contracts as you grow." },
    { q: "Drawdown?", a: "Maximum Loss Limit (MLL) with trailing logic — the live number is on the dashboard. A gap through MLL is on the trader." },
    { q: "Consistency / payouts?", a: "Yes — payouts need consistency days and often a winning-day count. Split is typically 100% of the first $5k–$10k then 90% (plan-dependent). Weekly via their payout partner after rules are met." },
    { q: "News / bots?", a: "News allowed; risk of gapping the MLL is yours. Automation policy is strict — do not assume bots are fine." },
    { q: "Who is it for?", a: "Futures Combine traders who want a well-known US brand. Not FX. Breaches are usually MLL, scaling-plan size, or flatten rules." },
  ],
  instant: [
    { q: "How does the program work?", a: "Instant Funding: you pay to skip the challenge (plus some evaluation hybrids). Platforms: MT5, cTrader, Match-Trader. Tighter risk and earlier payout caps are the tradeoff for skipping evaluation." },
    { q: "Drawdown and consistency?", a: "Usually tighter than two-step firms. Consistency rules are common on instant books and are the usual payout delay. Daily/max numbers are on the plan card." },
    { q: "Payouts?", a: "Frequent / on-demand after min days and profit. Split up to 90%+. Early caps on first payouts are common. KYC before payout." },
    { q: "News / EAs?", a: "News often allowed — still confirm. Restricted EA classes apply. Instant books watch copy trading closely." },
    { q: "Who is it for?", a: "Traders who will pay more upfront to skip a challenge and can live with stricter consistency. Not the same as a funded FTMO account." },
  ],
};

export function faqItems(firmId: string): FaqItem[] {
  return PACKS[firmId] ?? PACKS.ftmo;
}

export function faqPack(firmId: string): string {
  const f = getFirm(firmId);
  const items = faqItems(firmId);
  const lines = [
    `${f.name} FAQ pack (pre-support, may lag the live dashboard):`,
    `Models: ${f.models.join("; ")}`,
    `Platforms: ${f.platforms.join(", ")}`,
    `Split: ${f.profitSplit}`,
    `Payout: ${f.payoutCycle}`,
    `Drawdown: ${f.drawdown}`,
    `Consistency: ${f.consistency}`,
    `News: ${f.news}`,
    `EAs: ${f.ea}`,
    `KYC: ${f.kyc}`,
    `Size path: ${f.maxAccount}`,
    `Notes: ${f.notes}`,
    "",
    plansPack(firmId),
    "",
    ...items.map((i) => `Q: ${i.q}\nA: ${i.a}`),
  ];
  return lines.join("\n");
}

export function firmRoster(): string {
  return firmList()
    .map((f) => `- ${f.name} (${f.short}): ${f.models[0]}. Split ${f.profitSplit}. ${f.drawdown}`)
    .join("\n");
}

export function firmsMentioned(text: string, currentId: string): string[] {
  const ids = new Set<string>([currentId]);
  const blob = text.toLowerCase();
  for (const f of firmList()) {
    if (
      blob.includes(f.name.toLowerCase()) ||
      blob.includes(f.short.toLowerCase()) ||
      blob.includes(f.id.toLowerCase())
    ) {
      ids.add(f.id);
    }
  }
  return [...orderFirmIds([...ids])].slice(0, 4);
}

export const COMPARE_ROWS: { key: string; label: string; value: (id: string) => string }[] = [
  { key: "plans", label: "Plans", value: (id) => plansLine(id) },
  { key: "platforms", label: "Platforms", value: (id) => getFirm(id).platforms.join(", ") },
  { key: "split", label: "Profit split", value: (id) => getFirm(id).profitSplit },
  { key: "first", label: "First payout", value: (id) => firstPayout(id).request },
  { key: "payout", label: "Payout cycle", value: (id) => getFirm(id).payoutCycle },
  { key: "drawdown", label: "Drawdown", value: (id) => getFirm(id).drawdown },
  { key: "consistency", label: "Consistency", value: (id) => getFirm(id).consistency },
  { key: "news", label: "News", value: (id) => getFirm(id).news },
  { key: "ea", label: "EAs / bots", value: (id) => getFirm(id).ea },
  { key: "kyc", label: "KYC", value: (id) => getFirm(id).kyc },
  { key: "size", label: "Size path", value: (id) => getFirm(id).maxAccount },
  { key: "best", label: "Best for", value: (id) => getFirm(id).notes },
];

export function compareTable(ids: string[]): string {
  const firms = ids.map((id) => getFirm(id));
  return COMPARE_ROWS.map((row) => {
    const cells = firms.map((f) => `${f.short}: ${row.value(f.id)}`).join(" | ");
    return `${row.label} — ${cells}`;
  }).join("\n");
}

export const COMPARE_PROMPTS = [
  {
    title: "Who is stricter?",
    blurb: "Daily and max loss",
    prompt: "Of the firms I have selected, who is stricter on daily and max drawdown, and what actually counts (equity vs EOD)? Check if the pack is vague.",
  },
  {
    title: "I trade news",
    blurb: "Who actually allows it",
    prompt: "I trade news. Of these firms, who actually allows it on a funded account, and who has a window I need to respect? Check the current rule if you need to.",
  },
  {
    title: "Payouts",
    blurb: "Speed and first payout",
    prompt: "Compare payout speed, split, and the first-payout checklist on these firms. Use the packed plans — 1-step vs 2-step vs instant are not the same book.",
  },
  {
    title: "Which plan",
    blurb: "1-step, 2-step, instant",
    prompt: "Of the firms I selected, walk the actual plans (1-step vs 2-step vs instant vs futures). I need to know which SKU I would buy, not a generic firm pitch.",
  },
] as const;
