import { createFileRoute, Link } from "@tanstack/react-router";
import { EnquiryForm } from "@/components/propdesk/enquiry-form";
import { PublicPage } from "@/components/propdesk/public-page";

export const Route = createFileRoute("/contact")({
  component: () => (
    <PublicPage title="Contact">
      <p>Traders, researchers, and firm representatives can write here. Firm rule submissions belong on <Link to="/forpropfirms" className="text-fg underline">For Prop Firms</Link>.</p>
      <EnquiryForm
        kind="contact"
        types={["General Enquiry", "Incorrect or Outdated Rules", "Missing Prop Firm", "Technical Issue", "Prop Firm Representative", "Privacy or Legal Request", "Other"]}
      />
    </PublicPage>
  ),
});
