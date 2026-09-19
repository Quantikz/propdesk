import { cn } from "@/lib/utils";

/** Dark plate, cream PD — engraved, not a sticker. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("shrink-0", className)}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="64" height="64" rx="6" fill="#0a0908" />
      <rect
        x="1.25"
        y="1.25"
        width="61.5"
        height="61.5"
        rx="4.75"
        fill="none"
        stroke="#efe6d4"
        strokeWidth="1.5"
      />
      <path
        fill="#efe6d4"
        d="M12.5 15.5h12.1c5.85 0 9.4 3.2 9.4 8.15 0 4.95-3.55 8.15-9.4 8.15H19.4V48.5h-6.9V15.5zm6.9 4.4v7.5h4.85c2.55 0 4-1.45 4-3.75s-1.45-3.75-4-3.75H19.4z"
      />
      <path
        fill="#efe6d4"
        d="M36.2 15.5h8.1c8.9 0 14.2 6.15 14.2 16.5s-5.3 16.5-14.2 16.5h-8.1V15.5zm6.9 4.5v24h1.55c5.35 0 8.1-4.15 8.1-12s-2.75-12-8.1-12H43.1z"
      />
    </svg>
  );
}

export function Logo({ className, size = "sm" }: { className?: string; size?: "sm" | "lg" }) {
  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-md",
        size === "sm" && "size-11",
        size === "lg" && "size-14",
        className,
      )}
      aria-hidden
    >
      <LogoMark className="size-full" />
    </div>
  );
}
