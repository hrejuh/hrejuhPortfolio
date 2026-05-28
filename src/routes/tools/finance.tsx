import { createFileRoute } from "@tanstack/react-router";
import { FinanceCalculatorTool } from "@/components/tools/FinanceCalculatorTool";

export const Route = createFileRoute("/tools/finance")({
  component: FinancePage,
});

function FinancePage() {
  return <FinanceCalculatorTool />;
}
