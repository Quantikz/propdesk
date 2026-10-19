import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { EnquiryForm } from "@/components/propdesk/enquiry-form";
import { PublicPage } from "@/components/propdesk/public-page";

export function SitePage() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (path.startsWith("/about")) return <About />;
  if (path.startsWith("/contact")) return <Contact />;
  if (path.startsWith("/forpropfirms")) return <Firms />;
  if (path.startsWith("/methodology")) return <Methodology />;
  if (path.startsWith("/corrections")) return <Corrections />;
  if (path.startsWith("/help")) return <Help />;
  if (path.startsWith("/privacy")) return <Privacy />;
  if (path.startsWith("/terms")) return <Terms />;
  if (path.startsWith("/disclaimer")) return <Disclaimer />;
  if (path.startsWith("/tools")) return <Tools />;
  return null;
}

function About() {
  return (
    <PublicPage title="About PropDesk">
      <p>PropDesk exists so a trader can read the rules before paying for a challenge.</p>
      <p>Drawdown, payout gates, news, copy trading, and consistency are where accounts are lost. Those rules differ by firm, by account type, and between the challenge and the funded account.</p>
      <p>The desk is independent research. It does not sell challenges, rank firms, or take payment for placement.</p>
      <p>Official terms beat the desk when they disagree. If a page is wrong, report it. A firm that wants to be listed writes through For Prop Firms. We list from the official page.</p>
    </PublicPage>
  );
}

function Contact() {
  return (
    <PublicPage title="Contact">
      <p>Traders and researchers can write here. If you represent a prop firm and want to be listed, use <Link to="/forpropfirms" className="text-fg underline">For Prop Firms</Link>.</p>
      <EnquiryForm kind="contact" types={["General Enquiry", "Incorrect or Outdated Rules", "Missing Prop Firm", "Technical Issue", "Prop Firm Representative", "Privacy or Legal Request", "Other"]} />
    </PublicPage>
  );
}

function Firms() {
  return (
    <PublicPage title="List your firm on PropDesk.">
      <p>Traders come here to read the rules before they buy a challenge. If you represent a prop firm, write to us and we will list you.</p>
      <h2 className="font-display text-xl font-bold text-fg">Why be listed</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Traders see your firm when they are comparing rules, not ads.</li>
        <li>Your official page is the source. The desk links to it.</li>
        <li>Drawdown, payouts, news, and restrictions are explained in one place.</li>
        <li>A listing is not a ranking and not a paid placement.</li>
      </ul>
      <p>Send your firm name, official site, and a business email. We list from the official page. We do not take a rulebook upload.</p>
      <EnquiryForm kind="firm" types={["List our firm", "Update our listing", "General enquiry"]} />
    </PublicPage>
  );
}

function Methodology() {
  return (
    <PublicPage title="Methodology">
      <p>Official terms, the firm’s rulebook, and the firm’s own help center come first. A payout tracker is a payout record, not a rulebook.</p>
      <p>Rules are tied to a firm and, where the source says so, to an account type or phase. Challenge rules and funded-account rules are not treated as the same book.</p>
      <p>A number is shown as live only when it was read from an official page and stamped. Desk notes stay labeled as desk notes. A missing number is left missing.</p>
      <p>If two official sources disagree, the desk says they disagree. It does not pick one and call it settled.</p>
      <p>A firm is listed from its official page. The desk does not publish a rule because a representative sent it.</p>
    </PublicPage>
  );
}

function Corrections() {
  return (
    <PublicPage title="Corrections and Updates">
      <p>If a rule, date, or source is wrong, send the official page. Firm representatives who want a listing should use <Link to="/forpropfirms" className="text-fg underline">For Prop Firms</Link>. A wrong line on an existing sheet can be reported here or on <Link to="/contact" className="text-fg underline">Contact</Link>.</p>
      <p>A correction is stored with a reference. Private contact details and submitted documents are not published.</p>
    </PublicPage>
  );
}

function Help() {
  return (
    <PublicPage title="Help Center">
      <p>Start with a firm sheet, then the rule library, then Ask the desk if the page does not answer it.</p>
      <ul className="list-disc space-y-1 pl-5">
        <li><Link to="/firms" className="text-fg underline">Prop firms</Link></li>
        <li><Link to="/rules" className="text-fg underline">Rules library</Link></li>
        <li><Link to="/desk" className="text-fg underline">Ask the desk</Link></li>
        <li><Link to="/corrections" className="text-fg underline">Report a wrong rule</Link></li>
      </ul>
    </PublicPage>
  );
}

function Privacy() {
  return (
    <PublicPage title="Privacy Policy">
      <p>Contact and firm submissions store the name, email, role, message, and source URL you send. They are used to review the enquiry. They are not published.</p>
      <p>The public desk does not require an account. Theme and admin session stay in this browser.</p>
    </PublicPage>
  );
}

function Terms() {
  return (
    <PublicPage title="Terms of Use">
      <p>PropDesk is an information desk. It is not a broker, a prop firm, or a seller of challenges.</p>
      <p>You are responsible for checking the firm’s current official terms before you pay or trade.</p>
    </PublicPage>
  );
}

function Disclaimer() {
  return (
    <PublicPage title="Disclaimer">
      <p>Nothing on PropDesk is financial advice, a recommendation to buy a challenge, or a ranking of firms.</p>
      <p>Rulebooks change. A stamped page is a record of what that page said at that time, not a promise that it still says it.</p>
    </PublicPage>
  );
}

function Tools() {
  const [balance, setBalance] = useState("100000");
  const [daily, setDaily] = useState("5");
  const [max, setMax] = useState("10");
  const b = Number(balance) || 0;
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
        <p className="mt-3 text-sm">Daily room {(b * ((Number(daily) || 0) / 100)).toLocaleString()} · Max room {(b * ((Number(max) || 0) / 100)).toLocaleString()}</p>
      </div>
      <p>The payout cycle calculator, including a consistency-cap check, is on <Link to="/payouts" className="text-fg underline">Payouts</Link>.</p>
    </PublicPage>
  );
}
