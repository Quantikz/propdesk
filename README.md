# PropDesk

Independent research desk for prop-firm rules. Understand drawdown, payouts, news, and consistency before you buy.

Live: https://propdesk-beta.vercel.app/

## What it is

A rule-intelligence product, not a broker, support inbox, or trading terminal.

- Ask a plain-English question
- Open a firm sheet: Rules, Breaches, Payouts, Restrictions, FAQ
- Compare documented differences only
- Read issued-payout boards separately from official checklists

Covers FTMO, FundedNext, The5ers, FundingPips, E8, Goat Funded Trader, Alpha Capital, Apex, Topstep, and Instant Funding.

PropDesk does not rank firms.

## Stack

React 19, TanStack Start, Tailwind v4, Zustand. Firm sites are fetched on the server.

## Run

```bash
git clone https://github.com/Quantikz/propdesk.git
cd propdesk
npm install
npm run dev
```

Open http://127.0.0.1:8080

## Deploy

Vercel from `main`. Production build:

```bash
npm run build
```
