import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/propdesk/public-page";

export const Route = createFileRoute("/help")({
  component: () => (
    <PublicPage title="Help Center">
      <p>Start with a firm sheet, then the rule library, then Ask the desk if the page does not answer it.</p>
      <ul className="list-disc space-y-1 pl-5">
        <li><Link to="/firms" className="text-fg underline">Prop firms</Link></li>
        <li><Link to="/rules" className="text-fg underline">Rules library</Link></li>
        <li><Link to="/desk" className="text-fg underline">Ask the desk</Link></li>
        <li><Link to="/corrections" className="text-fg underline">Report a wrong rule</Link></li>
      </ul>
    </PublicPage>
  ),
});
