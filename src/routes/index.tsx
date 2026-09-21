import { createFileRoute } from "@tanstack/react-router";
import { HomeLanding } from "@/components/propdesk/home-landing";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <HomeLanding />;
}
