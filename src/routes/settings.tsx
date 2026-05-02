import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/settings")({
  component: () => (
    <ComingSoon
      title="Settings"
      description="Tabbed settings: General, Alerts, Batching, Integrations."
    />
  ),
});