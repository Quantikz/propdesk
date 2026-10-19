import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/propdesk/public-page";

export const Route = createFileRoute("/disclaimer")({
  component: () => (
    <PublicPage title="Disclaimer">
      <p>Nothing on PropDesk is financial advice, a recommendation to buy a challenge, or a ranking of firms.</p>
      <p>Rulebooks change. A stamped page is a record of what that page said at that time, not a promise that it still says it.</p>
    </PublicPage>
  ),
});
