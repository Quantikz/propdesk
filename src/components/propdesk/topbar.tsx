import { Bot, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFirm } from "@/lib/propdesk/engine";
import { useDeskStore } from "@/lib/propdesk/store";

export function Topbar() {
  const firmId = useDeskStore((s) => s.firmId);
  const liveAi = useDeskStore((s) => s.liveAi);
  const setSidebarOpen = useDeskStore((s) => s.setSidebarOpen);
  const openProfile = useDeskStore((s) => s.openProfile);
  const openAi = useDeskStore((s) => s.openAi);
  const firm = getFirm(firmId);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border/80 bg-bg/30 px-3 backdrop-blur-xl desk:h-[56px] desk:px-4">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Button
          variant="icon"
          size="icon"
          className="shrink-0 glass-soft desk:hidden"
          aria-label="Open menu"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu />
        </Button>
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="size-2.5 shrink-0 rounded-full shadow-[0_0_0_4px_color-mix(in_srgb,var(--firm)_25%,transparent)]"
            style={{ background: "var(--firm)" }}
            aria-hidden
          />
          <span className="truncate font-display text-sm font-semibold desk:text-base">
            {firm.short} specialist
            {liveAi ? <span className="ml-1.5 font-sans font-medium text-dim">· Live</span> : null}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button variant="ghost" size="pill" className="hidden glass-soft sm:inline-flex" onClick={openAi}>
          AI
        </Button>
        <Button
          variant="icon"
          size="icon"
          className="glass-soft sm:hidden"
          aria-label="AI settings"
          onClick={openAi}
        >
          <Bot />
        </Button>
        <Button
          variant="ghost"
          size="pill"
          className="hidden glass-soft sm:inline-flex"
          onClick={() => openProfile(false)}
        >
          Profile
        </Button>
        <Button
          variant="icon"
          size="icon"
          className="glass-soft sm:hidden"
          aria-label="Profile"
          onClick={() => openProfile(false)}
        >
          <User />
        </Button>
      </div>
    </header>
  );
}
