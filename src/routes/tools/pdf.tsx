import { createFileRoute } from "@tanstack/react-router";
import { PdfToolkit } from "@/components/tools/PdfToolkit";

export const Route = createFileRoute("/tools/pdf")({ component: PdfToolkit });
