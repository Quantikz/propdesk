import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { libraryTopics, TOPICS } from "@/lib/propdesk/explain";
import { useDeskStore } from "@/lib/propdesk/store";

export function HomeLanding() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const send = useDeskStore((s) => s.send);

  function goAsk(text: string) {
    const next = text.trim();
    if (!next) {
      void navigate({ to: "/ask" });
      return;
    }
    void navigate({ to: "/ask" });
    window.setTimeout(() => send(next), 40);
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-8 desk:px-8 desk:pt-14">
        <p className="text-[13px] font-medium tracking-[0.14em] text-dim uppercase">PropDesk</p>
        <h1 className="page-title mt-3 max-w-3xl">Understand the rules before you buy.</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          Understand drawdown, payouts, news, consistency, and the restrictions that can affect your account.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            to="/ask"
            className="inline-flex h-11 items-center rounded-full bg-paper px-5 text-sm font-medium text-ink"
          >
            Ask PropDesk
          </Link>
          <Link
            to="/firms"
            className="inline-flex h-11 items-center rounded-full border border-line bg-elev px-5 text-sm font-medium"
          >
            Explore firms
          </Link>
        </div>

        <form
          className="mt-10 rounded-2xl border border-line bg-elev px-4 py-4"
          onSubmit={(e) => {
            e.preventDefault();
            goAsk(q);
          }}
        >
          <label htmlFor="pd-search" className="text-sm font-medium">
            What do you want to understand?
          </label>
          <input
            id="pd-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search a firm, rule, restriction, breach condition, or payout question."
            className="mt-2 h-12 w-full rounded-xl border-0 bg-bg px-3 text-base outline-none"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {TOPICS.map((t) => (
              <button
                key={t.id}
                type="button"
                className="rounded-full border border-line px-3 py-1.5 text-sm text-muted hover:text-fg"
                onClick={() => goAsk(t.label)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </form>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 desk:grid-cols-3">
          {libraryTopics().map((tile) => (
            <Link
              key={tile.id}
              to={tile.href.split("?")[0] as "/ask" | "/payouts" | "/rules"}
              className="rounded-2xl border border-line bg-elev px-4 py-5 hover:bg-hover"
            >
              <strong className="block text-[17px] font-semibold tracking-tight">{tile.title}</strong>
              <span className="mt-2 block text-sm leading-relaxed text-muted">{tile.blurb}</span>
            </Link>
          ))}
        </div>
        <p className="mt-10 max-w-2xl text-xs leading-relaxed text-dim">
          PropDesk provides informational explanations and is not a substitute for a firm’s current official terms.
        </p>
      </div>
    </div>
  );
}
