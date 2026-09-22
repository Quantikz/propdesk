import { Link } from "@tanstack/react-router";
import { FirmLogo } from "@/components/propdesk/firm-logo";
import { firmList } from "@/lib/propdesk/engine";
import { useDeskStore } from "@/lib/propdesk/store";

export function FirmsView() {
  const setFirm = useDeskStore((s) => s.setFirm);
  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <div className="mx-auto w-full max-w-4xl px-4 py-5 desk:px-8 desk:py-7">
        <p className="font-display text-[11px] tracking-[0.14em] text-dim uppercase">Firms</p>
        <h1 className="page-title mt-2">Choose a firm, then read the rules.</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          PropDesk does not rank or recommend a book. Open a sheet for Rules, Breaches, Payouts, and Restrictions.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {firmList().map((f) => (
            <Link
              key={f.id}
              to="/firm/$firmId"
              params={{ firmId: f.id }}
              onClick={() => setFirm(f.id)}
              className="flex items-center gap-3 rounded-md border border-line bg-elev px-3 py-3 hover:bg-hover"
            >
              <FirmLogo firm={f} size={28} />
              <span className="min-w-0">
                <span className="block truncate font-display text-sm font-semibold tracking-tight">{f.name}</span>
                <span className="block truncate text-xs text-dim">{f.models.join(" · ")}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
