"use node";

import { YoutubeTranscript } from "youtube-transcript";
import { action } from "../_generated/server";
import { v } from "convex/values";

function extractVideoId(input: string): string | null {
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

async function fetchTranscriptText(videoId: string): Promise<string | null> {
  try {
    const chunks = await YoutubeTranscript.fetchTranscript(videoId, { lang: "en" });
    const text = chunks.map((c) => c.text).join(" ").replace(/\s+/g, " ").trim();
    if (text) return text;
  } catch {
    // fallback below
  }
  try {
    const chunks = await YoutubeTranscript.fetchTranscript(videoId);
    return chunks.map((c) => c.text).join(" ").replace(/\s+/g, " ").trim() || null;
  } catch {
    return null;
  }
}

export const getTranscript = action({
  args: { query: v.string() },
  handler: async (_ctx, { query }) => {
    const videoId = extractVideoId(query);
    if (!videoId) throw new Error("Invalid YouTube URL or video ID.");

    const transcript = await fetchTranscriptText(videoId);
    if (!transcript) throw new Error("Transcript not available for this video.");

    return { videoId, transcript };
  },
});

export const summarizeTranscript = action({
  args: { text: v.string(), apiKey: v.string() },
  handler: async (_ctx, { text, apiKey }) => {
    if (!apiKey.trim()) throw new Error("LLM API key is required.");

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        temperature: 0.5,
        max_tokens: 500,
        messages: [
          {
            role: "system",
            content:
              "You are a professional assistant. Distill the following video transcript down into the most important highlights and core concepts. Keep it concise, engaging, and well-structured.",
          },
          {
            role: "user",
            content: `Please summarize this transcript:\n\n${text.slice(0, 100_000)}`,
          },
        ],
      }),
    });

    const data = (await res.json()) as {
      error?: { message?: string };
      choices?: Array<{ message?: { content?: string } }>;
    };

    if (!res.ok) throw new Error(data.error?.message ?? "Failed to summarize transcript.");

    const summary = data.choices?.[0]?.message?.content;
    if (!summary) throw new Error("Empty summary returned from the LLM.");

    return { summary };
  },
});
