import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/purchases/suppliers")({
  component: () => (
    <ComingSoon title="Suppliers" description="Vendor master, lead times, and payment terms." />
  ),
});
