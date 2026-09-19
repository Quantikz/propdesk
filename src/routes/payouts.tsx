import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/propdesk/app-shell";

export const Route = createFileRoute("/payouts")({ component: PayoutsPage });

function PayoutsPage() {
  return <AppShell />;
}
