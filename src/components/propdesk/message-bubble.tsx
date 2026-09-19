import { Copy, Download, ExternalLink, Mail, Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/propdesk/logo";
import { downloadCase, mailtoHref } from "@/lib/propdesk/engine";
import { RichText } from "@/lib/propdesk/format";
import { useDeskStore } from "@/lib/propdesk/store";
import type { ChatMessage } from "@/lib/propdesk/types";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const email = useDeskStore((s) => s.email);
  const showToast = useDeskStore((s) => s.showToast);
  const initial = (email || "T").trim()[0]?.toUpperCase() || "T";
  const isUser = message.role === "user";

  return (
    <article className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-3 py-4 first:pt-0 desk:gap-4 desk:py-5">
      {isUser ? (
        <div className="grid size-9 place-items-center rounded-lg bg-user-av text-xs font-bold shadow-[var(--shadow-border)]">
          {initial}
        </div>
      ) : (
        <Logo className="size-9" />
      )}
      <div className="min-w-0">
        <div className="mb-1.5 text-sm font-semibold">{isUser ? "You" : "PropDesk"}</div>
        <div className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-fg/90">
          <RichText text={message.content} />
        </div>
        {message.files && message.files.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {message.files.map((f) => (
              <Badge key={f.name} className="gap-1">
                <Paperclip className="size-3" />
                <span className="max-w-[12rem] truncate">{f.name}</span>
              </Badge>
            ))}
          </div>
        ) : null}
        {message.chips && message.chips.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {message.chips.map((ch) => (
              <Badge key={ch.text} tone={ch.tone === "" ? "default" : (ch.tone ?? "default")}>
                {ch.text}
              </Badge>
            ))}
          </div>
        ) : null}
        {message.sources && message.sources.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {message.sources.map((s) => (
              <a
                key={s.url}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex max-w-full items-center gap-1 rounded-full bg-hover px-2.5 py-1 text-xs text-muted transition-colors duration-[var(--motion-quick)] hover:text-fg"
              >
                <ExternalLink className="size-3 shrink-0" />
                <span className="truncate">{s.title || s.url}</span>
              </a>
            ))}
          </div>
        ) : null}
        {message.caseDraft ? (
          <div className="mt-3.5 rounded-md border border-line bg-elev p-3.5 desk:p-4">
            <h4 className="mb-2 text-sm font-semibold">Escalation case — ready to send</h4>
            <pre className="max-h-52 overflow-auto whitespace-pre-wrap rounded-lg bg-bg/70 p-3 font-mono text-xs leading-relaxed text-muted">
              {message.caseDraft.body}
            </pre>
            <div className="mt-2.5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button
                className="w-full sm:w-auto"
                onClick={() => {
                  window.location.href = mailtoHref(message.caseDraft!, email);
                  showToast("Opened email draft — attach your screenshots before sending");
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
                  showToast("Case copied");
                }}
              >
                <Copy />
                Copy case
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
    <article className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-3 py-4 desk:gap-4">
      <Logo className="size-9" />
      <div>
        <div className="mb-1.5 text-sm font-semibold">PropDesk</div>
        <div className="flex gap-1.5 py-2" aria-label="Searching live rules">
          {[0, 1, 2].map((i) => (
            <i
              key={i}
              className="size-1.5 rounded-full bg-fg"
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
