import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/company")({
  component: () => (
    <ComingSoon
      title="Company Management"
      description="Branches, registers, tax profiles and company settings."
    />
  ),
});