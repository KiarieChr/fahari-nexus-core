import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/accommodation/floor-plan")({
  component: () => (
    <ComingSoon
      title="Floor Plan"
      description="Visual overview of room occupancy, housekeeping status, and guest locations."
    />
  ),
});
