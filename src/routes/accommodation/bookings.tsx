import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/accommodation/bookings")({
  component: () => (
    <ComingSoon
      title="Guest Bookings"
      description="Manage reservations, check-ins, check-outs, and guest folios."
    />
  ),
});
