import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/propdesk/public-page";

export const Route = createFileRoute("/corrections")({
  component: () => (
    <PublicPage title="Corrections and Updates">
      <p>If a rule, date, or source is wrong, send the official page. Do not send a screenshot of a dashboard as the only source unless the firm publishes that card.</p>
      <p>Firm representatives should use <Link to="/forpropfirms" className="text-fg underline">For Prop Firms</Link>. Everyone else can use <Link to="/contact" className="text-fg underline">Contact</Link> and choose Incorrect or Outdated Rules.</p>
      <p>A correction is stored with a reference. Private contact details and submitted documents are not published.</p>
    </PublicPage>
  ),
});
