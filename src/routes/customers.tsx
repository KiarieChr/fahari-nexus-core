import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/customers")({
  component: () => (
    <ComingSoon title="Customers" description="CRM-lite directory with sales history and credit." />
  ),
});