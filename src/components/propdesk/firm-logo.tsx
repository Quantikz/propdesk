import { useState } from "react";
import type { Firm } from "@/lib/propdesk/types";
import { cn } from "@/lib/utils";

function hostOf(portal: string) {
  try {
    return new URL(portal).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function FirmLogo({
  firm,
  size = 18,
  className,
}: {
  firm: Firm;
  size?: number;
  className?: string;
}) {
  const host = hostOf(firm.portal);
  const src = host
    ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`
    : "";
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span
        className={cn(
          "grid shrink-0 place-items-center rounded-sm bg-hover font-display text-[10px] font-bold",
          className,
        )}
        style={{ width: size, height: size }}
        aria-hidden
      >
        {firm.short.slice(0, 1)}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={cn("shrink-0 rounded-sm bg-elev object-contain", className)}
      onError={() => setFailed(true)}
    />
  );
}
