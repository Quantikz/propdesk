import { cn } from "@/lib/utils";

export function Logo({ className, size = "sm" }: { className?: string; size?: "sm" | "lg" }) {
  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center border border-line bg-elev text-fg",
        size === "sm" && "size-8 rounded-sm",
        size === "lg" && "size-11 rounded-md",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className={size === "lg" ? "size-6" : "size-4"} fill="currentColor">
        <path
          fillRule="evenodd"
          d="M6 4h7.2c3.4 0 5.6 1.9 5.6 4.9S16.6 14 13.2 14H9.5v6H6V4zm3.5 2.7v4.6h3.5c1.6 0 2.5-.9 2.5-2.3s-.9-2.3-2.5-2.3H9.5z"
        />
      </svg>
    </div>
  );
}
