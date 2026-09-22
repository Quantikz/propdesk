export const DESK_DISCLAIMER =
  "PropDesk provides informational explanations and is not a substitute for a firm's current official terms.";

export function DeskDisclaimer({ className = "mt-6 max-w-2xl text-xs leading-relaxed text-dim" }: { className?: string }) {
  return <p className={className}>{DESK_DISCLAIMER}</p>;
}
