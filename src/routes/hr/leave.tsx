import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/hr/leave")({
  component: () => (
    <ComingSoon
      title="Leave & Absence"
      description="Track leave requests, approvals, and annual leave balances."
    />
  ),
});
