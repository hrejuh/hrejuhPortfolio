import { fetchInnertubeTranscript } from "../../lib/innertube-transcript";

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

export async function onRequestGet(context: { request: Request }) {
  const url = new URL(context.request.url);
  const q = url.searchParams.get("q") ?? "";
  const videoId = extractVideoId(q);

  if (!videoId) {
    return Response.json({ error: "Invalid YouTube URL or video ID." }, { status: 400 });
  }

  try {
    let transcript: string | null = null;
    try {
      transcript = await fetchInnertubeTranscript(videoId, "en");
    } catch {
      transcript = await fetchInnertubeTranscript(videoId);
    }

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
