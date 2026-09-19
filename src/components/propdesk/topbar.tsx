import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFirm } from "@/lib/propdesk/engine";
import { useDeskStore } from "@/lib/propdesk/store";

export function Topbar({
  comparing = false,
  payouts = false,
}: {
  comparing?: boolean;
  payouts?: boolean;
}) {
  const firmId = useDeskStore((s) => s.firmId);
  const setSidebarOpen = useDeskStore((s) => s.setSidebarOpen);
  const openProfile = useDeskStore((s) => s.openProfile);
  const firm = getFirm(firmId);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-bg px-3 desk:px-4">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Button
          variant="icon"
          size="icon"
          className="shrink-0 desk:hidden"
          aria-label="Open menu"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu />
        </Button>
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ background: "var(--firm)" }}
            aria-hidden
          />
          <span className="truncate font-display text-base font-bold tracking-tight desk:text-lg">
            {payouts ? "Payouts" : comparing ? "Compare" : firm.short}
            <span className="ml-1.5 font-sans font-medium text-dim">24/7</span>
          </span>
        </div>
      </div>
      <Button variant="icon" size="icon" aria-label="Profile" onClick={() => openProfile(false)}>
        <User />
      </Button>
    </header>
  );
}
