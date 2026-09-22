import { trustLabel, type RuleExplain } from "@/lib/propdesk/explain";
import { cn } from "@/lib/utils";

export function TrustPill({ trust }: { trust: RuleExplain["trust"] }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-md px-2 py-0.5 font-display text-[11px] font-semibold",
        trust === "verified" && "bg-ok/15 text-ok",
        trust === "confirm" && "bg-warn/15 text-warn",
        trust === "unverified" && "bg-bad/15 text-bad",
      )}
    >
      {trustLabel(trust)}
    </span>
  );
}

export function RuleCard({ rule }: { rule: RuleExplain }) {
  return (
    <details className="rounded-md border border-line bg-elev px-3 py-3">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
        <span className="min-w-0">
          <span className="block font-display text-sm font-semibold tracking-tight">{rule.title}</span>
          <span className="mt-1 block text-sm text-muted">{rule.short}</span>
        </span>
        <TrustPill trust={rule.trust} />
      </summary>
      <div className="mt-3 space-y-3 border-t border-line pt-3 text-sm leading-relaxed">
        <p>
          <strong className="block font-display text-[11px] tracking-[0.12em] text-dim uppercase">Short answer</strong>
          {rule.short}
        </p>
        <p>
          <strong className="block font-display text-[11px] tracking-[0.12em] text-dim uppercase">What the official rule says</strong>
          {rule.official}
        </p>
        <p>
          <strong className="block font-display text-[11px] tracking-[0.12em] text-dim uppercase">What it means</strong>
          {rule.means}
        </p>
        <p>
          <strong className="block font-display text-[11px] tracking-[0.12em] text-dim uppercase">Example</strong>
          {rule.example}
        </p>
        <p>
          <strong className="block font-display text-[11px] tracking-[0.12em] text-dim uppercase">Common mistake</strong>
          {rule.mistake}
        </p>
        <p className="text-xs text-dim">
          Source · Last verified {rule.verified}.{" "}
          <a href={rule.sourceUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">Official page</a>
          . {rule.source}
        </p>
      </div>
    </details>
  );
}
