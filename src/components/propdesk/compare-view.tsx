import { useMemo, useState } from "react";
import { COMPARE_ROWS } from "@/lib/propdesk/faq";
import { firmList, getFirm } from "@/lib/propdesk/engine";
import { cn } from "@/lib/utils";

const MAX_FIRMS = 4;

export function CompareView() {
  const all = firmList();
  const [ids, setIds] = useState<string[]>(["ftmo", "fundednext"]);

  function toggle(id: string) {
    setIds((cur) => {
      if (cur.includes(id)) {
        if (cur.length <= 2) return cur;
        return cur.filter((x) => x !== id);
      }
      if (cur.length >= MAX_FIRMS) return [...cur.slice(1), id];
      return [...cur, id];
    });
  }

  const cols = useMemo(() => ids.map((id) => getFirm(id)), [ids]);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <div className="mx-auto w-full max-w-[1100px] px-4 py-5 desk:px-6 desk:py-8">
        <p className="text-[11px] tracking-[0.14em] text-dim uppercase">Side by side</p>
        <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight desk:text-[1.85rem]">
          Compare firms
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
          Pick two to four. Read the row that actually decides it for you — drawdown,
          payout, news — not the homepage split.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {all.map((f) => {
            const on = ids.includes(f.id);
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(f.id)}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors duration-[var(--motion-quick)]",
                  on
                    ? "border-fg bg-fg text-bg"
                    : "border-line bg-elev text-muted hover:text-fg",
                )}
              >
                <span
                  className="size-2 rounded-full"
                  style={{ background: on ? "currentColor" : f.color }}
                  aria-hidden
                />
                {f.short}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-dim">
          {ids.length} selected · tap again to drop (keep at least two)
        </p>

        <div className="mt-6 overflow-x-auto overscroll-x-contain pb-4">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 w-28 bg-bg py-3 pr-3 font-medium text-dim">
                  Rule
                </th>
                {cols.map((f) => (
                  <th key={f.id} className="min-w-[10.5rem] bg-bg px-3 py-3 align-bottom">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full" style={{ background: f.color }} />
                      <span className="font-display text-base font-semibold">{f.short}</span>
                    </div>
                    <div className="mt-1 text-xs font-normal text-dim">{f.name}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row) => (
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
          Figures are a snapshot. The live plan card and current terms win if they disagree.
        </p>
      </div>
    </div>
  );
}
