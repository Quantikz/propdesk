import { useDeskStore } from "@/lib/propdesk/store";
import { cn } from "@/lib/utils";

export function ModeSwitch({ compact = false }: { compact?: boolean }) {
  const liveAi = useDeskStore((s) => s.liveAi);
  const setLiveAi = useDeskStore((s) => s.setLiveAi);

  return (
    <div
      role="group"
      aria-label="Answer mode"
      className={cn(
        "inline-flex shrink-0 rounded-md border border-line bg-input p-0.5",
        compact ? "h-9" : "h-11",
      )}
    >
      <button
        type="button"
        aria-pressed={!liveAi}
        onClick={() => setLiveAi(false)}
        className={cn(
          "rounded-sm px-2.5 font-medium transition-colors duration-[var(--motion-quick)]",
          compact ? "min-h-8 text-xs" : "min-h-10 px-3 text-sm",
          liveAi ? "text-dim hover:text-fg" : "bg-elev text-fg shadow-[var(--shadow-border)]",
        )}
      >
        FAQ
      </button>
      <button
        type="button"
        aria-pressed={liveAi}
        onClick={() => setLiveAi(true)}
        className={cn(
          "rounded-sm px-2.5 font-medium transition-colors duration-[var(--motion-quick)]",
          compact ? "min-h-8 text-xs" : "min-h-10 px-3 text-sm",
          liveAi ? "bg-fg text-bg" : "text-dim hover:text-fg",
        )}
      >
        Live
      </button>
    </div>
  );
}
