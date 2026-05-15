import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/accommodation/rooms")({
  component: () => (
    <ComingSoon
      title="Room Management"
      description="Configure room types, pricing, amenities, and maintenance schedules."
    />
  ),
});
