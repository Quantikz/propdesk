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

## Run on a computer

```bash
git clone https://github.com/Quantikz/propdesk.git
cd propdesk
npm install
npm run dev
```

Then open http://127.0.0.1:8080

Set `XAI_API_KEY` in the environment for Live AI + firm-site search. Without it, the FAQ engine still answers.

## Run on Termux (Android)

This is a Node app now, not a static HTML file. First install needs disk space and a few minutes. Keep Termux in the foreground so Android does not kill it.

Paste this once:

```bash
pkg update -y && pkg install -y git
cd $HOME
curl -fsSL https://raw.githubusercontent.com/Quantikz/propdesk/main/termux-run.sh -o propdesk-run.sh
chmod +x propdesk-run.sh
bash propdesk-run.sh
```

If you already cloned the repo:

```bash
cd $HOME/propdesk
git pull
bash termux-run.sh
```

Next times:

```bash
bash $HOME/propdesk-run.sh
```

On this phone open **http://127.0.0.1:8080**. The script also prints a Wi-Fi address (`http://YOUR-PHONE-IP:8080`) so a laptop on the same network can open it.

Optional Live AI in that Termux session:

```bash
export XAI_API_KEY="xai-..."
bash ~/propdesk-run.sh
```

If `pkg install nodejs` fails, try `pkg install nodejs-lts`. If install runs out of memory, close other apps and rerun — PropDesk needs a real Node install, not Python’s http.server.

## Knowledge

Firm snapshots and escalation rules live in `src/lib/propdesk/knowledge.ts`. Live answers prefer the firm’s current website over that snapshot.
