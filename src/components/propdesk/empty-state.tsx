import { SUGGESTS, getFirm } from "@/lib/propdesk/engine";
import { useDeskStore } from "@/lib/propdesk/store";

function HeroMark() {
  return (
    <svg viewBox="0 0 120 120" className="size-16 text-accent desk:size-20" aria-hidden>
      <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeOpacity="0.14" strokeWidth="1.25" />
      <circle cx="60" cy="60" r="40" fill="none" stroke="currentColor" strokeOpacity="0.28" strokeWidth="1.25" />
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M46 34h26.5c11.2 0 18.5 7.1 18.5 17.2 0 10.1-7.3 17.3-18.5 17.3H57.5V86H46V34zm11.5 9.5v16.5h14.2c5.4 0 8.6-3.2 8.6-8.25s-3.2-8.25-8.6-8.25H57.5z"
      />
      <circle cx="94" cy="30" r="2.5" fill="currentColor" opacity="0.75" />
    </svg>
  );
}

export function EmptyState() {
  const firmId = useDeskStore((s) => s.firmId);
  const send = useDeskStore((s) => s.send);
  const sending = useDeskStore((s) => s.sending);
  const firm = getFirm(firmId);

  return (
    <div className="pd-stagger flex w-full flex-1 flex-col items-center justify-start px-1 text-center desk:justify-center">
      <HeroMark />
      <h2 className="mt-3 max-w-sm text-2xl font-semibold tracking-tight desk:max-w-none desk:text-3xl">
        How can I help with {firm.name}?
      </h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted desk:text-base">
        I search this firm’s live rules, then give you a straight answer. If they are at fault and
        you have proof, I draft the email.
      </p>
      <div className="mt-5 grid w-full grid-cols-1 gap-2 sm:grid-cols-2 desk:mt-7 desk:gap-2.5">
        {SUGGESTS.map((s) => (
          <button
            key={s.title}
            type="button"
            disabled={sending}
            onClick={() => send(s.prompt)}
            className="min-h-12 rounded-xl glass-soft px-3.5 py-3 text-left transition-[box-shadow,background-color,transform] duration-[var(--motion-quick)] ease-[var(--ease-out)] hover:bg-hover hover:shadow-[var(--shadow-border-hover)] active:scale-[0.98] disabled:opacity-50 desk:min-h-14 desk:px-4 desk:py-3.5"
          >
            <strong className="block text-sm font-semibold">{s.title}</strong>
            <em className="mt-0.5 block text-xs not-italic text-dim">{s.blurb}</em>
          </button>
        ))}
      </div>
    </div>
  );
}
