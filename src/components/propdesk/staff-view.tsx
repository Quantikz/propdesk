import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { useDeskStore } from "@/lib/propdesk/store";
import { useStaffStore, staffChannelMeta } from "@/lib/propdesk/staff-store";
import { canOpenChannel, channelsFor, roleLabel, type StaffRole } from "@/lib/propdesk/staff";
import { cn } from "@/lib/utils";

function Gate() {
  const emailHint = useDeskStore((s) => s.email);
  const signIn = useStaffStore((s) => s.signIn);
  const loading = useStaffStore((s) => s.loading);
  const error = useStaffStore((s) => s.error);
  const [email, setEmail] = useState(emailHint);
  const [invite, setInvite] = useState("");

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
      <p className="font-display text-[12px] tracking-[0.14em] text-dim uppercase">Staff zone</p>
      <h2 className="page-title mt-2">Staff, support, and mods only.</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Traders never see these rooms. Sign in with a roster email. If an invite code is set on the server, enter it too.
      </p>
      <form
        className="mt-6 grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          void signIn(email, invite);
        }}
      >
        <label className="grid gap-1 text-sm">
          <span className="font-display text-[12px] tracking-[0.12em] text-dim uppercase">Work email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-lg border border-line bg-elev px-3.5 text-[15px] text-fg outline-none focus:border-fg"
            placeholder="you@desk"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-display text-[12px] tracking-[0.12em] text-dim uppercase">Invite code</span>
          <input
            type="password"
            value={invite}
            onChange={(e) => setInvite(e.target.value)}
            className="h-12 rounded-lg border border-line bg-elev px-3.5 text-[15px] text-fg outline-none focus:border-fg"
            placeholder="Only if your admin set one"
          />
        </label>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 items-center justify-center rounded-lg bg-paper px-4 font-display text-[15px] font-semibold text-ink disabled:opacity-50"
        >
          {loading ? "Checking…" : "Enter staff zone"}
        </button>
      </form>
    </div>
  );
}

function Roster() {
  const session = useStaffStore((s) => s.session);
  const roster = useStaffStore((s) => s.roster);
  const loadRoster = useStaffStore((s) => s.loadRoster);
  const addMember = useStaffStore((s) => s.addMember);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<StaffRole>("support");

  useEffect(() => {
    void loadRoster();
  }, [loadRoster]);

  if (session?.role !== "admin") return null;

  return (
    <div className="mt-8 border-t border-line pt-5">
      <h3 className="font-display text-[12px] tracking-[0.14em] text-dim uppercase">Roster</h3>
      <ul className="mt-2 grid gap-1">
        {roster.map((m) => (
          <li key={m.email} className="flex items-center justify-between gap-3 rounded-md px-1 py-1.5 text-sm">
            <span className="truncate text-fg">
              {m.name || m.email} <span className="text-dim">· {m.email}</span>
            </span>
            <span className="shrink-0 text-dim">{roleLabel(m.role)}</span>
          </li>
        ))}
      </ul>
      <form
        className="mt-3 grid gap-2 sm:grid-cols-[1fr_7rem_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          void addMember(email, role, name).then((ok) => {
            if (ok) {
              setEmail("");
              setName("");
            }
          });
        }}
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="new@desk"
          className="h-10 rounded-md border border-line bg-elev px-3 text-sm outline-none focus:border-fg"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as StaffRole)}
          className="h-10 rounded-md border border-line bg-elev px-2 text-sm outline-none focus:border-fg"
        >
          <option value="admin">Admin</option>
          <option value="support">Support</option>
          <option value="mod">Mod</option>
        </select>
        <button type="submit" className="h-10 rounded-md bg-paper px-3 font-display text-sm font-semibold text-ink">
          Add
        </button>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name (optional)"
          className="h-10 rounded-md border border-line bg-elev px-3 text-sm outline-none focus:border-fg sm:col-span-3"
        />
      </form>
    </div>
  );
}

export function StaffView() {
  const session = useStaffStore((s) => s.session);
  const channel = useStaffStore((s) => s.channel);
  const setChannel = useStaffStore((s) => s.setChannel);
  const messages = useStaffStore((s) => s.messages);
  const send = useStaffStore((s) => s.send);
  const load = useStaffStore((s) => s.load);
  const sending = useStaffStore((s) => s.sending);
  const signOut = useStaffStore((s) => s.signOut);
  const [draft, setDraft] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (session) void load();
  }, [session, channel, load]);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, sending]);

  if (!session) return <Gate />;

  const rooms = channelsFor(session.role);
  const meta = staffChannelMeta(channel);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-4 py-3 desk:px-6">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-display text-[12px] tracking-[0.14em] text-dim uppercase">
            <Shield className="size-3.5" />
            Staff · {roleLabel(session.role)}
          </p>
          <h2 className="mt-0.5 truncate font-display text-lg font-semibold">{meta.label}</h2>
        </div>
        <button type="button" onClick={signOut} className="text-sm text-muted hover:text-fg">
          Sign out
        </button>
      </div>

      <div className="flex shrink-0 gap-1.5 px-4 pt-3 desk:px-6">
        {rooms.map((id) => {
          const on = channel === id && path.startsWith("/staff");
          return (
            <button
              key={id}
              type="button"
              onClick={() => setChannel(id)}
              className={cn(
                "rounded-full px-3.5 py-1.5 font-display text-sm font-semibold",
                on ? "bg-paper text-ink" : "text-muted hover:bg-hover hover:text-fg",
              )}
            >
              {staffChannelMeta(id).label}
            </button>
          );
        })}
      </div>

      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto px-4 py-4 desk:px-6">
        <p className="mb-4 text-sm text-muted">{meta.blurb}</p>
        {messages.length === 0 ? (
          <p className="text-sm text-dim">No staff notes in this room yet.</p>
        ) : (
          <ol className="grid gap-3">
            {messages.map((m) => (
              <li key={m.id} className="rounded-xl border border-line bg-elev px-3.5 py-2.5">
                <p className="text-[12px] text-dim">
                  {m.author} · {roleLabel(m.role)}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed text-fg">{m.body}</p>
              </li>
            ))}
          </ol>
        )}
        {session.role === "admin" && channel === rooms[0] ? <Roster /> : null}
      </div>

      <form
        className="shrink-0 border-t border-line px-4 py-3 desk:px-6"
        onSubmit={(e) => {
          e.preventDefault();
          const text = draft.trim();
          if (!text) return;
          setDraft("");
          void send(text);
        }}
      >
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Write in ${meta.label.toLowerCase()}…`}
            className="h-12 min-w-0 flex-1 rounded-lg border border-line bg-elev px-3.5 text-[15px] outline-none focus:border-fg"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim() || !canOpenChannel(session.role, channel)}
            className="h-12 rounded-lg bg-paper px-4 font-display text-sm font-semibold text-ink disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
