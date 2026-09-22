import { useMemo, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
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
  const search = useRouterState({ select: (s) => s.location.search }) as { topic?: string };
  const start = FILTERS.some((f) => f.id === search.topic) ? (search.topic as RuleTopic) : "all";
  const [tab, setTab] = useState<"all" | RuleTopic>(start);
  const firms = firmList();
  const rows = useMemo(() => {
    return explainAll().filter((r) => {
      if (tab !== "all" && r.topic !== tab) return false;
      return true;
    });
  }, [tab]);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 desk:px-8 desk:py-10">
        <h1 className="page-title">Rule library</h1>
        <p className="mt-3 text-muted">Browse documented rules. Open a card to see the explanation, example, and source.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setTab(f.id)}
              className={`rounded-full px-3 py-1.5 text-sm ${tab === f.id ? "bg-paper text-ink" : "border border-line text-muted"}`}
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
              className="rounded-full border border-line px-3 py-1.5 text-sm text-muted"
            >
              {f.short}
            </Link>
          ))}
        </div>
        <div className="mt-5 space-y-3">
          {rows.slice(0, 24).map((r) => (
            <RuleCard key={r.id} rule={r} />
          ))}
        </div>
      </div>
    </div>
  );
}
