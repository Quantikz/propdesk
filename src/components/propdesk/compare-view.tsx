import { useEffect, useRef } from "react";
import { ChevronRight } from "lucide-react";
import { Composer } from "@/components/propdesk/composer";
import { FirmLogo } from "@/components/propdesk/firm-logo";
import { MessageBubble, TypingRow } from "@/components/propdesk/message-bubble";
import { COMPARE_PROMPTS, COMPARE_ROWS } from "@/lib/propdesk/faq";
import { firmList, getFirm } from "@/lib/propdesk/engine";
import { firmValue } from "@/lib/propdesk/value";
import { useDeskStore } from "@/lib/propdesk/store";
import { cn } from "@/lib/utils";

const VALUE_ROWS = [
  { key: "fee", label: "Fee", value: (id: string) => firmValue(id).fee },
  { key: "reset", label: "Reset", value: (id: string) => firmValue(id).reset },
  { key: "time", label: "Time to funded", value: (id: string) => firmValue(id).timeToFunded },
];

export function CompareView() {
  const all = firmList();
  const ids = useDeskStore((s) => s.compareIds);
  const toggleCompare = useDeskStore((s) => s.toggleCompare);
  const messages = useDeskStore((s) => s.compareMessages);
  const sending = useDeskStore((s) => s.compareSending);
  const sendCompare = useDeskStore((s) => s.sendCompare);
  const cols = ids.map((id) => getFirm(id));
  const scroller = useRef<HTMLDivElement>(null);
  const rows = [...VALUE_ROWS, ...COMPARE_ROWS];

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length, sending]);

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto w-full max-w-[1100px] px-4 py-5 desk:px-6 desk:py-7">
          <p className="font-display text-[11px] tracking-[0.14em] text-dim uppercase">Before you buy</p>
          <h2 className="page-title mt-2">Compare firms</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            Fee, reset, and time-to-funded first. Then the rules that change the trade.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {all.map((f) => {
              const on = ids.includes(f.id);
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleCompare(f.id)}
                  className={cn(
                    "inline-flex min-h-11 items-center gap-2 rounded-md border px-3 font-display text-sm font-semibold",
                    on ? "border-fg bg-fg text-bg" : "border-line bg-elev text-muted hover:text-fg",
                  )}
                >
                  <FirmLogo firm={f} size={16} />
                  {f.short}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-dim">
            {ids.length} selected · tap again to drop (keep at least two)
          </p>

          <div className="mt-6 overflow-x-auto overscroll-x-contain pb-2">
            <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 w-28 bg-bg py-3 pr-3 font-medium text-dim">Rule</th>
                  {cols.map((f) => (
                    <th key={f.id} className="min-w-[10.5rem] bg-bg px-3 py-3 align-bottom">
                      <div className="flex items-center gap-2">
                        <FirmLogo firm={f} size={18} />
                        <span className="font-display text-lg font-bold tracking-tight">{f.short}</span>
                      </div>
                      <div className="mt-1 text-xs font-normal text-dim">{f.name}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.key} className="border-t border-border">
                    <th className="sticky left-0 bg-bg py-3 pr-3 align-top text-xs font-medium tracking-wide text-dim uppercase">
                      {row.label}
                    </th>
                    {cols.map((f) => (
                      <td key={f.id} className="px-3 py-3 align-top leading-relaxed text-fg/90">
                        {row.value(f.id)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-dim">
            Packed snapshot. Say “check” below to quote the live page and date.
          </p>

          {messages.length === 0 ? (
            <div className="mt-6 grid max-w-[780px] grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3">
              {COMPARE_PROMPTS.map((s) => (
                <button
                  key={s.title}
                  type="button"
                  disabled={sending}
                  onClick={() => sendCompare(s.prompt)}
                  className="flex min-h-12 items-center gap-3 bg-elev px-3.5 py-3 text-left hover:bg-hover disabled:opacity-50"
                >
                  <span className="min-w-0 flex-1">
                    <strong className="block text-sm font-medium">{s.title}</strong>
                    <em className="mt-0.5 block text-xs not-italic text-dim">{s.blurb}</em>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-dim" />
                </button>
              ))}
            </div>
          ) : (
            <div className="mx-auto mt-6 w-full max-w-[780px] pb-4">
              {messages.map((m, i) => (
                <MessageBubble key={`${m.ts}-${i}`} message={m} />
              ))}
              {sending ? <TypingRow /> : null}
            </div>
          )}
        </div>
      </div>
      <Composer surface="compare" />
    </div>
  );
}
