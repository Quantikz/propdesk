# PropDesk

Independent support desk for prop-firm traders. Glass UI, mobile-first, live answers from the selected firm’s official site.

Covers FTMO, FundedNext, The5ers, FundingPips, E8, Goat Funded Trader, Alpha Capital, Apex, Topstep, and Instant Funding.

## What it does

- Answers rule questions in short form. Live AI searches the firm’s official site, opens the current FAQ/terms page, and cites it. Offline FAQ engine is the fallback.
- Escalates only for **firm-side operational fault** with evidence (wrong calc vs dashboard, approved payout past SLA, outage-caused breach, fee with no account, rule not in terms).
- Compiles a case and opens email to the firm’s support inbox with the trader on CC.

It will not email the firm for ordinary rule breaches (daily loss, consistency parks, early payouts, incomplete KYC).

## Stack

React 19, TanStack Start, Tailwind v4, Zustand. Live AI uses Grok on the server (`XAI_API_KEY`) with web search scoped to the selected firm’s domain. No browser API keys.

## Run

```bash
npm install
npm run dev
```

Set `XAI_API_KEY` in the server environment for Live AI + firm-site search. Without it, the FAQ engine still answers.

## Knowledge

Firm snapshots and escalation rules live in `src/lib/propdesk/knowledge.ts`. Live answers prefer the firm’s current website over that snapshot.
