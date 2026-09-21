import { getFirm } from "./engine";

export type FirmValue = {
  fee: string;
  reset: string;
  timeToFunded: string;
  terms: string;
};

export const VALUE: Record<string, FirmValue> = {
  goat: {
    fee: "From about $30–$549 by size; promos often cut that.",
    reset: "Discounted retry only if the live card shows it.",
    timeToFunded: "1-Step: one target. 2-Step: two phases.",
    terms: "https://goatfundedtrader.com",
  },
  ftmo: {
    fee: "Classic 100k Challenge is often about $540 before promo.",
    reset: "Fee is not refunded after credentials. Retry only if the offer says so.",
    timeToFunded: "Challenge then Verification. Min trading days on both steps.",
    terms: "https://ftmo.com/en/terms-and-conditions/",
  },
  fundednext: {
    fee: "Stellar SKUs from tens of dollars to several hundred by size.",
    reset: "Model-specific retry. Do not assume a free reset.",
    timeToFunded: "1-Step / Instant skip a phase; 2-Step is two phases.",
    terms: "https://fundednext.com",
  },
  the5ers: {
    fee: "High Stakes / Hyper Growth / Bootcamp priced per program PDF.",
    reset: "Program PDF. Not a cheap instant reset shop.",
    timeToFunded: "Program length varies. Scaling is the point after funded.",
    terms: "https://the5ers.com",
  },
  fundingpips: {
    fee: "1-Step 100k often a few hundred before promo; 2-Step differs.",
    reset: "Card / rank offer only.",
    timeToFunded: "1-Step: one target. 2-Step: two phases.",
    terms: "https://fundingpips.com",
  },
  e8: {
    fee: "Evaluation / One / Track priced on the live card.",
    reset: "Only if the dashboard offer includes it.",
    timeToFunded: "E8 One is one step. Evaluation is two.",
    terms: "https://e8markets.com",
  },
  acg: {
    fee: "1-Step and 2-Step priced on alphacapitalgroup.uk.",
    reset: "Plan PDF.",
    timeToFunded: "1-Step one target; 2-Step two phases.",
    terms: "https://alphacapitalgroup.uk",
  },
  apex: {
    fee: "Eval seats often tens to low hundreds by contract size; promos common.",
    reset: "New eval or activation rules on the current offer.",
    timeToFunded: "Pass eval → PA. Winning-day count before first payout.",
    terms: "https://apextraderfunding.com",
  },
  topstep: {
    fee: "Combine priced by size on topstep.com.",
    reset: "New Combine. No refund after a blown Combine.",
    timeToFunded: "Pass Combine → Funded. Consistency days before payout.",
    terms: "https://www.topstep.com",
  },
  instant: {
    fee: "You pay more to skip the challenge. Size cards on instantfunding.io.",
    reset: "New instant account. Early payout caps still apply.",
    timeToFunded: "Instant funded on purchase. First payout still needs days + consistency.",
    terms: "https://instantfunding.io",
  },
};

export function firmValue(id: string): FirmValue {
  return VALUE[id] ?? {
    fee: `See ${getFirm(id).portal}`,
    reset: "Only if the live card says so.",
    timeToFunded: getFirm(id).models.join(" · "),
    terms: getFirm(id).portal,
  };
}
