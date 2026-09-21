import { type ReactNode } from "react";
import { Banknote, Columns2, House, Inbox, Plus, Trash2 } from "lucide-react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Logo } from "@/components/propdesk/logo";
import { firmList } from "@/lib/propdesk/engine";
import { useDeskStore } from "@/lib/propdesk/store";
import { cn } from "@/lib/utils";

function NavLink({
  to,
  active,
  onNavigate,
  children,
}: {
  to: "/" | "/desk" | "/compare" | "/payouts";
  active: boolean;
  onNavigate?: () => void;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className={cn(
        "flex min-h-10 items-center gap-3 rounded-md px-3 font-display text-[15px] font-semibold tracking-tight",
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
  const chats = useDeskStore((s) => s.chats);
  const activeId = useDeskStore((s) => s.activeId);
  const newChat = useDeskStore((s) => s.newChat);
  const openChat = useDeskStore((s) => s.openChat);
  const deleteChat = useDeskStore((s) => s.deleteChat);
  const firmId = useDeskStore((s) => s.firmId);
  const setFirm = useDeskStore((s) => s.setFirm);
  const firms = firmList();

  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const onHome = path === "/";
  const onDesk = path === "/desk" || path.startsWith("/desk/");
  const onCompare = path.startsWith("/compare");
  const onPayouts = path.startsWith("/payouts");

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-sidebar">
      <Link to="/" onClick={onNavigate} className="flex shrink-0 items-center gap-3 px-4 pt-4 pb-3 text-fg">
        <Logo />
        <div className="min-w-0">
          <h1 className="brand-name">PropDesk</h1>
          <p className="mt-0.5 font-display text-sm text-muted">Rules before you buy</p>
        </div>
      </Link>

      <nav className="flex shrink-0 flex-col gap-0.5 px-2" aria-label={idPrefix}>
        <button
          type="button"
          className="flex min-h-10 items-center gap-3 rounded-md px-3 font-display text-[15px] font-semibold tracking-tight text-muted hover:bg-hover hover:text-fg"
          onClick={() => {
            newChat();
            void navigate({ to: "/desk" });
            onNavigate?.();
          }}
        >
          <Plus className="size-5 shrink-0" />
          New ask
        </button>
        <NavLink to="/" active={onHome} onNavigate={onNavigate}>
          <House className="size-5 shrink-0" />
          Home
        </NavLink>
        <NavLink to="/desk" active={onDesk} onNavigate={onNavigate}>
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

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pt-4 pb-4">
        <p className="px-3 pb-1 font-display text-[11px] tracking-[0.14em] text-dim uppercase">Firms</p>
        {firms.map((f) => (
          <button
            key={f.id}
            type="button"
            className={cn(
              "flex min-h-10 w-full items-center gap-2 rounded-md px-3 text-left font-display text-[15px]",
              f.id === firmId ? "bg-hover text-fg" : "text-muted hover:bg-hover hover:text-fg",
            )}
            onClick={() => {
              setFirm(f.id);
              void navigate({ to: "/desk" });
              onNavigate?.();
            }}
          >
            <span className="size-2 shrink-0 rounded-full" style={{ background: f.color }} />
            <span className="truncate">{f.short}</span>
          </button>
        ))}

        {chats.length > 0 ? (
          <>
            <p className="mt-4 px-3 pb-1 font-display text-[11px] tracking-[0.14em] text-dim uppercase">Asks</p>
            {chats.map((c) => (
              <div
                key={c.id}
                className={cn("group flex items-center gap-1 rounded-md", c.id === activeId && "bg-hover")}
              >
                <button
                  type="button"
                  onClick={() => {
                    openChat(c.id);
                    void navigate({ to: "/desk" });
                    onNavigate?.();
                  }}
                  className={cn(
                    "min-h-10 min-w-0 flex-1 truncate px-3 text-left font-display text-sm",
                    c.id === activeId ? "text-fg" : "text-muted hover:text-fg",
                  )}
                >
                  {c.title}
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${c.title}`}
                  className="grid size-10 shrink-0 place-items-center text-dim hover:text-fg"
                  onClick={() => deleteChat(c.id)}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </>
        ) : null}
      </div>
    </div>
  );
}
