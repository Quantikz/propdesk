import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeskStore } from "@/lib/propdesk/store";

export function Composer({ surface = "desk" }: { surface?: "desk" | "compare" }) {
  const sendingDesk = useDeskStore((s) => s.sending);
  const sendingCompare = useDeskStore((s) => s.compareSending);
  const sendDesk = useDeskStore((s) => s.send);
  const sendCompare = useDeskStore((s) => s.sendCompare);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [draft, setDraft] = useState("");
  const sending = surface === "compare" ? sendingCompare : sendingDesk;

  function grow() {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }

  useEffect(() => {
    grow();
  }, []);

  async function submit() {
    const value = taRef.current?.value ?? "";
    if (!value.trim() || sending) return;
    setDraft("");
    if (taRef.current) {
      taRef.current.value = "";
      grow();
    }
    if (surface === "compare") await sendCompare(value);
    else await sendDesk(value);
    taRef.current?.focus();
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void submit();
    }
  }

  const canSend = !sending && draft.trim().length > 0;

  return (
    <div className="shrink-0 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1 desk:px-4 desk:pb-5">
      <div className="mx-auto w-full max-w-[780px] rounded-md border border-line bg-input px-2 py-1.5 desk:px-3 desk:py-2">
        <div className="flex items-end gap-1">
          <textarea
            ref={taRef}
            rows={1}
            onInput={(e) => {
              setDraft(e.currentTarget.value);
              grow();
            }}
            onKeyDown={onKey}
            placeholder={
              surface === "compare"
                ? "Ask about these firms. A specific rule checks the official page."
                : "Ask a rule, a payout, or which plan fits. A specific rule checks the official page."
            }
            className="max-h-40 min-h-11 flex-1 resize-none bg-transparent px-2 py-3 text-base leading-normal text-fg outline-none placeholder:text-dim desk:text-[15px]"
          />
          <Button
            variant="send"
            size="send"
            className="mb-0.5 shrink-0"
            aria-label="Send"
            disabled={!canSend}
            onClick={() => void submit()}
          >
            <ArrowUp />
          </Button>
        </div>
      </div>
    </div>
  );
}
