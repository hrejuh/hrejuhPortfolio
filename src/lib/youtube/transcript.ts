import { YoutubeTranscript } from "youtube-transcript";
import {
  summarizeWithLlmAttempts,
  type LlmKeyAttempt,
} from "../llm/providers";

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
    const chunks = await YoutubeTranscript.fetchTranscript(videoId, { lang: "en" });
    const text = chunks.map((c) => c.text).join(" ").replace(/\s+/g, " ").trim();
    if (text) return text;
  } catch {
    // try any available language
  }

  try {
    const chunks = await YoutubeTranscript.fetchTranscript(videoId);
    const text = chunks.map((c) => c.text).join(" ").replace(/\s+/g, " ").trim();
    return text || null;
  } catch {
    return null;
  }
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
