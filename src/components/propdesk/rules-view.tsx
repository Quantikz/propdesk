import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { FirmLogo } from "@/components/propdesk/firm-logo";
import { firmList, getFirm } from "@/lib/propdesk/engine";
import { RULES_AS_OF, firstPayout, plansFor } from "@/lib/propdesk/plans";
import { stamp } from "@/lib/propdesk/payouts";
import { useDeskStore } from "@/lib/propdesk/store";
import { cn } from "@/lib/utils";

type SectionId = "program" | "drawdown" | "payout" | "limits";

const SECTIONS: { id: SectionId; label: string; blurb: string }[] = [
  {
    id: "program",
    label: "Program",
    blurb: "Which book you are actually buying. 1-step, 2-step, instant, and futures are not the same account.",
  },
  {
    id: "drawdown",
    label: "Drawdown",
    blurb: "What fails the account. Daily and max are separate, and floating loss only counts if the card is equity-based.",
  },
  {
    id: "payout",
    label: "Payout gates",
    blurb: "A profit is not a payout. KYC, minimum days, consistency, and the request window all have to clear.",
  },
  {
    id: "limits",
    label: "Restrictions",
    blurb: "News, EAs, copy trading, and holding. Allowed on the homepage can still be banned on the SKU.",
  },
];

type Row = { key: string; label: string; hint: string; value: (id: string) => string };

const ROWS: Record<SectionId, Row[]> = {
  program: [
    { key: "models", label: "Books", hint: "Do not mix these numbers.", value: (id) => getFirm(id).models.join(" · ") },
    {
      key: "plans",
      label: "Plans",
      hint: "Each plan has its own target and loss.",
      value: (id) => plansFor(id).map((p) => p.name).join(" · "),
    },
    {
      key: "target",
      label: "Target",
      hint: "Homepage target is not your invoice.",
      value: (id) => plansFor(id).map((p) => `${p.name}: ${p.target}`).join(" · "),
    },
    { key: "platforms", label: "Platforms", hint: "Credentials follow the platform you pick.", value: (id) => getFirm(id).platforms.join(", ") },
    { key: "size", label: "Size path", hint: "Scaling is not the starting account.", value: (id) => getFirm(id).maxAccount },
  ],
  drawdown: [
    { key: "daily", label: "Daily loss", hint: "One session. Equity counts open trades; EOD waits for the close.", value: (id) => plansFor(id).map((p) => `${p.name}: ${p.daily}`).join(" · ") },
    { key: "max", label: "Max loss", hint: "Lifetime floor. Trailing floors move up and do not give the room back.", value: (id) => plansFor(id).map((p) => `${p.name}: ${p.max}`).join(" · ") },
    { key: "measure", label: "How it is measured", hint: "This is the usual dispute.", value: (id) => getFirm(id).drawdown },
    { key: "note", label: "What changes by plan", hint: "Read the note for the SKU, not the brand.", value: (id) => plansFor(id).map((p) => `${p.name}: ${p.note}`).join(" · ") },
  ],
  payout: [
    { key: "split", label: "Profit split", hint: "Add-ons change the headline.", value: (id) => getFirm(id).profitSplit },
    { key: "cycle", label: "Cycle", hint: "On demand is not a wire date.", value: (id) => getFirm(id).payoutCycle },
    { key: "kyc", label: "KYC", hint: "First payout parks here most often.", value: (id) => firstPayout(id).kyc },
    { key: "days", label: "Minimum days", hint: "Four trades on Monday are still one day.", value: (id) => firstPayout(id).minDays },
    { key: "consistency", label: "Consistency", hint: "A large best day can park a withdrawal.", value: (id) => firstPayout(id).consistency },
    { key: "request", label: "When you can request", hint: "Missing one gate is a delay, not a ban.", value: (id) => firstPayout(id).request },
  ],
  limits: [
    { key: "news", label: "News", hint: "A fill inside the window counts even if you clicked earlier.", value: (id) => getFirm(id).news },
    { key: "ea", label: "EAs and copy", hint: "EA allowed is not every robot allowed.", value: (id) => getFirm(id).ea },
    { key: "hold", label: "Weekend / overnight", hint: "Futures flatten rules are not FX weekend habits.", value: (id) => firstPayout(id).news },
    { key: "fit", label: "Who it fits", hint: "Desk note, not a ranking.", value: (id) => getFirm(id).notes },
  ],
};

export function RulesView() {
  const firms = firmList();
  const [section, setSection] = useState<SectionId>("drawdown");
  const [openId, setOpenId] = useState(firms[0]?.id ?? "goat");
  const navigate = useNavigate();
  const setFirm = useDeskStore((s) => s.setFirm);
  const send = useDeskStore((s) => s.send);
  const rows = ROWS[section];
  const open = getFirm(openId);
  const meta = SECTIONS.find((s) => s.id === section) ?? SECTIONS[0];
  const plans = useMemo(() => plansFor(openId), [openId]);

  function ask(prompt: string) {
    setFirm(openId);
    void navigate({ to: "/desk" });
    void send(prompt);
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <div className="mx-auto w-full max-w-[1180px] px-4 py-5 desk:px-6 desk:py-7">
        <p className="font-display text-[11px] tracking-[0.14em] text-dim uppercase">Rule comparison</p>
        <h1 className="page-title mt-2">Same question, every firm</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Structured like a comparison desk, written as PropDesk. One row is one rule. Plans stay named so a 1-step number cannot be read as a 2-step number. Packed {stamp(RULES_AS_OF)}.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSection(s.id)}
              className={cn(
                "rounded-md px-3 py-1.5 font-display text-sm font-semibold",
                section === s.id ? "bg-paper text-ink" : "border border-line text-muted",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="mt-3 max-w-2xl text-sm text-muted">{meta.blurb}</p>

        <div className="mt-4 overflow-x-auto overscroll-x-contain rounded-md border border-line bg-elev">
          <table className="w-full min-w-[68rem] border-collapse text-left text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-elev px-3 py-3 font-display text-[11px] tracking-[0.12em] text-dim uppercase">
                  Rule
                </th>
                {firms.map((f) => (
                  <th key={f.id} className="min-w-[11rem] px-3 py-3 align-bottom">
                    <button
                      type="button"
                      onClick={() => setOpenId(f.id)}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-1 py-1 text-left font-display font-semibold",
                        openId === f.id ? "text-fg" : "text-muted",
                      )}
                    >
                      <FirmLogo firm={f} size={16} />
                      {f.short}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="border-t border-line">
                  <th className="sticky left-0 z-10 bg-elev px-3 py-3 align-top">
                    <span className="block font-display text-sm font-semibold">{row.label}</span>
                    <span className="mt-1 block text-xs font-normal text-dim">{row.hint}</span>
                  </th>
                  {firms.map((f) => (
                    <td key={f.id} className={cn("px-3 py-3 align-top text-muted", openId === f.id && "text-fg")}>
                      {row.value(f.id)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <section className="mt-5 rounded-md border border-line bg-elev p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FirmLogo firm={open} size={22} />
              <div>
                <h2 className="font-display text-lg font-bold tracking-tight">{open.name}</h2>
                <p className="text-xs text-dim">{meta.label} · confirm the live plan card</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                ask(
                  `On ${open.name}, list every ${meta.label.toLowerCase()} rule that applies. Name each plan separately. Include the measurement, the payout gate if it changes the answer, and the common mistake. Do not drop a related rule.`,
                )
              }
              className="rounded-md bg-paper px-3 py-2 font-display text-sm font-semibold text-ink"
            >
              Ask the desk
            </button>
          </div>
          <div className="mt-4 grid gap-2 desk:grid-cols-3">
            {plans.map((p) => (
              <article key={p.name} className="rounded-md border border-line px-3 py-3">
                <p className="font-display text-[11px] tracking-[0.12em] text-dim uppercase">{p.kind}</p>
                <h3 className="font-display mt-1 font-semibold">{p.name}</h3>
                <dl className="mt-2 space-y-1 text-sm text-muted">
                  <div><dt className="inline text-dim">Target </dt><dd className="inline">{p.target}</dd></div>
                  <div><dt className="inline text-dim">Daily </dt><dd className="inline">{p.daily}</dd></div>
                  <div><dt className="inline text-dim">Max </dt><dd className="inline">{p.max}</dd></div>
                </dl>
                <p className="mt-2 text-sm leading-relaxed">{p.note}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
