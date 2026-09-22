import { Link } from "@tanstack/react-router";
import { FirmLogo } from "@/components/propdesk/firm-logo";
import { firmList } from "@/lib/propdesk/engine";
import { useDeskStore } from "@/lib/propdesk/store";

export function FirmsView() {
  const setFirm = useDeskStore((s) => s.setFirm);
  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 desk:px-8 desk:py-10">
        <h1 className="page-title">Firms</h1>
        <p className="mt-3 max-w-xl text-muted">
          Choose a firm, then read its documented rules. PropDesk does not rank or recommend a book.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {firmList().map((f) => (
            <Link
              key={f.id}
              to="/firm/$firmId"
              params={{ firmId: f.id }}
              onClick={() => setFirm(f.id)}
              className="flex items-center gap-3 rounded-2xl border border-line bg-elev px-4 py-4 hover:bg-hover"
            >
              <FirmLogo firm={f} size={28} />
              <span className="min-w-0">
                <span className="block truncate text-[15px] font-semibold tracking-tight">{f.name}</span>
                <span className="block truncate text-sm text-dim">{f.models.join(" · ")}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
