# PropDesk

Independent support desk for prop-firm traders. Open 24/7. Replies in seconds.

Covers FTMO, FundedNext, The5ers, FundingPips, E8, Goat Funded Trader, Alpha Capital, Apex, Topstep, and Instant Funding.

## What it does

- Hears what happened, then checks the selected firm’s current rules on their official site.
- Escalates only for **firm-side operational fault** with evidence (wrong calc vs dashboard, approved payout past SLA, outage-caused breach, fee with no account, rule not in terms).
- Compiles a letter and opens email to the firm’s support inbox with the trader on CC.

It will not email the firm for ordinary rule breaches (daily loss, consistency parks, early payouts, incomplete KYC).

## Stack

React 19, TanStack Start, Tailwind v4, Zustand. The desk looks up the firm’s site from the server. No keys in the browser. Visitors never paste a key.

## Run on a computer

```bash
git clone https://github.com/Quantikz/propdesk.git
cd propdesk
npm install
npm run dev
```

Then open http://127.0.0.1:8080

## Run on Termux (Android)

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

Keep that session open. On this phone open **http://127.0.0.1:8080**. The script also prints a Wi-Fi address so a laptop on the same network can open it.

## Knowledge

Firm snapshots live in `src/lib/propdesk/knowledge.ts`. Live answers prefer the firm’s current website over that snapshot.
