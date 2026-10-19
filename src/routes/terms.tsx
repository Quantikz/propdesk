import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/propdesk/public-page";

export const Route = createFileRoute("/terms")({
  component: () => (
    <PublicPage title="Terms of Use">
      <p>PropDesk is an information desk. It is not a broker, a prop firm, or a seller of challenges.</p>
      <p>You are responsible for checking the firm’s current official terms before you pay or trade.</p>
    </PublicPage>
  ),
});
