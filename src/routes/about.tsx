import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/propdesk/public-page";

export const Route = createFileRoute("/about")({
  component: () => (
    <PublicPage title="About PropDesk">
      <p>PropDesk exists so a trader can read the rules before paying for a challenge.</p>
      <p>Drawdown, payout gates, news, copy trading, and consistency are where accounts are lost. Those rules differ by firm, by account type, and between the challenge and the funded account.</p>
      <p>The desk is independent research. It does not sell challenges, rank firms, or take payment for placement.</p>
      <p>Official terms beat the desk when they disagree. If a page is wrong, report it. A firm that wants to be listed writes through For Prop Firms. We list from the official page.</p>
    </PublicPage>
  ),
});
