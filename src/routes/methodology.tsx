import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/propdesk/public-page";

export const Route = createFileRoute("/methodology")({
  component: () => (
    <PublicPage title="Methodology">
      <p>Official terms, the firm’s rulebook, and the firm’s own help center come first. A payout tracker is a payout record, not a rulebook.</p>
      <p>Rules are tied to a firm and, where the source says so, to an account type or phase. Challenge rules and funded-account rules are not treated as the same book.</p>
      <p>A number is shown as live only when it was read from an official page and stamped. Desk notes stay labeled as desk notes. A missing number is left missing.</p>
      <p>If two official sources disagree, the desk says they disagree. It does not pick one and call it settled.</p>
      <p>A firm is listed from its official page. The desk does not publish a rule because a representative sent it.</p>
    </PublicPage>
  ),
});
