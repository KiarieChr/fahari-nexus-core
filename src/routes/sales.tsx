import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/sales")({
  component: () => (
    <ComingSoon title="All Sales" description="Sales ledger with filters, exports, and refunds." />
  ),
});