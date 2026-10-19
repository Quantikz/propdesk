import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/propdesk/public-page";

export const Route = createFileRoute("/about")({
  component: () => (
    <PublicPage title="About PropDesk">
      <p>PropDesk exists so a trader can read the rules before paying for a challenge.</p>
      <p>Drawdown, payout gates, news, copy trading, and consistency are where accounts are lost. Those rules differ by firm, by account type, and between the challenge and the funded account.</p>
      <p>The desk is independent research. It does not sell challenges, rank firms, or take payment for placement.</p>
      <p>Official terms beat the desk when they disagree. If a page is wrong, report it. Firm representatives can submit their own rulebook. A submission is reviewed. It is not published automatically.</p>
    </PublicPage>
  ),
});
