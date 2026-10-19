import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/propdesk/public-page";

export const Route = createFileRoute("/privacy")({
  component: () => (
    <PublicPage title="Privacy Policy">
      <p>Contact and firm submissions store the name, email, role, message, and source URL you send. They are used to review the enquiry. They are not published.</p>
      <p>The public desk does not require an account. Theme and admin session stay in this browser.</p>
    </PublicPage>
  ),
});
