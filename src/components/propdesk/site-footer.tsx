import { Link } from "@tanstack/react-router";

const COLS = [
  {
    title: "Explore",
    links: [
      ["Prop Firms", "/firms"],
      ["Rules Library", "/rules"],
      ["Tools", "/tools"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About PropDesk", "/about"],
      ["Contact Us", "/contact"],
      ["For Prop Firms", "/forpropfirms"],
      ["Corrections and Updates", "/corrections"],
    ],
  },
  {
    title: "Resources",
    links: [
      ["Help Center", "/help"],
      ["Methodology", "/methodology"],
      ["Ask the desk", "/desk"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy Policy", "/privacy"],
      ["Terms of Use", "/terms"],
      ["Disclaimer", "/disclaimer"],
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-line pt-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {COLS.map((col) => (
          <div key={col.title}>
            <p className="font-display text-[11px] tracking-[0.14em] text-dim uppercase">{col.title}</p>
            <ul className="mt-2 space-y-1.5 text-sm">
              {col.links.map(([label, to]) => (
                <li key={to}>
                  <Link to={to} className="text-muted hover:text-fg">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-5 text-xs leading-relaxed text-dim">
        Published information is for research. Check the firm’s current official terms before you buy or trade.
      </p>
    </footer>
  );
}
