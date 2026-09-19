import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getAiStatus } from "@/lib/propdesk/complete";
import { useDeskStore } from "@/lib/propdesk/store";
import { cn } from "@/lib/utils";

export function AiDialog() {
  const open = useDeskStore((s) => s.aiOpen);
  const liveAi = useDeskStore((s) => s.liveAi);
  const closeAi = useDeskStore((s) => s.closeAi);
  const setLiveAi = useDeskStore((s) => s.setLiveAi);
  const [local, setLocal] = useState(liveAi);
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (!open) return;
    setLocal(liveAi);
    void getAiStatus()
      .then((s) => setAvailable(s.available))
      .catch(() => setAvailable(false));
  }, [open, liveAi]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && closeAi()}>
      <DialogContent>
        <DialogTitle className="pr-10 text-lg font-semibold">Live AI</DialogTitle>
        <DialogDescription className="mt-1 mb-4 text-[13px] leading-relaxed text-muted">
          When this is on, Grok searches the selected firm’s official site for current
          rules, then answers in short form. Escalations with evidence still compile a
          local case. Turn it off for the offline FAQ engine.
        </DialogDescription>
        <div className="glass-soft rounded-xl p-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold">Use live AI</div>
              <p className="mt-0.5 text-[12px] text-dim">
                {available === false
                  ? "Grok is not available in this environment — FAQ engine only."
                  : available
                    ? "Grok 4.5 · searches the firm site on send"
                    : "Checking availability…"}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={local && available !== false}
              disabled={available === false}
              onClick={() => setLocal((v) => !v)}
              className={cn(
                "relative h-7 w-12 shrink-0 rounded-full transition-colors duration-[var(--motion-quick)]",
                local && available !== false ? "bg-accent" : "bg-hover",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 size-6 rounded-full bg-white transition-transform duration-[var(--motion-quick)] ease-[var(--ease-out)]",
                  local && available !== false ? "translate-x-5" : "translate-x-0",
                )}
              />
            </button>
          </div>
        </div>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" className="w-full sm:w-auto" onClick={closeAi}>
            Cancel
          </Button>
          <Button
            className="w-full sm:w-auto"
            onClick={() => setLiveAi(available === false ? false : local)}
          >
            Save AI
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
