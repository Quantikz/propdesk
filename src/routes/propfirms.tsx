import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/propfirms")({
  beforeLoad: () => {
    throw redirect({ to: "/firms" });
  },
});
