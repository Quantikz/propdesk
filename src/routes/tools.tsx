import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/propdesk/public-page";

export const Route = createFileRoute("/tools")({ component: Tools });

function Tools() {
  const [balance, setBalance] = useState("100000");
  const [daily, setDaily] = useState("5");
  const [max, setMax] = useState("10");
  const b = Number(balance) || 0;
  const dailyRoom = b * ((Number(daily) || 0) / 100);
  const maxRoom = b * ((Number(max) || 0) / 100);
  return (
    <PublicPage title="Tools">
      <p>These are arithmetic helpers. They are not a firm’s rule. Use the firm’s definition of balance, equity, and trailing.</p>
      <div className="rounded-md border border-line bg-elev p-3 text-fg">
        <p className="font-display text-sm font-semibold">Drawdown room</p>
        <p className="mt-1 text-xs text-dim">Room = balance × percent. This assumes a static percent of the number you enter.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <label className="text-xs">Balance<input value={balance} onChange={(e) => setBalance(e.target.value)} className="mt-1 h-10 w-full rounded-md border border-line bg-bg px-2 text-sm" /></label>
          <label className="text-xs">Daily %<input value={daily} onChange={(e) => setDaily(e.target.value)} className="mt-1 h-10 w-full rounded-md border border-line bg-bg px-2 text-sm" /></label>
          <label className="text-xs">Max %<input value={max} onChange={(e) => setMax(e.target.value)} className="mt-1 h-10 w-full rounded-md border border-line bg-bg px-2 text-sm" /></label>
        </div>
        <p className="mt-3 text-sm">Daily room {dailyRoom.toLocaleString()} · Max room {maxRoom.toLocaleString()}</p>
      </div>
      <p>The payout cycle calculator, including a consistency-cap check, is on <Link to="/payouts" className="text-fg underline">Payouts</Link>.</p>
    </PublicPage>
  );
}
