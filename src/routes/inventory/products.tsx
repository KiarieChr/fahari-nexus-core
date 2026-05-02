import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/inventory/products")({
  component: () => (
    <ComingSoon
      title="Products"
      description="Searchable, filterable products data table — wires to DRF /api/inventory/products/."
    />
  ),
});