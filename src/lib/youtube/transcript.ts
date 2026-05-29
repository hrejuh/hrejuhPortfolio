import {
  summarizeWithLlmAttempts,
  type LlmKeyAttempt,
} from "../llm/providers";
import { fetchInnertubeTranscript } from "./innertube-transcript";

export { summarizeWithLlmAttempts, summarizeWithLlmKeys } from "../llm/providers";
export type { LlmKeyAttempt, LlmProvider } from "../llm/providers";

export function extractVideoId(input: string): string | null {
  const trimmed = input.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

export async function fetchYoutubeTranscript(videoId: string): Promise<string | null> {
  try {
    const en = await fetchInnertubeTranscript(videoId, "en");
    if (en) return en;
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message.includes("disabled") || message.includes("unavailable") || message.includes("No captions")) {
      throw err;
    }
  }

  return fetchInnertubeTranscript(videoId);
}

export async function resolveYoutubeQuery(query: string) {
  const videoId = extractVideoId(query);
  if (!videoId) {
    throw new Error("Invalid YouTube URL or video ID.");
  }

  const transcript = await fetchYoutubeTranscript(videoId);
  if (!transcript) {
    throw new Error("Transcript not available for this video.");
  }

  return { videoId, transcript };
}

export async function summarizeTranscriptAttempts(text: string, attempts: LlmKeyAttempt[]) {
  return summarizeWithLlmAttempts(text, attempts);
}
