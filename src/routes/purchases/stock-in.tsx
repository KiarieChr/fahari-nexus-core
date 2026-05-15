import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/purchases/stock-in")({
  component: () => (
    <ComingSoon
      title="Stock In"
      description="Goods received notes, supplier invoices, and landed cost tracking."
    />
  ),
});
