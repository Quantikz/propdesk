import { Link } from "@tanstack/react-router";
import { getFirm } from "@/lib/propdesk/engine";
import { useDeskStore } from "@/lib/propdesk/store";

export function EmptyState() {
  const firmId = useDeskStore((s) => s.firmId);
  const send = useDeskStore((s) => s.send);
  const sending = useDeskStore((s) => s.sending);
  const firm = getFirm(firmId);
  const prompts = [
    { title: "What can cause a breach?", prompt: `What can cause a breach on ${firm.name}? Explain the rule and the source.` },
    { title: "What can deny a payout?", prompt: `What can deny a payout on ${firm.name}? Separate official rules from reports.` },
    { title: "Does floating loss count?", prompt: `On ${firm.name}, can floating loss trigger daily drawdown? Explain this rule.` },
  ];

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-1 py-6">
      <p className="text-[13px] font-medium tracking-[0.14em] text-dim uppercase">Desk</p>
      <h2 className="page-title mt-2">Ask a plain-English question</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        You do not need to pick an account type first. If the firm matters, name it. Answers should cite a source.
      </p>
      <div className="mt-5 grid gap-2">
        {prompts.map((p) => (
          <button
            key={p.title}
            type="button"
            disabled={sending}
            onClick={() => send(p.prompt)}
            className="rounded-md border border-line bg-elev px-3 py-3 text-left font-display text-sm font-semibold hover:bg-hover disabled:opacity-50"
          >
            {p.title}
          </button>
        ))}
      </div>
      <Link to="/firms" className="mt-4 text-sm text-muted underline underline-offset-2">
        Or open a firm sheet
      </Link>
    </div>
  );
}
