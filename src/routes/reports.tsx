import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/reports")({
  component: () => (
    <ComingSoon title="Reports" description="Cohorts, P&L, inventory turns and tax summaries." />
  ),
});
