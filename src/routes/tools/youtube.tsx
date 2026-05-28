import { createFileRoute } from "@tanstack/react-router";
import { YoutubeTranscriptTool } from "@/components/tools/YoutubeTranscriptTool";

export const Route = createFileRoute("/tools/youtube")({
  component: YoutubeTranscriptPage,
});

function YoutubeTranscriptPage() {
  return <YoutubeTranscriptTool />;
}
