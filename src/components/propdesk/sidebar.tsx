import { useState, type ReactNode } from "react";
import { Banknote, ChevronDown, Columns2, House, Inbox, Plus, Trash2 } from "lucide-react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { FirmLogo } from "@/components/propdesk/firm-logo";
import { BrandLockup } from "@/components/propdesk/logo";
import { firmList } from "@/lib/propdesk/engine";
import { useDeskStore } from "@/lib/propdesk/store";
import { cn } from "@/lib/utils";

function NavLink({
  to,
  active,
  onNavigate,
  children,
}: {
  to: "/" | "/desk" | "/ask" | "/compare" | "/payouts" | "/rules" | "/firms";
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

function FirmPicker({ idPrefix, onNavigate }: { idPrefix: string; onNavigate?: () => void }) {
  const firmId = useDeskStore((s) => s.firmId);
  const setFirm = useDeskStore((s) => s.setFirm);
  const [open, setOpen] = useState(false);
  const firms = firmList();
  const current = firms.find((f) => f.id === firmId) ?? firms[0];
  const listId = `${idPrefix}-firms`;
  const navigate = useNavigate();

  return (
    <div className="shrink-0 px-2 pt-3">
      <p className="px-3 pb-1 font-display text-[11px] tracking-[0.14em] text-dim uppercase">Firm</p>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        className="flex h-11 w-full items-center justify-between gap-2 rounded-md bg-hover/60 px-3 text-left font-display text-[15px] font-semibold tracking-tight text-fg"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="flex min-w-0 items-center gap-2">
          <FirmLogo firm={current} size={18} />
          <span className="truncate">{current.short}</span>
        </span>
        <ChevronDown className={cn("size-4 shrink-0 text-dim", open && "rotate-180")} />
      </button>
      {open ? (
        <ul
          id={listId}
          className="mt-1 max-h-[min(40vh,16rem)] overflow-y-auto overscroll-contain rounded-md bg-hover/40 py-1"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {firms.map((f) => (
            <li key={f.id}>
              <button
                type="button"
                className={cn(
                  "flex min-h-10 w-full items-center gap-2 rounded-md px-3 text-left font-display text-[15px]",
                  f.id === firmId ? "text-fg" : "text-muted hover:bg-hover hover:text-fg",
                )}
                onClick={() => {
                  setFirm(f.id);
                  setOpen(false);
                  void navigate({ to: "/firm/$firmId", params: { firmId: f.id } });
                  onNavigate?.();
                }}
              >
                <FirmLogo firm={f} size={16} />
                <span className="truncate">{f.name}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
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
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const onHome = path === "/";
  const onDesk = path === "/desk" || path.startsWith("/desk/") || path.startsWith("/ask");
  const onRules = path.startsWith("/rules");
  const onCompare = path.startsWith("/compare");
  const onPayouts = path.startsWith("/payouts");

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-sidebar">
      <Link to="/" onClick={onNavigate} className="flex shrink-0 px-4 pt-4 pb-3 text-fg">
        <BrandLockup size="sm" />
      </Link>

      <nav className="flex shrink-0 flex-col gap-0.5 px-2">
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
          New chat
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
        <NavLink to="/rules" active={onRules} onNavigate={onNavigate}>
          <Inbox className="size-5 shrink-0" />
          Rules
        </NavLink>
        <NavLink to="/payouts" active={onPayouts} onNavigate={onNavigate}>
          <Banknote className="size-5 shrink-0" />
          Payouts
        </NavLink>
      </nav>

      <FirmPicker idPrefix={idPrefix} onNavigate={onNavigate} />

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pt-4 pb-3">
        <h2 className="px-3 pb-1 font-display text-[11px] tracking-[0.14em] text-dim uppercase">Chats</h2>
        {chats.length === 0 ? (
          <p className="px-3 py-2 text-sm text-dim">Your questions land here.</p>
        ) : (
          chats.map((c) => (
            <div key={c.id} className={cn("group flex items-center gap-1 rounded-md", c.id === activeId && "bg-hover")}>
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
          ))
        )}
      </div>
    </div>
  );
}
