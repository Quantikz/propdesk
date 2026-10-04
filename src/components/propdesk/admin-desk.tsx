import { useEffect, useState } from "react";
import { adminAdd, adminFirms, adminRemove, adminSession } from "@/lib/propdesk/admin";

export function AdminDesk() {
  const [key, setKey] = useState("");
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
    return <div className="grid min-h-screen place-items-center bg-[#f4f1ea] text-sm text-[#5f5a53]">Opening the desk…</div>;
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#f4f1ea] text-[#1a1714]">
        <div className="mx-auto grid min-h-screen max-w-5xl items-center gap-10 px-4 py-10 md:grid-cols-2">
          <div className="hidden md:block">
            <p className="font-display text-5xl font-bold tracking-tight">PropDesk</p>
            <p className="mt-4 max-w-sm text-lg leading-relaxed text-[#5f5a53]">
              The firm catalog. Add a book, or take one off the public desk. Not a ranking board.
            </p>
          </div>
          <form
            className="mx-auto w-full max-w-[400px] rounded-xl bg-white px-5 py-6 shadow-[0_12px_40px_rgba(26,23,20,0.08)]"
            onSubmit={(e) => {
              e.preventDefault();
              void enter();
            }}
          >
            <p className="font-display text-center text-3xl font-bold tracking-tight md:hidden">PropDesk</p>
            <h1 className="font-display text-center text-xl font-semibold">Sign in</h1>
            <p className="mt-1 text-center text-sm text-[#5f5a53]">Admin desk only. This key is not a trader login.</p>
            <label className="mt-5 block text-sm font-medium" htmlFor="admin-key">
              Admin key
              <input
                id="admin-key"
                type="password"
                autoComplete="current-password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="mt-1 h-12 w-full rounded-lg border border-[#ddd6c8] px-3 text-base outline-none focus:border-[#1a1714]"
              />
            </label>
            {note ? <p className="mt-3 text-sm text-[#9a3f36]">{note}</p> : null}
            <button type="submit" disabled={busy || key.length < 8} className="mt-4 h-12 w-full rounded-lg bg-[#1a1714] text-base font-semibold text-[#fbfaf7] disabled:opacity-40">
              {busy ? "Checking…" : "Log in"}
            </button>
            <p className="mt-4 text-center text-xs text-[#8a847a]">Session stays in this tab. It is not stored on the public desk.</p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f1ea] text-[#1a1714]">
      <header className="border-b border-[#e6e0d4] bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <p className="font-display text-lg font-bold tracking-tight">PropDesk <span className="font-normal text-[#8a847a]">Admin</span></p>
          <button type="button" onClick={signOut} className="text-sm text-[#5f5a53]">Log out</button>
        </div>
      </header>
      <main className="mx-auto grid max-w-5xl gap-4 px-4 py-6 lg:grid-cols-[320px_1fr]">
        <section className="rounded-xl bg-white p-4 shadow-[0_8px_30px_rgba(26,23,20,0.05)]">
          <h1 className="font-display text-xl font-bold">Add a firm</h1>
          <p className="mt-1 text-sm text-[#5f5a53]">The desk reads the official page and fills the sheet. It will not invent a number.</p>
          <label className="mt-4 block text-sm font-medium">
            Firm name
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-[#ddd6c8] px-3" />
          </label>
          <label className="mt-3 block text-sm font-medium">
            Official page
            <input value={portal} onChange={(e) => setPortal(e.target.value)} placeholder="https://" className="mt-1 h-11 w-full rounded-lg border border-[#ddd6c8] px-3" />
          </label>
          <button type="button" disabled={busy || !name || !portal.startsWith("https://")} onClick={() => void add()} className="mt-4 h-11 w-full rounded-lg bg-[#1a1714] font-semibold text-[#fbfaf7] disabled:opacity-40">
            {busy ? "Filling the sheet…" : "Add firm"}
          </button>
          {note ? <p className="mt-3 text-sm text-[#5f5a53]">{note}</p> : null}
        </section>
        <section className="rounded-xl bg-white shadow-[0_8px_30px_rgba(26,23,20,0.05)]">
          <div className="flex items-baseline justify-between border-b border-[#eee8dc] px-4 py-3">
            <h2 className="font-display text-xl font-bold">Firms on the desk</h2>
            <p className="text-sm text-[#5f5a53]">{firms.length} listed</p>
          </div>
          <ul>
            {firms.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-3 border-b border-[#f1ece3] px-4 py-3 last:border-0">
                <span>
                  <span className="font-medium">{f.name}</span>
                  <span className="mt-0.5 block text-xs text-[#8a847a]">{f.id} · {f.portal}</span>
                </span>
                <button type="button" onClick={() => void remove(f.id)} className="rounded-md border border-[#e7c7c3] px-3 py-1.5 text-sm text-[#9a3f36]">
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
