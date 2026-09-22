import { useEffect, useRef } from "react";
import { Composer } from "@/components/propdesk/composer";
import { FirmLogo } from "@/components/propdesk/firm-logo";
import { MessageBubble, TypingRow } from "@/components/propdesk/message-bubble";
import { firmList, getFirm } from "@/lib/propdesk/engine";
import { firstPayout } from "@/lib/propdesk/plans";
import { useDeskStore } from "@/lib/propdesk/store";
import { cn } from "@/lib/utils";

const ROWS: { key: string; label: string; value: (id: string) => string }[] = [
  { key: "max", label: "Max drawdown", value: (id) => getFirm(id).drawdown },
  { key: "daily", label: "Daily drawdown", value: (id) => getFirm(id).drawdown },
  { key: "news", label: "News trading", value: (id) => getFirm(id).news },
  { key: "week", label: "Weekend holding", value: () => "Confirm on the live SKU. Not always published as a single line." },
  { key: "pay", label: "Payout requirement", value: (id) => firstPayout(id).request },
  { key: "con", label: "Consistency", value: (id) => getFirm(id).consistency },
];

export function CompareView() {
  const all = firmList();
  const ids = useDeskStore((s) => s.compareIds);
  const toggleCompare = useDeskStore((s) => s.toggleCompare);
  const messages = useDeskStore((s) => s.compareMessages);
  const sending = useDeskStore((s) => s.compareSending);
  const cols = ids.map((id) => getFirm(id));
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length, sending]);

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto w-full max-w-[1100px] px-4 py-6 desk:px-8 desk:py-10">
          <h1 className="page-title">How are these rules different?</h1>
          <p className="mt-3 max-w-xl text-muted">
            Documented differences only. PropDesk does not pick a winner, rating, or best firm.
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
                    on ? "border-fg bg-fg text-bg" : "border-line bg-elev text-muted",
                  )}
                >
                  <FirmLogo firm={f} size={16} />
                  {f.short}
                </button>
              );
            })}
          </div>
          <div className="mt-6 overflow-x-auto pb-2">
            <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-bg py-3 pr-3 text-dim">Rule</th>
                  {cols.map((f) => (
                    <th key={f.id} className="min-w-[10rem] px-3 py-3">
                      <div className="flex items-center gap-2">
                        <FirmLogo firm={f} size={18} />
                        <span className="font-semibold tracking-tight">{f.short}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.key} className="border-t border-line">
                    <th className="sticky left-0 bg-bg py-3 pr-3 align-top text-xs font-medium text-dim uppercase">
                      {row.label}
                    </th>
                    {cols.map((f) => (
                      <td key={f.id} className="px-3 py-3 align-top text-fg/90">
                        {row.value(f.id)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {messages.length ? (
            <div className="mx-auto mt-6 w-full max-w-[780px] pb-4">
              {messages.map((m, i) => (
                <MessageBubble key={`${m.ts}-${i}`} message={m} />
              ))}
              {sending ? <TypingRow /> : null}
            </div>
          ) : null}
        </div>
      </div>
      <Composer surface="compare" />
    </div>
  );
}
