import { YoutubeTranscript } from "youtube-transcript";

function extractVideoId(input: string) {
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

async function fetchTranscript(videoId: string) {
  try {
    const chunks = await YoutubeTranscript.fetchTranscript(videoId, { lang: "en" });
    const text = chunks.map((c) => c.text).join(" ").replace(/\s+/g, " ").trim();
    if (text) return text;
  } catch {
    // fallback
  }
  const chunks = await YoutubeTranscript.fetchTranscript(videoId);
  return chunks.map((c) => c.text).join(" ").replace(/\s+/g, " ").trim();
}

export async function onRequestGet(context: { request: Request }) {
  const url = new URL(context.request.url);
  const q = url.searchParams.get("q") ?? "";
  const videoId = extractVideoId(q);

  if (!videoId) {
    return Response.json({ error: "Invalid YouTube URL or video ID." }, { status: 400 });
  }

  try {
    const transcript = await fetchTranscript(videoId);
    if (!transcript) {
      return Response.json({ error: "Transcript not available for this video." }, { status: 400 });
    }
    return Response.json({ videoId, transcript });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to fetch transcript" },
      { status: 400 }
    );
  }
}
