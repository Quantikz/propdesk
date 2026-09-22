import { cn } from "@/lib/utils";

/** Ticket-P: a bold P with a blotter stub. The PropDesk mark. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("shrink-0 text-fg", className)}
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

export function Logo({
  className,
  size = "sm",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const box = size === "lg" ? "size-16" : size === "md" ? "size-12" : "size-11";
  const mark = size === "lg" ? "size-11" : size === "md" ? "size-8" : "size-8";
  return (
    <div
      className={cn("grid shrink-0 place-items-center rounded-md bg-paper text-ink", box, className)}
      aria-hidden
    >
      <LogoMark className={cn("text-ink", mark)} />
    </div>
  );
}

export function BrandLockup({
  size = "sm",
  tagline = true,
}: {
  size?: "sm" | "md" | "lg";
  tagline?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Logo size={size} />
      <div className="min-w-0">
        <p className={cn("wordmark", size === "lg" && "wordmark-lg")}>PropDesk</p>
        {tagline ? <p className="brand-tag">Rules before you buy</p> : null}
      </div>
    </div>
  );
}
