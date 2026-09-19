import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowUp, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeskStore } from "@/lib/propdesk/store";

export function Composer() {
  const pendingFiles = useDeskStore((s) => s.pendingFiles);
  const sending = useDeskStore((s) => s.sending);
  const addFiles = useDeskStore((s) => s.addFiles);
  const removeFile = useDeskStore((s) => s.removeFile);
  const send = useDeskStore((s) => s.send);
  const fileRef = useRef<HTMLInputElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [draft, setDraft] = useState("");

  function grow() {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }

  useEffect(() => {
    grow();
  }, [pendingFiles.length]);

  async function submit() {
    const value = taRef.current?.value ?? "";
    if (!value.trim() || sending) return;
    setDraft("");
    if (taRef.current) {
      taRef.current.value = "";
      grow();
    }
    await send(value);
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
        {pendingFiles.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 px-2 pt-1 pb-2">
            {pendingFiles.map((f, i) => (
              <span
                key={`${f.name}-${i}`}
                className="inline-flex max-w-full items-center gap-1.5 rounded-md bg-hover py-1 pr-1 pl-2 text-xs"
              >
                <span className="truncate">{f.name}</span>
                <button
                  type="button"
                  aria-label={`Remove ${f.name}`}
                  className="grid size-7 place-items-center rounded-md text-dim hover:text-fg"
                  onClick={() => removeFile(i)}
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        ) : null}
        <div className="flex items-end gap-1">
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*,.pdf,.csv,.txt,.xlsx"
            className="hidden"
            onChange={(e) => {
              const list = e.target.files;
              if (list?.length) addFiles(Array.from(list));
              e.target.value = "";
            }}
          />
          <Button
            variant="icon"
            size="icon"
            className="size-11 shrink-0 border-0 bg-transparent"
            aria-label="Attach files"
            onClick={() => fileRef.current?.click()}
          >
            <Paperclip />
          </Button>
          <textarea
            ref={taRef}
            rows={1}
            onInput={(e) => {
              setDraft(e.currentTarget.value);
              grow();
            }}
            onKeyDown={onKey}
            placeholder="Ask the rule. Attach screenshots if the firm is at fault."
            className="max-h-40 min-h-11 flex-1 resize-none bg-transparent py-3 text-base leading-normal text-fg outline-none placeholder:text-dim desk:text-[15px]"
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
