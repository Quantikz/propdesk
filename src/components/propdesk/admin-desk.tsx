import { useEffect, useState } from "react";
import { adminAdd, adminFirms, adminRemove, adminSession } from "@/lib/propdesk/admin";

export function AdminDesk() {
  const [key, setKey] = useState("");
  const [show, setShow] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [firms, setFirms] = useState<{ id: string; name: string; portal: string }[]>([]);
  const [name, setName] = useState("");
  const [portal, setPortal] = useState("");
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
    setNote(`${out.id} is on the desk. Refresh the public site to see it.`);
    await load();
  }

  async function remove(id: string) {
    if (!window.confirm(`Remove ${id} from the public desk?`)) return;
    const out = await adminRemove({ data: { key, id } });
    if (!out.ok) {
      setNote("Could not remove that firm.");
      return;
    }
    await load();
  }

  function signOut() {
    window.sessionStorage.removeItem("pd-admin");
    setAuthed(false);
    setKey("");
    setFirms([]);
  }

  if (booting) {
    return <div className="fixed inset-0 grid place-items-center bg-[#f3eee6] text-sm text-[#6d675e]">Opening the desk…</div>;
  }

  if (!authed) {
    return (
      <div className="fixed inset-0 overflow-y-auto bg-[#efe8dc]">
        <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-5 py-10">
          <div className="mb-6 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#1a1714] font-display text-xl font-bold text-[#f6f1e7]">P</span>
            <p className="font-display mt-4 text-4xl font-bold tracking-tight text-[#1a1714]">PropDesk</p>
            <p className="mt-1 text-sm text-[#6d675e]">Admin</p>
          </div>
          <form
            className="rounded-2xl border border-[#e4dccb] bg-white px-5 py-6 shadow-[0_20px_50px_rgba(26,23,20,0.08)]"
            onSubmit={(e) => {
              e.preventDefault();
              void enter();
            }}
          >
            <h1 className="font-display text-2xl font-bold tracking-tight">Sign in</h1>
            <p className="mt-1 text-sm leading-relaxed text-[#6d675e]">Use the admin key. This is not a trader account.</p>
            <label className="mt-5 block text-sm font-semibold" htmlFor="admin-key">
              Admin key
              <span className="relative mt-1.5 block">
                <input
                  id="admin-key"
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="h-12 w-full rounded-xl border border-[#e4dccb] bg-[#fbfaf7] px-3 pr-16 text-base outline-none focus:border-[#1a1714]"
                />
                <button type="button" onClick={() => setShow((v) => !v)} className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-semibold text-[#6d675e]">
                  {show ? "Hide" : "Show"}
                </button>
              </span>
            </label>
            {note ? <p className="mt-3 rounded-lg bg-[#f8ecea] px-3 py-2 text-sm text-[#9a3f36]">{note}</p> : null}
            <button type="submit" disabled={busy || key.length < 8} className="mt-4 h-12 w-full rounded-xl bg-[#1a1714] text-base font-semibold text-[#f6f1e7] disabled:bg-[#cfc6b8]">
              {busy ? "Checking…" : "Log in"}
            </button>
          </form>
          <p className="mt-4 text-center text-xs leading-relaxed text-[#8a847a]">The key stays in this tab. It is not saved on the public desk.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-y-auto overscroll-contain bg-[#efe8dc] text-[#1a1714]">
      <header className="sticky top-0 z-10 border-b border-[#e4dccb] bg-[#fbfaf7]/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <p className="font-display text-lg font-bold tracking-tight">PropDesk <span className="font-normal text-[#8a847a]">Admin</span></p>
          <button type="button" onClick={signOut} className="text-sm font-semibold text-[#5f5a53]">Log out</button>
        </div>
      </header>
      <main className="mx-auto grid max-w-5xl gap-4 px-4 py-5 pb-16 lg:grid-cols-[320px_1fr]">
        <section className="rounded-2xl border border-[#e4dccb] bg-white p-4">
          <h1 className="font-display text-xl font-bold">Add a firm</h1>
          <p className="mt-1 text-sm leading-relaxed text-[#6d675e]">The desk reads the official page and fills the sheet. It will not invent a number.</p>
          <label className="mt-4 block text-sm font-semibold">
            Firm name
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-[#e4dccb] bg-[#fbfaf7] px-3" />
          </label>
          <label className="mt-3 block text-sm font-semibold">
            Official page
            <input value={portal} onChange={(e) => setPortal(e.target.value)} placeholder="https://" className="mt-1.5 h-11 w-full rounded-xl border border-[#e4dccb] bg-[#fbfaf7] px-3" />
          </label>
          <button type="button" disabled={busy || !name || !portal.startsWith("https://")} onClick={() => void add()} className="mt-4 h-11 w-full rounded-xl bg-[#1a1714] font-semibold text-[#f6f1e7] disabled:bg-[#cfc6b8]">
            {busy ? "Filling the sheet…" : "Add firm"}
          </button>
          {note ? <p className="mt-3 text-sm text-[#5f5a53]">{note}</p> : null}
        </section>
        <section className="rounded-2xl border border-[#e4dccb] bg-white">
          <div className="flex items-baseline justify-between border-b border-[#efe8dc] px-4 py-3">
            <h2 className="font-display text-xl font-bold">Firms on the desk</h2>
            <p className="text-sm text-[#6d675e]">{firms.length} listed</p>
          </div>
          <ul>
            {firms.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-3 border-b border-[#f3eee6] px-4 py-3 last:border-0">
                <span className="min-w-0">
                  <span className="font-medium">{f.name}</span>
                  <span className="mt-0.5 block truncate text-xs text-[#8a847a]">{f.id} · {f.portal}</span>
                </span>
                <button type="button" onClick={() => void remove(f.id)} className="shrink-0 rounded-lg border border-[#e7c7c3] px-3 py-1.5 text-sm text-[#9a3f36]">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
