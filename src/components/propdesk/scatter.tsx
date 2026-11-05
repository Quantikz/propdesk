import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const SKIP = "input, textarea, select, option, [data-no-scatter], .pd-no-scatter, [role='dialog'], [aria-modal='true']";

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
    if (el.closest("[role='dialog'], [aria-modal='true']")) continue;
    const style = getComputedStyle(el);
    if (style.position === "fixed" || style.position === "sticky") continue;
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

function arm(el: HTMLElement) {
  if (el.dataset.scattered) return;
  el.dataset.scattered = "1";
  el.classList.add("pd-scatter");
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
      { threshold: 0.01, rootMargin: "80px 0px" },
    );
    const mark = () => {
      const items = collect(root);
      items.forEach((el) => {
        arm(el);
        if (!el.classList.contains("pd-in")) io.observe(el);
      });
    };
    mark();
    const failsafe = window.setTimeout(() => {
      root.querySelectorAll<HTMLElement>(".pd-scatter:not(.pd-in)").forEach((el) => el.classList.add("pd-in"));
    }, 400);
    const mo = new MutationObserver(() => mark());
    mo.observe(root, { childList: true, subtree: true });
    return () => {
      window.clearTimeout(failsafe);
      mo.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className={cn("flex min-h-0 min-w-0 flex-1 flex-col", className)}>
      {children}
    </div>
  );
}
