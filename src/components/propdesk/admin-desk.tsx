import { useEffect, useState } from "react";
import { Logo } from "@/components/propdesk/logo";
import { adminAdd, adminFirm, adminFirms, adminRemove, adminSave, adminSession, type FirmEdit } from "@/lib/propdesk/admin";

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const GROUPS: { title: string; fields: { key: keyof FirmEdit; label: string; area?: boolean }[] }[] = [
  {
    title: "Identity",
    fields: [
      { key: "name", label: "Name" },
      { key: "short", label: "Short name" },
      { key: "portal", label: "Official page" },
      { key: "supportEmail", label: "Support email" },
    ],
  },
  {
    title: "Rules",
    fields: [
      { key: "drawdown", label: "Drawdown", area: true },
      { key: "challenge", label: "Challenge", area: true },
      { key: "funded", label: "Funded account", area: true },
      { key: "news", label: "News", area: true },
      { key: "ea", label: "EAs and copy", area: true },
    ],
  },
  {
    title: "Payout",
    fields: [
      { key: "profitSplit", label: "Split" },
      { key: "payoutCycle", label: "Cycle" },
      { key: "kyc", label: "KYC", area: true },
      { key: "consistency", label: "Consistency", area: true },
      { key: "denials", label: "Denial reasons", area: true },
    ],
  },
];

export function AdminDesk() {
  const [key, setKey] = useState("");
  const [show, setShow] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [firms, setFirms] = useState<{ id: string; name: string; portal: string }[]>([]);
  const [adding, setAdding] = useState(false);
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
      setNote("That key does not match.");
      return false;
    }
    setAuthed(true);
    setFirms(rows.firms);
    return true;
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
    setBusy(false);
    if (!out.ok) {
      setNote("That key does not match.");
      return;
    }
    window.sessionStorage.setItem("pd-admin", key);
    setNote("");
    await load(key);
  }

  async function add() {
    setBusy(true);
    setNote("Reading the official page…");
    const out = await adminAdd({ data: { key, name, portal } });
    setBusy(false);
    if (!out.ok) {
      setNote(out.error === "key" ? "Key rejected." : out.error);
      return;
    }
    setName("");
    setPortal("");
    setAdding(false);
    setNote("Added. Open it to correct the sheet.");
    await load();
  }

  async function open(id: string) {
    setBusy(true);
    const out = await adminFirm({ data: { key, id } });
    setBusy(false);
    if (!out.ok) {
      setNote("Could not open that firm.");
      return;
    }
    setNote("");
    setEdit(out.firm);
  }

  async function save() {
    if (!edit) return;
    setBusy(true);
    const out = await adminSave({ data: { key, firm: edit } });
    setBusy(false);
    if (!out.ok) {
      setNote("Could not save.");
      return;
    }
    setNote("Saved.");
    await load();
  }

  async function remove(id: string) {
    if (!window.confirm(`Remove ${id}?`)) return;
    const out = await adminRemove({ data: { key, id } });
    if (!out.ok) {
      setNote("Could not remove that firm.");
      return;
    }
    if (edit?.id === id) setEdit(null);
    setNote("Removed.");
    await load();
  }

  function signOut() {
    window.sessionStorage.removeItem("pd-admin");
    setAuthed(false);
    setKey("");
    setFirms([]);
    setEdit(null);
  }

  if (booting) return <div className="fixed inset-0 grid place-items-center bg-[#f3eee6] text-sm text-[#6d675e]">Opening…</div>;

  if (!authed) {
    return (
      <div className="fixed inset-0 overflow-y-auto bg-[#efe8dc]">
        <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-5 py-10">
          <div className="mb-6 flex flex-col items-center">
            <Logo size="lg" />
            <p className="wordmark mt-4 text-[#1a1714]">PropDesk</p>
            <p className="brand-tag">Admin</p>
          </div>
          <form className="rounded-2xl border border-[#e4dccb] bg-white px-5 py-6" onSubmit={(e) => { e.preventDefault(); void enter(); }}>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#1a1714]">Sign in</h1>
            <label className="mt-5 block text-sm font-semibold text-[#1a1714]" htmlFor="admin-key">
              Admin key
              <span className="relative mt-1.5 block">
                <input id="admin-key" type={show ? "text" : "password"} value={key} onChange={(e) => setKey(e.target.value)} className="h-12 w-full rounded-xl border border-[#e4dccb] bg-[#fbfaf7] px-3 pr-16 text-base outline-none focus:border-[#1a1714]" />
                <button type="button" onClick={() => setShow((v) => !v)} className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-semibold text-[#6d675e]">{show ? "Hide" : "Show"}</button>
              </span>
            </label>
            {note ? <p className="mt-3 text-sm text-[#9a3f36]">{note}</p> : null}
            <button type="submit" disabled={busy || key.length < 8} className="mt-4 h-12 w-full rounded-xl bg-[#1a1714] font-semibold text-[#f6f1e7] disabled:bg-[#cfc6b8]">{busy ? "Checking…" : "Log in"}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-y-auto overscroll-contain bg-[#efe8dc] text-[#1a1714]">
      <header className="sticky top-0 z-10 border-b border-[#e4dccb] bg-[#fbfaf7]">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <span className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="font-display font-bold">PropDesk</span>
          </span>
          <button type="button" onClick={signOut} className="text-sm font-semibold text-[#5f5a53]">Log out</button>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-5 pb-16">
        {edit ? (
          <section className="rounded-2xl border border-[#e4dccb] bg-white p-4">
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => setEdit(null)} className="text-sm font-semibold text-[#5f5a53]">Back</button>
              <button type="button" onClick={() => void remove(edit.id)} className="inline-flex items-center gap-1 text-sm text-[#9a3f36]"><Icon d="M5 7h14M9 7V5h6v2M8 7l1 12h6l1-12" /> Remove</button>
            </div>
            <h1 className="font-display mt-2 text-2xl font-bold">{edit.name}</h1>
            {GROUPS.map((group) => (
              <div key={group.title} className="mt-5">
                <p className="font-display text-[11px] tracking-[0.14em] text-[#8a847a] uppercase">{group.title}</p>
                <div className="mt-2 grid gap-3">
                  {group.fields.map((field) => (
                    <label key={field.key} className="block text-sm font-semibold">
                      {field.label}
                      {field.area ? (
                        <textarea value={edit[field.key]} onChange={(e) => setEdit({ ...edit, [field.key]: e.target.value })} rows={3} className="mt-1 w-full rounded-xl border border-[#e4dccb] bg-[#fbfaf7] px-3 py-2 font-normal" />
                      ) : (
                        <input value={edit[field.key]} onChange={(e) => setEdit({ ...edit, [field.key]: e.target.value })} className="mt-1 h-11 w-full rounded-xl border border-[#e4dccb] bg-[#fbfaf7] px-3 font-normal" />
                      )}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button type="button" disabled={busy} onClick={() => void save()} className="mt-5 h-11 w-full rounded-xl bg-[#1a1714] font-semibold text-[#f6f1e7]">{busy ? "Saving…" : "Save"}</button>
            {note ? <p className="mt-3 text-sm text-[#5f5a53]">{note}</p> : null}
          </section>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between">
              <h1 className="font-display text-2xl font-bold">Firms <span className="text-base font-normal text-[#8a847a]">{firms.length}</span></h1>
              <button type="button" onClick={() => setAdding((v) => !v)} className="inline-flex items-center gap-1 rounded-lg bg-[#1a1714] px-3 py-2 text-sm font-semibold text-[#f6f1e7]">
                <Icon d="M12 5v14M5 12h14" /> Add
              </button>
            </div>
            {adding ? (
              <div className="mb-3 rounded-2xl border border-[#e4dccb] bg-white p-4">
                <label className="block text-sm font-semibold">Name<input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-[#e4dccb] px-3 font-normal" /></label>
                <label className="mt-3 block text-sm font-semibold">Official page<input value={portal} onChange={(e) => setPortal(e.target.value)} placeholder="https://" className="mt-1 h-11 w-full rounded-xl border border-[#e4dccb] px-3 font-normal" /></label>
                <button type="button" disabled={busy || !name || !portal.startsWith("https://")} onClick={() => void add()} className="mt-3 h-11 w-full rounded-xl bg-[#1a1714] font-semibold text-[#f6f1e7] disabled:bg-[#cfc6b8]">{busy ? "Reading…" : "Add and fill"}</button>
              </div>
            ) : null}
            {note ? <p className="mb-3 text-sm text-[#5f5a53]">{note}</p> : null}
            <ul className="overflow-hidden rounded-2xl border border-[#e4dccb] bg-white">
              {firms.map((f) => (
                <li key={f.id} className="flex items-center justify-between gap-3 border-b border-[#f3eee6] px-4 py-3 last:border-0">
                  <button type="button" onClick={() => void open(f.id)} className="min-w-0 text-left">
                    <span className="font-medium">{f.name}</span>
                    <span className="mt-0.5 block truncate text-xs text-[#8a847a]">{f.portal}</span>
                  </button>
                  <button type="button" onClick={() => void open(f.id)} className="shrink-0 text-sm font-semibold">Edit</button>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}
