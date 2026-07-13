import { createFileRoute } from "@tanstack/react-router";
import { VaultTool } from "@/components/tools/VaultTool";

export const Route = createFileRoute("/tools/vault")({ component: VaultTool });
