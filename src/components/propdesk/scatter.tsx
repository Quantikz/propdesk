import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const SKIP = "input, textarea, select, option, [data-no-scatter], .pd-no-scatter";

function isCard(el: Element) {
  if (!(el instanceof HTMLElement)) return false;
  if (el.matches("article, .rule-card, .pd-lift")) return true;
  const cls = el.className;
  return typeof cls === "string" && /border/.test(cls) && /(rounded|bg-elev|bg-paper)/.test(cls);
}

function collect(root: HTMLElement) {
  const nodes = Array.from(
    root.querySelectorAll<HTMLElement>("h1, h2, h3, h4, p, li, label, a, button, article, .rule-card, [class*='border']"),
  );
  const chosen: HTMLElement[] = [];
  for (const el of nodes) {
    if (el.matches(SKIP) || el.closest(SKIP) || el.closest(".pd-no-scatter")) continue;
    if (el.closest("[data-scattered]")) continue;
    const text = el.textContent?.trim();
    if (!text && !isCard(el)) continue;
    const parentCard = el.parentElement && chosen.some((c) => c.contains(el) && c !== el);
    if (parentCard && !el.matches("h1, h2, h3, h4, p, li")) continue;
    if (el.matches("a, button") && el.parentElement && chosen.includes(el.parentElement)) continue;
    chosen.push(el);
  }
  return chosen;
}

function arm(el: HTMLElement, index: number) {
  if (el.dataset.scattered) return;
  el.dataset.scattered = "1";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    el.classList.add("pd-in");
    return;
  }
  const sx = (Math.random() * 110 - 55).toFixed(1);
  const sy = (Math.random() * 80 - 16).toFixed(1);
  const sr = (Math.random() * 7 - 3.5).toFixed(1);
  el.style.setProperty("--sx", `${sx}px`);
  el.style.setProperty("--sy", `${sy}px`);
  el.style.setProperty("--sr", `${sr}deg`);
  el.style.setProperty("--sd", `${(index % 12) * 45}ms`);
  el.classList.add("pd-scatter");
  if (el.matches("a, button, article, .rule-card") || isCard(el)) el.classList.add("pd-lift");
}

export function ScatterPage({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("pd-in");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
    );
    const mark = () => {
      const items = collect(root);
      items.forEach((el, i) => {
        arm(el, i);
        if (!el.classList.contains("pd-in")) io.observe(el);
      });
    };
    mark();
    const mo = new MutationObserver(() => mark());
    mo.observe(root, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className={cn("min-h-0 min-w-0 flex-1", className)}>
      {children}
    </div>
  );
}
