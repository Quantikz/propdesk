import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModeSwitch } from "@/components/propdesk/mode-switch";
import { getAiStatus } from "@/lib/propdesk/complete";
import { useDeskStore } from "@/lib/propdesk/store";

export function AiDialog() {
  const open = useDeskStore((s) => s.aiOpen);
  const liveAi = useDeskStore((s) => s.liveAi);
  const clientKey = useDeskStore((s) => s.clientKey);
  const closeAi = useDeskStore((s) => s.closeAi);
  const setClientKey = useDeskStore((s) => s.setClientKey);
  const [hosted, setHosted] = useState<boolean | null>(null);
  const [draftKey, setDraftKey] = useState(clientKey);

  useEffect(() => {
    if (!open) return;
    setDraftKey(clientKey);
    void getAiStatus()
      .then((s) => setHosted(Boolean(s.hosted)))
      .catch(() => setHosted(false));
  }, [open, clientKey]);

  const liveReady = hosted === true || draftKey.startsWith("xai-");

  return (
    <Dialog open={open} onOpenChange={(v) => !v && closeAi()}>
      <DialogContent>
        <DialogTitle className="pr-10 text-lg font-semibold">Answer mode</DialogTitle>
        <DialogDescription className="mt-1 mb-4 text-[13px] leading-relaxed text-muted">
          Live searches the firm’s official site, then answers in short form. FAQ uses
          the built-in snapshot. Escalations always compile a local case.
        </DialogDescription>

        <div className="flex items-center justify-between gap-3 rounded-md border border-line bg-input px-3 py-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold">{liveAi ? "Live search" : "FAQ snapshot"}</div>
            <p className="mt-0.5 text-xs text-dim">
              {liveAi
                ? liveReady
                  ? "Grok will open the firm’s current FAQ before answering."
                  : "On this device Live needs an xAI key."
                : "Offline rules. No web search."}
            </p>
          </div>
          <ModeSwitch compact />
        </div>

        {hosted === false ? (
          <div className="mt-4 grid gap-1.5">
            <Label htmlFor="xai-key">xAI key (this device only)</Label>
            <Input
              id="xai-key"
              type="password"
              autoComplete="off"
              spellCheck={false}
              placeholder="xai-…"
              value={draftKey}
              onChange={(e) => setDraftKey(e.target.value.trim())}
            />
            <p className="text-xs text-dim">
              Stored in this browser. Not sent anywhere except xAI when you ask a question.
            </p>
          </div>
        ) : null}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" className="w-full sm:w-auto" onClick={closeAi}>
            Close
          </Button>
          {hosted === false ? (
            <Button
              className="w-full sm:w-auto"
              onClick={() => {
                setClientKey(draftKey);
                closeAi();
              }}
            >
              Save key
            </Button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
