# PropDesk

ChatGPT-style support desk for prop-firm traders (FTMO, FundedNext, The5ers, FundingPips, E8, Goat, Alpha Capital, Apex, Topstep, Instant Funding).

## What it does

1. Answers questions from a firm-specific FAQ / rule pattern knowledge base.
2. Refuses to email the firm for ordinary rule breaches (daily loss, early payout, incomplete KYC, consistency parks).
3. If the trader claims **firm fault** and attaches evidence, compiles a case and opens an email to the firm’s support inbox with:
   - the case narrative
   - account ID
   - trader email as reply-to / CC so the firm talks to the trader

## Run it

Open `index.html` in a browser, or:

```bash
python3 -m http.server 8080
```

Then visit http://localhost:8080

## Run on phone (Termux)

Paste this once:

```bash
pkg update -y && pkg install -y git python
curl -fsSL https://raw.githubusercontent.com/Quantikz/propdesk/main/termux-run.sh -o ~/propdesk-run.sh
chmod +x ~/propdesk-run.sh
bash ~/propdesk-run.sh
```

Next times just:

```bash
bash ~/propdesk-run.sh
```

Then open http://127.0.0.1:8080 in the phone browser. Keep the Termux session running.

## Add a real model later

The UI already calls `window.PROPDESK_AI.complete`. Two options:

- Backend: `window.PROPDESK_AI_ENDPOINT = "https://your-api/chat"`
- Browser key (dev only): `localStorage.setItem("PROPDESK_OPENAI_KEY", "sk-...")`

Until then the built-in classifier + FAQ engine runs offline.

## Send mail from a server

By default the case uses `mailto:` so the trader can attach screenshots in their own mailbox.

To send from your stack:

```js
window.PROPDESK_MAIL_ENDPOINT = "/api/send-case";
```

POST body: `{ to, cc, subject, text, caseId }`.

## Edit firms / FAQs

All copy lives in `knowledge.js` — add a firm object and tags on topics. Support addresses should be verified against each firm’s current contact page before production.
