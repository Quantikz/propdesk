import { cn } from "@/lib/utils";

/** Cream colophon: a single ink P, no gimmicks. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn("shrink-0", className)}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="48" height="48" rx="8" fill="var(--color-paper)" />
      <rect
        x="1.25"
        y="1.25"
        width="45.5"
        height="45.5"
        rx="6.75"
        fill="none"
        stroke="var(--color-ink)"
        strokeOpacity="0.14"
        strokeWidth="1.5"
      />
      <path
        fill="var(--color-ink)"
        d="M14 10.5h13.2c6.35 0 10.3 3.35 10.3 8.55 0 5.2-3.95 8.55-10.3 8.55H19.4V37.5H14V10.5zm5.4 4.4v8.3h7.55c3.35 0 5.15-1.75 5.15-4.15 0-2.4-1.8-4.15-5.15-4.15H19.4z"
      />
    </svg>
  );
}

export function Logo({ className, size = "sm" }: { className?: string; size?: "sm" | "lg" }) {
  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden",
        size === "sm" && "size-11 rounded-lg",
        size === "lg" && "size-14 rounded-xl",
        className,
      )}
      aria-hidden
    >
      <LogoMark className="size-full" />
    </div>
  );
}
