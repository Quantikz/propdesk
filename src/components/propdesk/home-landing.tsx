import { FormEvent, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { FirmLogo } from "@/components/propdesk/firm-logo";
import { BrandLockup } from "@/components/propdesk/logo";
import { SiteFooter } from "@/components/propdesk/site-footer";
import { firmList } from "@/lib/propdesk/engine";
import { libraryTopics } from "@/lib/propdesk/explain";
import { useDeskStore } from "@/lib/propdesk/store";

const QUESTIONS = [
  "Can I hold trades over the weekend?",
  "Does a copier cause a payout denial?",
  "Is daily drawdown measured on equity or balance?",
  "What has to be true before the first payout?",
];

const RULES = [
  { id: "daily-drawdown", title: "Daily drawdown", example: "Example: daily drawdown can be measured on equity, not just balance." },
  { id: "max-drawdown", title: "Maximum drawdown", example: "Example: a trailing limit can move. A static limit does not." },
  { id: "consistency", title: "Consistency", example: "Example: one large day can block a payout even after a pass." },
  { id: "payouts", title: "Payout eligibility", example: "Example: KYC and a minimum number of days can both be required." },
  { id: "news", title: "News", example: "Example: news can be allowed on one account type and banned on another." },
  { id: "eas", title: "EAs and copy", example: "Example: an EA can be allowed while a trade copier is a denial." },
];

function planLabel(model: string) {
  const m = model.toLowerCase();
  if (m.includes("1-step") || m.includes("1 step") || m.includes("one-step")) return "1-Step";
  if (m.includes("2-step") || m.includes("2 step") || m.includes("two-step")) return "2-Step";
  if (m.includes("instant")) return "Instant";
  if (m.includes("future")) return "Futures";
  return model;
}

export function HomeLanding() {
  const firms = firmList();
  const setFirm = useDeskStore((s) => s.setFirm);
  const send = useDeskStore((s) => s.send);
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [firmQ, setFirmQ] = useState("");
  const shown = firms.filter((f) => f.name.toLowerCase().includes(firmQ.trim().toLowerCase()));
  const sample = firms[0];

  async function ask(text: string) {
    const prompt = text.trim();
    if (!prompt) return;
    void navigate({ to: "/desk" });
    await send(prompt);
  }

  function onSearch(e: FormEvent) {
    e.preventDefault();
    void ask(q);
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 pb-24 desk:px-8 desk:py-10">
          <BrandLockup size="lg" />
          <p className="mt-8 font-display text-[11px] tracking-[0.16em] text-dim uppercase">Independent research desk</p>
          <h1 className="page-title mt-2 max-w-2xl">Know the rules before you trade.</h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
            PropDesk helps you understand a firm’s rules before you buy a challenge. It is research, not a shop and not a ranking.
          </p>
          <Link to="/desk" className="pd-lift mt-5 inline-flex h-11 min-w-11 items-center rounded-md bg-paper px-4 font-display text-sm font-semibold text-ink">
            Ask PropDesk
          </Link>
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <Link to="/firms" className="text-link underline-offset-2 hover:underline">Explore firms</Link>
            <Link to="/compare" className="text-link underline-offset-2 hover:underline">Compare firms</Link>
          </p>

        {sample ? (
            <article className="pd-lift mt-8 rounded-md border border-line bg-elev px-3 py-3">
            <p className="text-sm text-fg">Can I hold trades over the weekend on {sample.name}?</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">Weekend holding depends on the account type. Some firms require a flatten before the close. Confirm the live plan card.</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <a href={sample.portal} target="_blank" rel="noopener noreferrer" className="rounded-full border border-line px-2.5 py-1 text-link">Official page</a>
            </div>
            </article>
        ) : null}

        <form onSubmit={onSearch} className="mt-8">
          <label htmlFor="desk-search" className="font-display text-[11px] tracking-[0.14em] text-dim uppercase">
            What do you want to understand?
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input id="desk-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Firm, rule, restriction, breach, or payout." className="h-11 min-w-0 flex-1 rounded-md border border-line bg-elev px-3 text-sm text-fg outline-none focus:border-fg" />
            <button type="submit" className="pd-lift inline-flex h-11 shrink-0 items-center justify-center rounded-md bg-paper px-4 font-display text-sm font-semibold text-ink">Ask</button>
          </div>
        </form>
        <div className="mt-3 flex flex-wrap gap-2">
          {QUESTIONS.map((text, i) => (
              <button type="button" onClick={() => void ask(text)} className="pd-lift min-h-11 rounded-md border border-line px-3 text-left text-sm text-muted hover:bg-hover hover:text-fg">
                {text}
              </button>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {libraryTopics().map((card, i) => (
              <Link to={card.href} className="pd-lift block min-h-11 rounded-md border border-line bg-elev px-3 py-3 hover:bg-hover">
              <span className="block font-display text-sm font-semibold">{card.title}</span>
              <span className="mt-1 block text-xs text-muted">{card.blurb}</span>
              </Link>
          ))}
        </div>

        <h2 className="mt-12 font-display text-xl font-bold tracking-tight">Firms</h2>
        <p className="mt-1 text-sm text-muted">Choose a firm, then read the rules. PropDesk does not rank firms.</p>
        <label className="mt-3 block text-sm" htmlFor="firm-filter">
          <span className="sr-only">Find a firm</span>
          <input id="firm-filter" value={firmQ} onChange={(e) => setFirmQ(e.target.value)} placeholder="Find a firm" className="h-11 w-full rounded-md border border-line bg-elev px-3 text-sm" />
        </label>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {shown.map((f, i) => (
              <Link to="/firm/$firmId" params={{ firmId: f.id }} onClick={() => setFirm(f.id)} className="pd-lift flex min-h-11 items-center gap-3 rounded-md border border-line bg-elev px-3 py-3 hover:bg-hover">
              <FirmLogo firm={f} size={36} />
              <span className="min-w-0">
                <span className="block truncate font-display text-sm font-semibold">{f.name}</span>
                <span className="block truncate font-mono text-xs text-dim">{f.models.slice(0, 2).map(planLabel).join(" · ") || "Plan on the official page"}</span>
              </span>
              </Link>
          ))}
        </div>
        {shown.length === 0 ? <p className="mt-3 text-sm text-muted">No firm matches that name.</p> : null}

        <h2 className="mt-12 font-display text-xl font-bold tracking-tight">Important rules</h2>
        <p className="mt-1 text-sm text-muted">These differ by firm, by account type, and between the challenge and the funded account.</p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {RULES.map((rule, i) => (
              <Link to="/rules" hash={rule.id} className="pd-lift block min-h-11 rounded-md border border-line bg-elev px-3 py-3">
              <span className="block font-display text-sm font-semibold">{rule.title}</span>
              <span className="mt-1 block text-xs text-muted">{rule.example}</span>
              </Link>
          ))}
        </div>

        <h2 className="mt-12 font-display text-xl font-bold tracking-tight">Tools</h2>
        <p className="mt-1 text-sm text-muted">Calculators show the arithmetic. They do not replace the firm’s definition.</p>
        <Link to="/tools" className="pd-lift mt-3 inline-flex h-11 items-center rounded-md border border-line px-4 font-display text-sm font-semibold">Open tools</Link>

        <h2 className="mt-12 font-display text-xl font-bold tracking-tight">Sources</h2>
        <p className="mt-1 text-sm text-muted">A rule should trace to an official page. A live stamp is a check. A desk note is not.</p>
        <Link to="/methodology" className="mt-3 inline-flex min-h-11 items-center text-sm text-link underline">Methodology</Link>

        <h2 className="mt-12 font-display text-xl font-bold tracking-tight">For prop firms</h2>
        <p className="mt-1 text-sm text-muted">Write to us and we will list your firm. A listing is not a ranking and not a paid spot.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to="/forpropfirms" className="pd-lift inline-flex h-11 items-center rounded-md bg-paper px-4 font-display text-sm font-semibold text-ink">For prop firms</Link>
          <Link to="/contact" className="pd-lift inline-flex h-11 items-center rounded-md border border-line px-4 font-display text-sm font-semibold">Contact</Link>
        </div>

        <h2 className="mt-12 font-display text-xl font-bold tracking-tight">Questions</h2>
        <div className="mt-3 space-y-2 text-sm text-muted">
          <p><span className="text-fg">What is PropDesk?</span> A rules desk. Not a broker and not an affiliate board.</p>
          <p><span className="text-fg">Where do rules come from?</span> Official pages first. The rule checklist sits underneath.</p>
          <p><span className="text-fg">Why do numbers differ?</span> Account type and phase. A funded account is often stricter than the challenge.</p>
          <p><span className="text-fg">Can a firm be listed?</span> Yes. A representative writes through For Prop Firms. We list from the official page.</p>
        </div>
        <SiteFooter />
      </div>
      <Link to="/desk" className="fixed bottom-3 left-1/2 z-30 inline-flex h-11 -translate-x-1/2 items-center rounded-full bg-paper px-5 font-display text-sm font-semibold text-ink desk:hidden">
        Ask a rule question
      </Link>
    </div>
  );
}
