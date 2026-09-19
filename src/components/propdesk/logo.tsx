import { cn } from "@/lib/utils";

export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M8 5.5h11.1C23.7 5.5 27 8.7 27 13.1c0 4.3-3.3 7.6-7.9 7.6h-6.6V26.5H8V5.5zm4.5 4v7.2h6.4c2.4 0 3.9-1.5 3.9-3.6s-1.5-3.6-3.9-3.6h-6.4z"
      />
    </svg>
  );
}

export function Logo({ className, size = "sm" }: { className?: string; size?: "sm" | "lg" }) {
  return (
    <div
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-lg text-accent shadow-[var(--shadow-border)]",
        "bg-[linear-gradient(160deg,color-mix(in_srgb,var(--color-accent)_28%,transparent),color-mix(in_srgb,var(--color-accent)_8%,transparent))]",
        size === "sm" && "size-8",
        size === "lg" && "size-12",
        className,
      )}
      aria-hidden
    >
      <Mark className={size === "lg" ? "size-7" : "size-5"} />
    </div>
  );
}
