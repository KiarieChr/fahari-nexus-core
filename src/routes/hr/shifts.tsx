import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/hr/shifts")({
  component: () => (
    <ComingSoon
      title="Shifts & Rota"
      description="Schedule staff shifts, manage duty rotas, and track attendance."
    />
  ),
});
