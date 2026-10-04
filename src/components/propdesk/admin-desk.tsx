import { useEffect, useState } from "react";
import { Logo } from "@/components/propdesk/logo";
import { adminAdd, adminFirm, adminFirms, adminRemove, adminSave, adminSession, type FirmEdit } from "@/lib/propdesk/admin";

type Panel = "firms" | "add" | "edit";

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const I = {
  firms: "M4 6h16M4 12h16M4 18h10",
  add: "M12 5v14M5 12h14",
  edit: "M4 20h4l10-10-4-4L4 16v4z",
  out: "M10 7V5H5v14h5v-2M10 12h9M15 8l4 4-4 4",
  trash: "M5 7h14M9 7V5h6v2M8 7l1 12h6l1-12",
};

const FIELDS: { key: keyof FirmEdit; label: string; area?: boolean }[] = [
  { key: "name", label: "Name" },
  { key: "short", label: "Short name" },
  { key: "color", label: "Color" },
  { key: "supportEmail", label: "Support email" },
  { key: "portal", label: "Official page" },
  { key: "models", label: "Models, comma separated" },
  { key: "platforms", label: "Platforms, comma separated" },
  { key: "profitSplit", label: "Profit split" },
  { key: "payoutCycle", label: "Payout cycle" },
  { key: "payoutSlaDays", label: "Payout days" },
  { key: "maxAccount", label: "Max account" },
  { key: "drawdown", label: "Drawdown", area: true },
  { key: "consistency", label: "Consistency", area: true },
  { key: "news", label: "News", area: true },
  { key: "ea", label: "EAs", area: true },
  { key: "kyc", label: "KYC", area: true },
  { key: "challenge", label: "Challenge rules", area: true },
  { key: "funded", label: "Funded rules", area: true },
  { key: "denials", label: "Denial reasons", area: true },
  { key: "notes", label: "Notes", area: true },
];

export function AdminDesk() {
  const [key, setKey] = useState("");
  const [show, setShow] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [firms, setFirms] = useState<{ id: string; name: string; portal: string }[]>([]);
  const [panel, setPanel] = useState<Panel>("firms");
  const [name, setName] = useState("");
  const [portal, setPortal] = useState("");
  const [edit, setEdit] = useState<FirmEdit | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [booting, setBooting] = useState(true);

  async function load(next = key) {
    const rows = await adminFirms({ data: { key: next } });
    if (!rows.ok) {
      setAuthed(false);
      setNote("That key does not match. Check ADMIN_KEY on Vercel.");
      return;
    }
    setAuthed(true);
    setNote("");
    setFirms(rows.firms);
  }

  useEffect(() => {
    const saved = window.sessionStorage.getItem("pd-admin");
    if (!saved) {
      setBooting(false);
      return;
    }
    setKey(saved);
    void load(saved).finally(() => setBooting(false));
  }, []);

  async function enter() {
    setBusy(true);
    const out = await adminSession({ data: { key } });
    if (!out.ok) {
      setBusy(false);
      setNote("That key does not match. Check ADMIN_KEY on Vercel.");
      return;
    }
    window.sessionStorage.setItem("pd-admin", key);
    await load(key);
    setBusy(false);
  }

  async function add() {
    setBusy(true);
    setNote("Reading the official page and filling the sheet…");
    const out = await adminAdd({ data: { key, name, portal } });
    setBusy(false);
    if (!out.ok) {
      setNote(out.error === "key" ? "Key rejected." : out.error);
      return;
    }
    setName("");
    setPortal("");
    setNote(`${out.id} is on the desk.`);
    setPanel("firms");
    await load();
  }

  async function open(id: string) {
    const out = await adminFirm({ data: { key, id } });
    if (!out.ok) {
      setNote("Could not open that firm.");
      return;
    }
    setEdit(out.firm);
    setPanel("edit");
  }

  async function save() {
    if (!edit) return;
    setBusy(true);
    const out = await adminSave({ data: { key, firm: edit } });
    setBusy(false);
    setNote(out.ok ? "Saved." : "Could not save.");
    if (out.ok) await load();
  }

  async function remove(id: string) {
    if (!window.confirm(`Remove ${id} from the public desk?`)) return;
    const out = await adminRemove({ data: { key, id } });
    if (!out.ok) {
      setNote("Could not remove that firm.");
      return;
    }
    if (edit?.id === id) {
      setEdit(null);
      setPanel("firms");
    }
    await load();
  }

  function signOut() {
    window.sessionStorage.removeItem("pd-admin");
    setAuthed(false);
    setKey("");
    setFirms([]);
    setEdit(null);
  }

  if (booting) return <div className="fixed inset-0 grid place-items-center bg-[#f3eee6] text-sm text-[#6d675e]">Opening the desk…</div>;

  if (!authed) {
    return (
      <div className="fixed inset-0 overflow-y-auto bg-[#efe8dc]">
        <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-5 py-10">
          <div className="mb-6 flex flex-col items-center">
            <Logo size="lg" />
            <p className="wordmark mt-4 text-[#1a1714]">PropDesk</p>
            <p className="brand-tag">Admin</p>
          </div>
          <form
            className="rounded-2xl border border-[#e4dccb] bg-white px-5 py-6 shadow-[0_20px_50px_rgba(26,23,20,0.08)]"
            onSubmit={(e) => {
              e.preventDefault();
              void enter();
            }}
          >
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#1a1714]">Sign in</h1>
            <p className="mt-1 text-sm text-[#6d675e]">Use the admin key. This is not a trader account.</p>
            <label className="mt-5 block text-sm font-semibold text-[#1a1714]" htmlFor="admin-key">
              Admin key
              <span className="relative mt-1.5 block">
                <input id="admin-key" type={show ? "text" : "password"} value={key} onChange={(e) => setKey(e.target.value)} className="h-12 w-full rounded-xl border border-[#e4dccb] bg-[#fbfaf7] px-3 pr-16 text-base text-[#1a1714] outline-none focus:border-[#1a1714]" />
                <button type="button" onClick={() => setShow((v) => !v)} className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-semibold text-[#6d675e]">{show ? "Hide" : "Show"}</button>
              </span>
            </label>
            {note ? <p className="mt-3 rounded-lg bg-[#f8ecea] px-3 py-2 text-sm text-[#9a3f36]">{note}</p> : null}
            <button type="submit" disabled={busy || key.length < 8} className="mt-4 h-12 w-full rounded-xl bg-[#1a1714] text-base font-semibold text-[#f6f1e7] disabled:bg-[#cfc6b8]">{busy ? "Checking…" : "Log in"}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-y-auto overscroll-contain bg-[#efe8dc] text-[#1a1714]">
      <header className="sticky top-0 z-10 border-b border-[#e4dccb] bg-[#fbfaf7]/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <span className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="font-display text-lg font-bold tracking-tight">PropDesk <span className="font-normal text-[#8a847a]">Admin</span></span>
          </span>
          <button type="button" onClick={signOut} className="inline-flex items-center gap-1 text-sm font-semibold text-[#5f5a53]"><Icon d={I.out} /> Log out</button>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 px-3 pb-2">
          {([
            ["firms", "Firms", I.firms],
            ["add", "Add", I.add],
          ] as const).map(([id, label, d]) => (
            <button key={id} type="button" onClick={() => setPanel(id)} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold ${panel === id ? "bg-[#1a1714] text-[#f6f1e7]" : "text-[#5f5a53]"}`}>
              <Icon d={d} /> {label}
            </button>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-5 pb-20">
        {note ? <p className="mb-3 text-sm text-[#5f5a53]">{note}</p> : null}
        {panel === "add" ? (
          <section className="rounded-2xl border border-[#e4dccb] bg-white p-4">
            <h1 className="font-display text-xl font-bold">Add a firm</h1>
            <p className="mt-1 text-sm text-[#6d675e]">The desk reads the official page and fills the sheet. You can edit every field after.</p>
            <label className="mt-4 block text-sm font-semibold">Firm name<input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-[#e4dccb] bg-[#fbfaf7] px-3" /></label>
            <label className="mt-3 block text-sm font-semibold">Official page<input value={portal} onChange={(e) => setPortal(e.target.value)} placeholder="https://" className="mt-1.5 h-11 w-full rounded-xl border border-[#e4dccb] bg-[#fbfaf7] px-3" /></label>
            <button type="button" disabled={busy || !name || !portal.startsWith("https://")} onClick={() => void add()} className="mt-4 h-11 w-full rounded-xl bg-[#1a1714] font-semibold text-[#f6f1e7] disabled:bg-[#cfc6b8]">{busy ? "Filling the sheet…" : "Add firm"}</button>
          </section>
        ) : null}
        {panel === "edit" && edit ? (
          <section className="rounded-2xl border border-[#e4dccb] bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <h1 className="font-display text-xl font-bold">{edit.name}</h1>
              <button type="button" onClick={() => void remove(edit.id)} className="inline-flex items-center gap-1 rounded-lg border border-[#e7c7c3] px-3 py-1.5 text-sm text-[#9a3f36]"><Icon d={I.trash} /> Remove</button>
            </div>
            <div className="mt-4 grid gap-3">
              {FIELDS.map((field) => (
                <label key={field.key} className="block text-sm font-semibold">
                  {field.label}
                  {field.area ? (
                    <textarea value={edit[field.key]} onChange={(e) => setEdit({ ...edit, [field.key]: e.target.value })} rows={3} className="mt-1.5 w-full rounded-xl border border-[#e4dccb] bg-[#fbfaf7] px-3 py-2 font-normal" />
                  ) : (
                    <input value={edit[field.key]} onChange={(e) => setEdit({ ...edit, [field.key]: e.target.value })} className="mt-1.5 h-11 w-full rounded-xl border border-[#e4dccb] bg-[#fbfaf7] px-3 font-normal" />
                  )}
                </label>
              ))}
            </div>
            <button type="button" disabled={busy} onClick={() => void save()} className="mt-4 h-11 w-full rounded-xl bg-[#1a1714] font-semibold text-[#f6f1e7]">{busy ? "Saving…" : "Save changes"}</button>
          </section>
        ) : null}
        {panel === "firms" ? (
          <section className="rounded-2xl border border-[#e4dccb] bg-white">
            <div className="flex items-baseline justify-between border-b border-[#efe8dc] px-4 py-3">
              <h1 className="font-display text-xl font-bold">Firms on the desk</h1>
              <p className="text-sm text-[#6d675e]">{firms.length} listed</p>
            </div>
            <ul>
              {firms.map((f) => (
                <li key={f.id} className="flex items-center justify-between gap-3 border-b border-[#f3eee6] px-4 py-3 last:border-0">
                  <span className="min-w-0">
                    <span className="font-medium">{f.name}</span>
                    <span className="mt-0.5 block truncate text-xs text-[#8a847a]">{f.id} · {f.portal}</span>
                  </span>
                  <span className="flex shrink-0 gap-2">
                    <button type="button" onClick={() => void open(f.id)} className="inline-flex items-center gap-1 rounded-lg border border-[#e4dccb] px-3 py-1.5 text-sm"><Icon d={I.edit} /> Edit</button>
                    <button type="button" onClick={() => void remove(f.id)} className="inline-flex items-center gap-1 rounded-lg border border-[#e7c7c3] px-3 py-1.5 text-sm text-[#9a3f36]"><Icon d={I.trash} /> Remove</button>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
    </div>
  );
}
