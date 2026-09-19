import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, type = "text", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={cn(
        "h-11 w-full min-w-0 rounded-md border border-line bg-input px-3 text-base text-fg outline-none placeholder:text-dim desk:text-sm",
        "focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/25",
        "disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
