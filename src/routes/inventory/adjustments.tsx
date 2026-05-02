import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/inventory/adjustments")({
  component: () => (
    <ComingSoon
      title="Stock Adjustments"
      description="Audit-friendly stock movements with optimistic UI updates."
    />
  ),
});