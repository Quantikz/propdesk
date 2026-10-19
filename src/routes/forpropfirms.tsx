import { createFileRoute } from "@tanstack/react-router";
import { EnquiryForm } from "@/components/propdesk/enquiry-form";
import { PublicPage } from "@/components/propdesk/public-page";

export const Route = createFileRoute("/forpropfirms")({
  component: () => (
    <PublicPage title="Help us keep your rules accurate.">
      <p>PropDesk helps traders understand prop firm rules before purchasing a challenge. If you represent a prop firm, work with us so published information reflects your official policies.</p>
      <p>Contact does not purchase placement, a ranking, or a guarantee of publication. A firm can supply evidence. It cannot dictate the editorial conclusion.</p>
      <h2 className="font-display text-xl font-bold text-fg">Submit Official Rules</h2>
      <p>Rulebooks, terms, help-center articles, and account-specific rules.</p>
      <h2 className="font-display text-xl font-bold text-fg">Report a Policy Change</h2>
      <p>Drawdown, payout conditions, challenge requirements, trading restrictions, or termination rules.</p>
      <h2 className="font-display text-xl font-bold text-fg">Request a Correction</h2>
      <p>Point at the incorrect line and give the official source.</p>
      <h2 className="font-display text-xl font-bold text-fg">Independent review</h2>
      <p>Submissions are stored as Received, then reviewed. Conflicting sources are flagged, not guessed. Firm statements stay distinct from what the desk verified.</p>
      <EnquiryForm
        kind="firm"
        types={["Submit Official Rules", "Report a Policy Change", "Request a Correction", "Update Firm Information", "Clarify a Rule", "General Enquiry"]}
      />
    </PublicPage>
  ),
});
