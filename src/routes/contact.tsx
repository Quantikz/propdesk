import { createFileRoute, Link } from "@tanstack/react-router";
import { EnquiryForm } from "@/components/propdesk/enquiry-form";
import { PublicPage } from "@/components/propdesk/public-page";

export const Route = createFileRoute("/contact")({
  component: () => (
    <PublicPage title="Contact">
      <p>Traders and researchers can write here. If you represent a prop firm and want to be listed, use <Link to="/forpropfirms" className="text-fg underline">For Prop Firms</Link>.</p>
      <EnquiryForm
        kind="contact"
        types={["General Enquiry", "Incorrect or Outdated Rules", "Missing Prop Firm", "Technical Issue", "Prop Firm Representative", "Privacy or Legal Request", "Other"]}
      />
    </PublicPage>
  ),
});
