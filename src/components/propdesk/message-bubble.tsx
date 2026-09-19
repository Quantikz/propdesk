import { Copy, Download, ExternalLink, Mail, Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { downloadCase, mailtoHref } from "@/lib/propdesk/engine";
import { RichText } from "@/lib/propdesk/format";
import { useDeskStore } from "@/lib/propdesk/store";
import type { ChatMessage } from "@/lib/propdesk/types";
import { cn } from "@/lib/utils";

function clock(ts: number) {
  try {
    return new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  const email = useDeskStore((s) => s.email);
  const showToast = useDeskStore((s) => s.showToast);
  const isUser = message.role === "user";

  return (
    <article className={cn("flex py-2", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("min-w-0", isUser ? "max-w-[min(100%,22rem)]" : "max-w-[min(100%,28rem)]")}>
        <div
          className={cn(
            "px-3.5 py-2.5 text-[15px] leading-relaxed",
            isUser
              ? "rounded-[1.15rem] rounded-br-sm bg-paper text-ink"
              : "rounded-[1.15rem] rounded-bl-sm border border-line bg-elev text-fg",
          )}
        >
          <div className={cn("break-words", isUser ? "whitespace-pre-wrap text-ink" : "text-fg")}>
            <RichText text={message.content} />
          </div>
          {message.files && message.files.length > 0 ? (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {message.files.map((f) => (
                <span
                  key={f.name}
                  className={cn(
                    "inline-flex max-w-full items-center gap-1 rounded-md px-2 py-0.5 text-xs",
                    isUser ? "bg-ink/10 text-ink" : "bg-hover text-muted",
                  )}
                >
                  <Paperclip className="size-3" />
                  <span className="max-w-[12rem] truncate">{f.name}</span>
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <div className={cn("mt-1 text-[11px] text-dim", isUser ? "text-right" : "text-left")}>
          {isUser ? "You" : "Desk"} · {clock(message.ts)}
        </div>
        {!isUser && message.chips && message.chips.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {message.chips.map((ch) => (
              <Badge key={ch.text} tone={ch.tone === "" ? "default" : (ch.tone ?? "default")}>
                {ch.text}
              </Badge>
            ))}
          </div>
        ) : null}
        {!isUser && message.sources && message.sources.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {message.sources.map((s) => (
              <a
                key={s.url}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex max-w-full items-center gap-1 rounded-full bg-hover px-2.5 py-1 text-xs text-muted hover:text-fg"
              >
                <ExternalLink className="size-3 shrink-0" />
                <span className="truncate">{s.title || s.url}</span>
              </a>
            ))}
          </div>
        ) : null}
        {message.caseDraft ? (
          <div className="mt-3 rounded-lg border border-line bg-elev p-3.5 desk:p-4">
            <h4 className="mb-2 font-display text-sm font-semibold">Letter — ready to send</h4>
            <pre className="max-h-52 overflow-auto whitespace-pre-wrap rounded-md bg-bg p-3 font-mono text-xs leading-relaxed text-muted">
              {message.caseDraft.body}
            </pre>
            <div className="mt-2.5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button
                className="w-full sm:w-auto"
                onClick={() => {
                  window.location.href = mailtoHref(message.caseDraft!, email);
                  showToast("Opened the email — attach your screenshots before sending");
                }}
              >
                <Mail />
                Email {message.caseDraft.firmName} support
              </Button>
              <Button
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={async () => {
                  await navigator.clipboard.writeText(message.caseDraft!.body);
                  showToast("Copied");
                }}
              >
                <Copy />
                Copy
              </Button>
              <Button
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={() => downloadCase(message.caseDraft!)}
              >
                <Download />
                Download .txt
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function TypingRow() {
  return (
    <article className="flex justify-start py-2">
      <div>
        <div className="mb-1 text-[11px] text-dim">Desk</div>
        <div
          className="inline-flex gap-1.5 rounded-[1.15rem] rounded-bl-sm border border-line bg-elev px-3.5 py-3"
          aria-label="Desk is writing"
        >
          {[0, 1, 2].map((i) => (
            <i
              key={i}
              className="size-1.5 rounded-full bg-muted"
              style={{
                animation: "pd-blink 1.2s infinite",
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      </div>
    </article>
  );
}
