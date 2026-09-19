import type { ReactNode } from "react";
import { Banknote, Columns2, Inbox, Plus, Trash2 } from "lucide-react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/propdesk/logo";
import { firmList } from "@/lib/propdesk/engine";
import { useDeskStore } from "@/lib/propdesk/store";
import { cn } from "@/lib/utils";

const fieldLabel = "mb-1.5 block text-sm font-medium normal-case tracking-normal text-muted";

function NavLink({
  to,
  active,
  onNavigate,
  children,
}: {
  to: "/" | "/compare" | "/payouts";
  active: boolean;
  onNavigate?: () => void;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className={cn(
        "flex min-h-12 items-center gap-3 rounded-lg px-3 text-base font-medium",
        active ? "bg-paper text-ink" : "text-muted hover:bg-hover hover:text-fg",
      )}
    >
      {children}
    </Link>
  );
}

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
  const onPayouts = path.startsWith("/payouts");

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-sidebar">
      <div className="flex shrink-0 items-center gap-3 px-4 pt-5 pb-4">
        <Logo />
        <div className="min-w-0">
          <h1 className="brand-name">PropDesk</h1>
          <p className="mt-0.5 text-sm text-muted">24/7 · replies in seconds</p>
        </div>
      </div>

      <div className="shrink-0 px-3 pb-3">
        <Button
          variant="new"
          className="h-12 min-h-12 w-full text-base"
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

      <nav className="mx-3 mb-4 flex shrink-0 flex-col gap-1 rounded-xl border border-line bg-elev p-1.5">
        <NavLink to="/" active={onDesk} onNavigate={onNavigate}>
          <Inbox className="size-5 shrink-0" />
          Desk
        </NavLink>
        <NavLink to="/compare" active={onCompare} onNavigate={onNavigate}>
          <Columns2 className="size-5 shrink-0" />
          Compare
        </NavLink>
        <NavLink to="/payouts" active={onPayouts} onNavigate={onNavigate}>
          <Banknote className="size-5 shrink-0" />
          Payouts
        </NavLink>
      </nav>

      <div className="mx-3 mb-3 shrink-0 rounded-xl border border-line bg-elev p-3.5">
        <p className="mb-3 text-sm font-medium text-fg">This trader</p>
        <div>
          <Label htmlFor={`${idPrefix}-firmSelect`} className={fieldLabel}>
            Firm
          </Label>
          <select
            id={`${idPrefix}-firmSelect`}
            value={firmId}
            onChange={(e) => setFirm(e.target.value)}
            className="h-12 w-full min-w-0 rounded-md border border-line bg-input px-3 text-base text-fg outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/25"
          >
            {firmList().map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3">
          <Label htmlFor={`${idPrefix}-userEmail`} className={fieldLabel}>
            Email
          </Label>
          <Input
            id={`${idPrefix}-userEmail`}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 text-base"
          />
        </div>
        <div className="mt-3">
          <Label htmlFor={`${idPrefix}-accountId`} className={fieldLabel}>
            Account ID
          </Label>
          <Input
            id={`${idPrefix}-accountId`}
            type="text"
            autoComplete="off"
            placeholder="FN-104928"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="h-12 text-base"
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 pb-2">
        <h2 className="shrink-0 px-1 pb-2 text-sm font-medium text-fg">Tickets</h2>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-xl border border-line bg-elev">
          {chats.length === 0 ? (
            <div className="px-3.5 py-3 text-sm text-muted">No tickets yet</div>
          ) : (
            chats.map((c) => (
              <div
                key={c.id}
                className={cn(
                  "group flex items-center gap-1 border-b border-border last:border-b-0",
                  c.id === activeId && "bg-hover",
                )}
              >
                <button
                  type="button"
                  onClick={() => {
                    openChat(c.id);
                    onNavigate?.();
                  }}
                  className={cn(
                    "min-h-12 min-w-0 flex-1 truncate px-3.5 text-left text-base",
                    c.id === activeId ? "text-fg" : "text-muted hover:text-fg",
                  )}
                >
                  {c.title}
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${c.title}`}
                  className="grid size-12 shrink-0 place-items-center text-dim hover:text-fg"
                  onClick={() => deleteChat(c.id)}
                >
                  <Trash2 className="size-4" />
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
          className="flex min-h-12 w-full items-center gap-3 rounded-lg px-2 text-left hover:bg-hover"
        >
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-user-av text-base font-semibold">
            {initial}
          </div>
          <div className="min-w-0">
            <div className="truncate text-base font-medium">{email || "Trader"}</div>
            <small className="block truncate text-sm text-dim">
              {accountId ? `Acct ${accountId}` : "Add email & account ID"}
            </small>
          </div>
        </button>
      </div>
    </div>
  );
}
