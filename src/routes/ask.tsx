import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/propdesk/app-shell";

export const Route = createFileRoute("/ask")({ component: Page });

function Page() {
  return <AppShell />;
}
