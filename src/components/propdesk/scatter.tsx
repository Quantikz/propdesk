import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Scatter({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      el.classList.add("pd-in");
      return;
    }
    const sx = (Math.random() * 90 - 45).toFixed(1);
    const sy = (Math.random() * 70 - 20).toFixed(1);
    const sr = (Math.random() * 8 - 4).toFixed(1);
    el.style.setProperty("--sx", `${sx}px`);
    el.style.setProperty("--sy", `${sy}px`);
    el.style.setProperty("--sr", `${sr}deg`);
    el.style.setProperty("--sd", `${delay}ms`);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          el.classList.add("pd-in");
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={cn("pd-scatter", className)}>
      {children}
    </div>
  );
}
