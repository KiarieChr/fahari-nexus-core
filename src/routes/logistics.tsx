import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/logistics")({
  component: () => (
    <ComingSoon
      title="Logistics"
      description="Inter-branch transfers, deliveries, and route planning."
    />
  ),
});