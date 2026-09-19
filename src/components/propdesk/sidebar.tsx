import { Columns2, Plus, Trash2 } from "lucide-react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/propdesk/logo";
import { firmList } from "@/lib/propdesk/engine";
import { useDeskStore } from "@/lib/propdesk/store";
import { cn } from "@/lib/utils";

export function Sidebar({
  onNavigate,
  idPrefix = "desk",
}: {
  onNavigate?: () => void;
  idPrefix?: string;
}) {
  const firmId = useDeskStore((s) => s.firmId);
  const email = useDeskStore((s) => s.email);
  const accountId = useDeskStore((s) => s.accountId);
  const chats = useDeskStore((s) => s.chats);
  const activeId = useDeskStore((s) => s.activeId);
  const setFirm = useDeskStore((s) => s.setFirm);
  const setEmail = useDeskStore((s) => s.setEmail);
  const setAccountId = useDeskStore((s) => s.setAccountId);
  const newChat = useDeskStore((s) => s.newChat);
  const openChat = useDeskStore((s) => s.openChat);
  const deleteChat = useDeskStore((s) => s.deleteChat);
  const openProfile = useDeskStore((s) => s.openProfile);

  const initial = (email || "T").trim()[0]?.toUpperCase() || "T";
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const onDesk = path === "/";
  const onCompare = path.startsWith("/compare");

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-sidebar">
      <div className="flex shrink-0 items-center gap-2.5 px-4 pt-4 pb-3">
        <Logo />
        <div className="min-w-0">
          <h1 className="font-display text-base font-semibold tracking-tight">PropDesk</h1>
          <p className="text-xs text-dim">24/7 · replies in seconds</p>
        </div>
      </div>

      <div className="flex shrink-0 gap-2 px-3 pb-3">
        <Button
          variant="new"
          className="min-h-11 flex-1"
          onClick={() => {
            newChat();
            void navigate({ to: "/" });
            onNavigate?.();
          }}
        >
          <Plus />
          New ticket
        </Button>
      </div>

      <nav className="flex shrink-0 flex-col gap-1 px-3 pb-3">
        <Link
          to="/"
          onClick={onNavigate}
          className={cn(
            "flex min-h-11 items-center rounded-md px-3 text-sm font-medium",
            onDesk ? "bg-hover text-fg" : "text-muted hover:text-fg",
          )}
        >
          Desk
        </Link>
        <Link
          to="/compare"
          onClick={onNavigate}
          className={cn(
            "flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-medium",
            onCompare ? "bg-hover text-fg" : "text-muted hover:text-fg",
          )}
        >
          <Columns2 className="size-4" />
          Compare firms
        </Link>
      </nav>

      <div className="shrink-0 px-3 pb-3">
        <Label htmlFor={`${idPrefix}-firmSelect`}>Prop firm</Label>
        <select
          id={`${idPrefix}-firmSelect`}
          value={firmId}
          onChange={(e) => setFirm(e.target.value)}
          className="h-11 w-full min-w-0 rounded-md border border-line bg-input px-3 text-base text-fg outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/25 desk:text-sm"
        >
          {firmList().map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid shrink-0 gap-2 px-3 pb-3">
        <div>
          <Label htmlFor={`${idPrefix}-userEmail`}>Your email (reply-to)</Label>
          <Input
            id={`${idPrefix}-userEmail`}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-accountId`}>Account / login ID</Label>
          <Input
            id={`${idPrefix}-accountId`}
            type="text"
            autoComplete="off"
            placeholder="e.g. FN-104928 or 5120347"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-2 pb-2">
        <h2 className="shrink-0 px-2 py-2 font-sans text-xs font-medium uppercase tracking-[0.08em] text-dim">
          Tickets
        </h2>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {chats.length === 0 ? (
            <div className="px-2.5 py-2 text-sm text-muted">No tickets yet</div>
          ) : (
            chats.map((c) => (
              <div
                key={c.id}
                className={cn(
                  "group flex items-center gap-1 rounded-lg transition-colors duration-[var(--motion-quick)]",
                  c.id === activeId && "bg-hover shadow-[var(--shadow-border)]",
                )}
              >
                <button
                  type="button"
                  onClick={() => {
                    openChat(c.id);
                    onNavigate?.();
                  }}
                  className={cn(
                    "min-h-11 min-w-0 flex-1 truncate px-2.5 text-left text-sm",
                    c.id === activeId ? "text-fg" : "text-muted hover:text-fg",
                  )}
                >
                  {c.title}
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${c.title}`}
                  className="grid size-11 shrink-0 place-items-center text-dim opacity-100 hover:text-fg desk:opacity-0 desk:group-hover:opacity-100"
                  onClick={() => deleteChat(c.id)}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-border p-3">
        <button
          type="button"
          onClick={() => openProfile(false)}
          className="flex min-h-11 w-full items-center gap-2.5 rounded-lg px-2 text-left transition-colors duration-[var(--motion-quick)] hover:bg-hover"
        >
          <div className="grid size-8 shrink-0 place-items-center rounded-full bg-user-av text-sm font-semibold">
            {initial}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{email || "Trader"}</div>
            <small className="block truncate text-xs text-dim">
              {accountId ? `Acct ${accountId}` : "Add email & account ID"}
            </small>
          </div>
        </button>
      </div>
    </div>
  );
}
