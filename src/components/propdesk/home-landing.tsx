import { FormEvent, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { FirmLogo } from "@/components/propdesk/firm-logo";
import { DeskDisclaimer } from "@/components/propdesk/disclaimer";
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
        <p className="font-display text-[11px] tracking-[0.16em] text-dim uppercase">Independent research desk</p>
        <h1 className="page-title mt-2 max-w-2xl">Understand the rules before you buy.</h1>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
          Understand drawdown, payouts, news, consistency, and the restrictions that can affect your account.
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
          <div className="mt-2 flex gap-2">
            <input
              id="desk-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search a firm, rule, restriction, breach condition, or payout question."
              className="h-11 min-w-0 flex-1 rounded-md border border-line bg-elev px-3 text-sm text-fg placeholder:text-dim outline-none focus:border-fg"
            />
            <button
              type="submit"
              className="inline-flex h-11 shrink-0 items-center rounded-md bg-paper px-4 font-display text-sm font-semibold text-ink"
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
        <DeskDisclaimer />
      </div>
    </div>
  );
}
