import { createFileRoute } from "@tanstack/react-router";
import { EnquiryForm } from "@/components/propdesk/enquiry-form";
import { PublicPage } from "@/components/propdesk/public-page";

export const Route = createFileRoute("/forpropfirms")({
  component: () => (
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
  ),
});