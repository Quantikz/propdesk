import { useEffect, useRef } from "react";
import { EmptyState } from "@/components/propdesk/empty-state";
import { MessageBubble, TypingRow } from "@/components/propdesk/message-bubble";
import { useDeskStore } from "@/lib/propdesk/store";
import { cn } from "@/lib/utils";

export function Thread() {
  const chats = useDeskStore((s) => s.chats);
  const activeId = useDeskStore((s) => s.activeId);
  const sending = useDeskStore((s) => s.sending);
  const chat = chats.find((c) => c.id === activeId);
  const messages = chat?.messages ?? [];
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length, sending, activeId]);

  const empty = messages.length === 0 && !sending;

  return (
    <div
      ref={scroller}
      className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain"
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-[780px] flex-col px-4 desk:px-5",
          empty
            ? "min-h-full justify-start py-5 desk:justify-center desk:py-10"
            : "py-5 pb-8 desk:py-7",
        )}
      >
        {empty ? (
          <EmptyState />
        ) : (
          <div>
            {messages.map((m, i) => (
              <div key={`${m.ts}-${i}`} className={i > 0 ? "border-t border-border/70" : undefined}>
                <MessageBubble message={m} />
              </div>
            ))}
            {sending ? (
              <div className="border-t border-border/70">
                <TypingRow />
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
