import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/hr/employees")({
  component: () => (
    <ComingSoon
      title="Employee Directory"
      description="Manage staff records, employment contracts, and personal information."
    />
  ),
});
