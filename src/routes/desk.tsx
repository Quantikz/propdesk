import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/propdesk/app-shell";

export const Route = createFileRoute("/desk")({ component: DeskPage });

function DeskPage() {
  return <AppShell />;
}
