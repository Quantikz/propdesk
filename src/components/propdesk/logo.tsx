import { cn } from "@/lib/utils";

/** Bold P with a help-dot — reads as P and as ?. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("shrink-0 text-paper", className)}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="currentColor"
        d="M8 2h28.4C50.2 2 60 11.6 60 24.4 60 37.2 50.2 46.8 36.4 46.8H8V2zm16 15v15.4h12c8.2 0 12.6-4 12.6-7.7s-4.4-7.7-12.6-7.7H24z"
      />
      <rect x="8" y="53" width="16" height="9" rx="1.5" fill="currentColor" />
    </svg>
  );
}

export function Logo({ className, size = "sm" }: { className?: string; size?: "sm" | "lg" }) {
  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center",
        size === "sm" && "size-11",
        size === "lg" && "size-14",
        className,
      )}
      aria-hidden
    >
      <LogoMark className={size === "lg" ? "size-14" : "size-11"} />
    </div>
  );
}
