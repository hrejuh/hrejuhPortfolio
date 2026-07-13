import { createFileRoute } from "@tanstack/react-router";
import { QrMakerTool } from "@/components/tools/QrMakerTool";

export const Route = createFileRoute("/tools/qr")({ component: QrMakerTool });
