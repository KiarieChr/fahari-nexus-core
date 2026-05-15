import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/hr/payroll")({
  component: () => (
    <ComingSoon
      title="Payroll Management"
      description="Process salaries, manage deductions, and generate payslips."
    />
  ),
});
