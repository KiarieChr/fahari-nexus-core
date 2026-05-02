import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/inventory/batches")({
  component: () => (
    <ComingSoon
      title="Batch Management"
      description="Track batches, expiry, FEFO/FIFO rules and serialised stock."
    />
  ),
});