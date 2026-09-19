import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/propdesk/app-shell";

export const Route = createFileRoute("/compare")({ component: ComparePage });

function ComparePage() {
  return <AppShell />;
}
