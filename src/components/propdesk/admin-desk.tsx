import { useEffect, useState } from "react";
import { adminAdd, adminFirms, adminRemove, adminSession } from "@/lib/propdesk/admin.server";

export function AdminDesk() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [firms, setFirms] = useState<{ id: string; name: string; portal: string }[]>([]);
  const [name, setName] = useState("");
  const [portal, setPortal] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function load(next = key) {
    const rows = await adminFirms({ data: { key: next } });
    if (!rows.ok) {
      setAuthed(false);
      setNote("That key does not match ADMIN_KEY.");
      return;
    }
    setAuthed(true);
    setFirms(rows.firms);
  }

  useEffect(() => {
    const saved = window.sessionStorage.getItem("pd-admin");
    if (!saved) return;
    setKey(saved);
    void load(saved);
  }, []);

  async function enter() {
    const out = await adminSession({ data: { key } });
    if (!out.ok) {
      setNote("Set ADMIN_KEY on Vercel, then use that key here.");
      return;
    }
    window.sessionStorage.setItem("pd-admin", key);
    await load(key);
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
    setNote(`Added ${out.id}. Refresh the public desk to see it.`);
    await load();
  }

  async function remove(id: string) {
    if (!window.confirm(`Remove ${id} from the desk?`)) return;
    const out = await adminRemove({ data: { key, id } });
    if (!out.ok) {
      setNote("Could not remove that firm.");
      return;
    }
    await load();
  }

  return (
    <div className="min-h-screen bg-[#14110e] text-[#f1ece3]">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="font-display text-[11px] tracking-[0.16em] text-[#8a847a] uppercase">PropDesk admin</p>
        <h1 className="font-display mt-2 text-4xl font-bold tracking-tight">Firm desk</h1>
        <p className="mt-2 max-w-xl text-sm text-[#a39b8e]">
          Add a firm and the desk reads the official page, then fills the sheet. Remove hides it from the public catalog. This is not a ranking board.
        </p>
        {authed ? (
          <>
            <div className="mt-6 grid gap-2 rounded-xl border border-white/10 bg-white/5 p-4">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Firm name" className="rounded-md border border-white/10 bg-black/20 px-3 py-2" />
              <input value={portal} onChange={(e) => setPortal(e.target.value)} placeholder="https://official-site" className="rounded-md border border-white/10 bg-black/20 px-3 py-2" />
              <button type="button" disabled={busy} onClick={() => void add()} className="h-10 rounded-md bg-[#efe6d4] font-display font-semibold text-[#161310] disabled:opacity-50">
                {busy ? "Filling the sheet…" : "Add firm"}
              </button>
            </div>
            <ul className="mt-6 divide-y divide-white/10">
              {firms.map((f) => (
                <li key={f.id} className="flex items-center justify-between gap-3 py-3">
                  <span>
                    <span className="font-medium">{f.name}</span>
                    <span className="mt-0.5 block text-xs text-[#8a847a]">{f.id} · {f.portal}</span>
                  </span>
                  <button type="button" onClick={() => void remove(f.id)} className="text-sm text-[#c47a72]">Remove</button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="mt-6 grid max-w-sm gap-2">
            <input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="Admin key" className="rounded-md border border-white/10 bg-black/20 px-3 py-2" />
            <button type="button" onClick={() => void enter()} className="h-10 rounded-md bg-[#efe6d4] font-display font-semibold text-[#161310]">Open desk</button>
          </div>
        )}
        {note ? <p className="mt-4 text-sm text-[#a39b8e]">{note}</p> : null}
      </div>
    </div>
  );
}
