import { cn } from "@/lib/utils";

/** Payout-stub mark: cream ticket, punched edge, ink PD. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={cn("shrink-0", className)}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="40" height="40" rx="5" fill="var(--color-paper)" />
      <circle cx="6.2" cy="8" r="1.45" fill="var(--color-bg)" />
      <circle cx="6.2" cy="16" r="1.45" fill="var(--color-bg)" />
      <circle cx="6.2" cy="24" r="1.45" fill="var(--color-bg)" />
      <circle cx="6.2" cy="32" r="1.45" fill="var(--color-bg)" />
      <path
        d="M11.2 6.5v27"
        stroke="var(--color-ink)"
        strokeOpacity="0.28"
        strokeWidth="0.7"
        strokeDasharray="1.4 1.8"
      />
      <path
        fill="var(--color-ink)"
        d="M14.2 9.2h6.05c3.05 0 4.95 1.7 4.95 4.35 0 2.55-1.75 4.15-4.55 4.35v.15c.55.2 1 .55 1.35 1.05l3.35 5.7h-3.15l-3-5.2c-.25-.45-.55-.7-1.05-.7h-1.1v5.9h-2.85V9.2zm2.85 2.35v4.15h3.05c1.45 0 2.25-.75 2.25-2.1 0-1.3-.8-2.05-2.25-2.05H17.05z"
      />
    </svg>
  );
}

export function Logo({ className, size = "sm" }: { className?: string; size?: "sm" | "lg" }) {
  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-ink)_12%,transparent)]",
        size === "sm" && "size-9 rounded-md",
        size === "lg" && "size-12 rounded-lg",
        className,
      )}
      aria-hidden
    >
      <LogoMark className="size-full" />
    </div>
  );
}
