import assert from "node:assert/strict";
import test from "node:test";
import { matchRules } from "./match-faq.ts";

const firm = {
  id: "goat",
  name: "Goat Funded Trader",
  short: "GFT",
  drawdown: "Plan-specific daily + max.",
  consistency: "Consistency is often present on payouts.",
  news: "News generally allowed on many Goat plans.",
  ea: "EAs allowed with restrictions.",
  kyc: "KYC required before payout.",
  profitSplit: "80-100%",
  payoutCycle: "Frequent cycles",
  notes: "News freedom more than a classic window.",
};

const faqs = {
  goat: [
    { q: "How does the program work?", a: "1-Step and 2-Step. News-friendly relative to stricter books." },
    { q: "Drawdown and consistency?", a: "Plan-specific daily + max. Consistency is often present on payouts." },
    { q: "News / EAs?", a: "News generally allowed. EAs allowed with a banned-strategy list." },
    { q: "Payouts?", a: "Split often 80-100%. Frequent cycles. KYC required." },
    { q: "Who is it for?", a: "Traders who want news freedom." },
  ],
};

test("payout question lists every payout gate, not one FAQ line", () => {
  const hits = matchRules({
    question: "When can I request my first payout on Goat?",
    firms: [firm],
    faqs,
    plans: {
      goat: [{ name: "1-Step", kind: "1-step", target: "10%", daily: "4%", max: "6%", note: "card" }],
    },
    first: {
      goat: {
        kyc: "before first payout",
        minDays: "5 trading days",
        consistency: "best day under 40%",
        news: "allowed",
        request: "after checklist",
      },
    },
  });
  const titles = hits.map((h) => h.title.toLowerCase());
  assert.ok(titles.some((t) => t.includes("payout")), titles.join(" | "));
  assert.ok(titles.some((t) => t.includes("consistency")), titles.join(" | "));
  assert.ok(titles.some((t) => t.includes("kyc")), titles.join(" | "));
  assert.ok(titles.some((t) => t.includes("checklist")), titles.join(" | "));
  assert.ok(hits.length >= 4);
});

test("drawdown question includes daily, max, and the plan card", () => {
  const hits = matchRules({
    question: "Does floating loss count against daily drawdown?",
    firms: [firm],
    faqs,
    plans: {
      goat: [{ name: "2-Step", kind: "2-step", target: "8%", daily: "5%", max: "10%", note: "equity" }],
    },
  });
  const titles = hits.map((h) => h.title.toLowerCase()).join(" | ");
  assert.match(titles, /drawdown/);
  assert.match(titles, /2-step/);
  assert.ok(hits.length >= 2);
});
