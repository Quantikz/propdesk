import { FormEvent, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { FirmLogo } from "@/components/propdesk/firm-logo";
import { BrandLockup } from "@/components/propdesk/logo";
import { SiteFooter } from "@/components/propdesk/site-footer";
import { firmList } from "@/lib/propdesk/engine";
import { libraryTopics, TOPICS } from "@/lib/propdesk/explain";
import { useDeskStore } from "@/lib/propdesk/store";

const TOPIC_PROMPTS: Record<string, string> = {
  drawdown: "How is drawdown measured, and can floating loss trigger it?",
  payouts: "What must be true before I can request a payout, and what can deny it?",
  news: "Is news trading allowed, restricted, or prohibited on the funded account?",
  eas: "Are EAs, copy trading, and hedging allowed?",
  weekend: "Can I hold over the weekend, and what is the flatten rule?",
  consistency: "Is there a consistency or best-day rule on payouts or passing?",
};

export function HomeLanding() {
  const firms = firmList();
  const setFirm = useDeskStore((s) => s.setFirm);
  const send = useDeskStore((s) => s.send);
  const navigate = useNavigate();
  const [q, setQ] = useState("");

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
      <div className="mx-auto w-full max-w-4xl px-4 py-6 desk:px-8 desk:py-8">
        <BrandLockup size="lg" />
        <p className="mt-6 font-display text-[11px] tracking-[0.16em] text-dim uppercase">Independent research desk</p>
        <h1 className="page-title mt-2 max-w-2xl">Know the rules before you trade.</h1>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
          PropDesk helps you understand a firm’s rules before you buy a challenge. It is research, not a shop and not a ranking.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            to="/desk"
            className="inline-flex h-10 items-center rounded-md bg-paper px-4 font-display text-sm font-semibold text-ink"
          >
            Ask PropDesk
          </Link>
          <Link
            to="/firms"
            className="inline-flex h-10 items-center rounded-md border border-line px-4 font-display text-sm font-semibold"
          >
            Explore firms
          </Link>
          <Link
            to="/compare"
            className="inline-flex h-10 items-center rounded-md border border-line px-4 font-display text-sm font-semibold"
          >
            Compare firms
          </Link>
        </div>

        <form onSubmit={onSearch} className="mt-6">
          <label htmlFor="desk-search" className="font-display text-[11px] tracking-[0.14em] text-dim uppercase">
            What do you want to understand?
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              id="desk-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Firm, rule, restriction, breach, or payout."
              className="h-11 min-w-0 flex-1 rounded-md border border-line bg-elev px-3 text-sm text-fg placeholder:text-dim outline-none focus:border-fg"
            />
            <button
              type="submit"
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-md bg-paper px-4 font-display text-sm font-semibold text-ink"
            >
              Ask
            </button>
          </div>
        </form>

        <div className="mt-3 flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => void ask(TOPIC_PROMPTS[t.id] ?? t.label)}
              className="rounded-md border border-line px-3 py-1.5 font-display text-sm text-muted hover:bg-hover hover:text-fg"
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2 desk:grid-cols-3">
          {libraryTopics().map((card) => (
            <Link
              key={card.id}
              to={card.href}
              className="rounded-md border border-line bg-elev px-3 py-3 hover:bg-hover"
            >
              <span className="block font-display text-sm font-semibold tracking-tight">{card.title}</span>
              <span className="mt-1 block text-xs leading-relaxed text-muted">{card.blurb}</span>
            </Link>
          ))}
        </div>

        <h2 className="mt-8 font-display text-xl font-bold tracking-tight">Firms</h2>
        <p className="mt-1 text-sm text-muted">Choose a firm, then read the rules. PropDesk does not rank books.</p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {firms.map((f) => (
            <Link
              key={f.id}
              to="/firm/$firmId"
              params={{ firmId: f.id }}
              onClick={() => setFirm(f.id)}
              className="flex items-center gap-3 rounded-md border border-line bg-elev px-3 py-3 hover:bg-hover"
            >
              <FirmLogo firm={f} size={28} />
              <span className="min-w-0">
                <span className="block truncate font-display text-sm font-semibold tracking-tight">
                  {f.name}
                </span>
                <span className="block truncate text-xs text-dim">{f.models[0]}</span>
              </span>
            </Link>
          ))}
        </div>
        <h2 className="mt-8 font-display text-xl font-bold tracking-tight">Important rules</h2>
        <p className="mt-1 text-sm text-muted">These differ by firm, by account type, and between the challenge and the funded account. No firm uses all of them the same way.</p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[
            ["Daily drawdown", "Floating loss can count. Confirm balance versus equity."],
            ["Maximum drawdown", "Static and trailing are different books."],
            ["Consistency", "A best day can block a payout even after a pass."],
            ["Payout gates", "KYC, minimum days, and a request window."],
            ["News", "Allowed on one SKU, banned on another."],
            ["EAs and copy", "A copier can be a denial even when an EA is allowed."],
          ].map(([title, blurb]) => (
            <Link key={title} to="/rules" className="rounded-md border border-line bg-elev px-3 py-3">
              <span className="block font-display text-sm font-semibold">{title}</span>
              <span className="mt-1 block text-xs text-muted">{blurb}</span>
            </Link>
          ))}
        </div>

        <h2 className="mt-8 font-display text-xl font-bold tracking-tight">Tools</h2>
        <p className="mt-1 text-sm text-muted">Calculators show the arithmetic. They do not replace the firm’s definition.</p>
        <Link to="/tools" className="mt-3 inline-flex h-10 items-center rounded-md border border-line px-4 font-display text-sm font-semibold">Open tools</Link>

        <h2 className="mt-8 font-display text-xl font-bold tracking-tight">Sources</h2>
        <p className="mt-1 text-sm text-muted">A rule should trace to an official page. A live stamp is a check. A desk note is not. Firm submissions are reviewed, not auto-published.</p>
        <Link to="/methodology" className="mt-3 inline-flex text-sm text-fg underline">Methodology</Link>

        <h2 className="mt-8 font-display text-xl font-bold tracking-tight">Help us keep your rules accurate.</h2>
        <p className="mt-1 text-sm text-muted">Prop firms can send a rulebook, a policy change, or a correction. Contact does not buy placement.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to="/forpropfirms" className="inline-flex h-10 items-center rounded-md bg-paper px-4 font-display text-sm font-semibold text-ink">For prop firms</Link>
          <Link to="/contact" className="inline-flex h-10 items-center rounded-md border border-line px-4 font-display text-sm font-semibold">Contact</Link>
        </div>

        <h2 className="mt-8 font-display text-xl font-bold tracking-tight">Questions</h2>
        <div className="mt-3 space-y-2 text-sm text-muted">
          <p><span className="text-fg">What is PropDesk?</span> A rules desk. Not a broker and not an affiliate board.</p>
          <p><span className="text-fg">Where do rules come from?</span> Official pages first. The pack is the checklist underneath.</p>
          <p><span className="text-fg">Why do numbers differ?</span> Account type and phase. A funded account is often stricter than the challenge.</p>
          <p><span className="text-fg">Something is wrong.</span> Use Corrections. Firms use For Prop Firms.</p>
        </div>
        <SiteFooter />
      </div>
    </div>
  );
}
