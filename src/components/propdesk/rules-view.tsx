import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { RuleCard } from "@/components/propdesk/rule-card";
import { firmList } from "@/lib/propdesk/engine";
import { explainAll, type RuleTopic } from "@/lib/propdesk/explain";

const FILTERS: { id: "all" | RuleTopic; label: string }[] = [
  { id: "all", label: "All" },
  { id: "rules", label: "Rules" },
  { id: "breaches", label: "Breaches" },
  { id: "payouts", label: "Payouts" },
  { id: "restrictions", label: "Restrictions" },
];

export function RulesView() {
  const [tab, setTab] = useState<"all" | RuleTopic>("all");
  const firms = firmList();
  const rows = useMemo(
    () => explainAll().filter((r) => (tab === "all" ? true : r.topic === tab)),
    [tab],
  );

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <div className="mx-auto w-full max-w-3xl px-4 py-5 desk:px-8 desk:py-7">
        <p className="font-display text-[11px] tracking-[0.14em] text-dim uppercase">Rule library</p>
        <h1 className="page-title mt-2">Explain this rule</h1>
        <p className="mt-2 text-sm text-muted">
          Short answer, official note, meaning, example, common mistake, source and last verified.
          PropDesk provides informational explanations and is not a substitute for a firm&apos;s current official terms.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setTab(f.id)}
              className={`rounded-md px-3 py-1.5 font-display text-sm font-semibold ${
                tab === f.id ? "bg-paper text-ink" : "border border-line text-muted"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {firms.map((f) => (
            <Link
              key={f.id}
              to="/firm/$firmId"
              params={{ firmId: f.id }}
              className="rounded-md border border-line px-3 py-1.5 font-display text-sm text-muted"
            >
              {f.short}
            </Link>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          {rows.slice(0, 48).map((r) => (
            <RuleCard key={r.id} rule={r} />
          ))}
        </div>
      </div>
    </div>
  );
}
