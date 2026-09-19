import { ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { SUGGESTS, getFirm } from "@/lib/propdesk/engine";
import { useDeskStore } from "@/lib/propdesk/store";

export function EmptyState() {
  const firmId = useDeskStore((s) => s.firmId);
  const send = useDeskStore((s) => s.send);
  const sending = useDeskStore((s) => s.sending);
  const firm = getFirm(firmId);

  return (
    <div className="flex w-full flex-1 flex-col justify-start px-1 desk:justify-center">
      <p className="text-[11px] tracking-[0.14em] text-dim uppercase">{firm.short} · 24/7 FAQ</p>
      <h2 className="font-display mt-2 max-w-lg text-2xl font-semibold tracking-tight desk:text-[1.85rem]">
        Ask anything about {firm.name}
      </h2>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">
        Open around the clock. Replies in seconds. Rules, payouts, drawdown, which plan
        fits you. This desk answers questions — tickets come later.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          to="/compare"
          className="inline-flex min-h-11 items-center rounded-md border border-line bg-elev px-3.5 text-sm font-medium hover:bg-hover"
        >
          Compare firms
        </Link>
        <Link
          to="/payouts"
          className="inline-flex min-h-11 items-center rounded-md border border-line bg-elev px-3.5 text-sm font-medium hover:bg-hover"
        >
          Payouts issued
        </Link>
      </div>
      <div className="mt-5 grid w-full grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
        {SUGGESTS.map((s) => (
          <button
            key={s.title}
            type="button"
            disabled={sending}
            onClick={() => send(s.prompt)}
            className="flex min-h-12 items-center gap-3 bg-elev px-3.5 py-3 text-left hover:bg-hover disabled:opacity-50 desk:min-h-14 desk:px-4"
          >
            <span className="min-w-0 flex-1">
              <strong className="block text-sm font-medium">{s.title}</strong>
              <em className="mt-0.5 block text-xs not-italic text-dim">{s.blurb}</em>
            </span>
            <ChevronRight className="size-4 shrink-0 text-dim" />
          </button>
        ))}
      </div>
    </div>
  );
}
