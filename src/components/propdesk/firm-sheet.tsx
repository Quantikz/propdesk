import { useEffect, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { FirmLogo } from "@/components/propdesk/firm-logo";
import { RuleCard } from "@/components/propdesk/rule-card";
import { getFirm } from "@/lib/propdesk/engine";
import { explainFirm, type RuleTopic } from "@/lib/propdesk/explain";
import { faqItems } from "@/lib/propdesk/faq";
import { firstPayout } from "@/lib/propdesk/plans";
import { useDeskStore } from "@/lib/propdesk/store";
import { cn } from "@/lib/utils";

const TABS: { id: RuleTopic | "faq"; label: string }[] = [
  { id: "rules", label: "Rules" },
  { id: "breaches", label: "Breaches" },
  { id: "payouts", label: "Payouts" },
  { id: "restrictions", label: "Trading restrictions" },
  { id: "faq", label: "FAQ" },
];

export function FirmSheet() {
  const params = useParams({ strict: false }) as { firmId?: string };
  const storeFirm = useDeskStore((s) => s.firmId);
  const setFirm = useDeskStore((s) => s.setFirm);
  const id = params.firmId || storeFirm;
  const firm = getFirm(id);
  const rules = explainFirm(firm.id);
  const faqs = faqItems(firm.id);
  const fp = firstPayout(firm.id);
  const [tab, setTab] = useState<RuleTopic | "faq">("rules");

  useEffect(() => {
    if (params.firmId && params.firmId !== storeFirm) setFirm(firm.id);
  }, [params.firmId, storeFirm, firm.id, setFirm]);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 desk:px-8 desk:py-10">
        <div className="flex items-center gap-3">
          <FirmLogo firm={firm} size={36} />
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{firm.name}</h1>
            <p className="text-sm text-muted">Understand the rules before you trade.</p>
          </div>
        </div>

        <div className="mt-5 flex gap-1 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-sm",
                tab === t.id ? "bg-paper text-ink" : "text-muted hover:text-fg",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "faq" ? (
          <div className="mt-5 space-y-3">
            {faqs.map((item) => (
              <div key={item.q} className="rounded-2xl border border-line bg-elev px-4 py-4">
                <p className="text-[15px] font-semibold tracking-tight">{item.q}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.a}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {tab === "payouts" ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  ["Eligibility", fp.request],
                  ["Requirements", `KYC: ${fp.kyc} Days: ${fp.minDays}`],
                  ["Possible denial", fp.consistency],
                  ["Timing", firm.payoutCycle],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-2xl border border-line bg-elev px-4 py-4">
                    <p className="text-[11px] font-medium tracking-[0.12em] text-dim uppercase">{k}</p>
                    <p className="mt-1 text-sm leading-relaxed">{v}</p>
                  </div>
                ))}
              </div>
            ) : null}
            {rules
              .filter((r) => r.topic === tab)
              .map((r) => (
                <RuleCard key={r.id} rule={r} />
              ))}
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-2">
          <Link
            to="/ask"
            onClick={() => setFirm(firm.id)}
            className="inline-flex h-11 items-center rounded-full bg-paper px-5 text-sm font-medium text-ink"
          >
            Ask PropDesk
          </Link>
          <Link
            to="/compare"
            className="inline-flex h-11 items-center rounded-full border border-line bg-elev px-5 text-sm font-medium"
          >
            How are these rules different?
          </Link>
        </div>
      </div>
    </div>
  );
}
