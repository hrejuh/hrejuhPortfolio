import { summarizeWithLlmAttempts, type LlmKeyAttempt } from "../../lib/llm-providers";

export async function onRequestPost(context: { request: Request }) {
  try {
    const body = (await context.request.json()) as {
      text?: string;
      attempts?: LlmKeyAttempt[];
      apiKeys?: string[];
    };

    const text = body.text;
    let attempts: LlmKeyAttempt[] = [];

    if (body.attempts?.length) {
      attempts = body.attempts;
    } else if (body.apiKeys?.length) {
      attempts = body.apiKeys.map((apiKey) => ({ apiKey, provider: "auto" as const }));
    }

    if (!text || attempts.length === 0) {
      return Response.json({ error: "text and attempts (or apiKeys) required" }, { status: 400 });
    }

    const summary = await summarizeWithLlmAttempts(text, attempts);
    return Response.json({ summary });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Summarization failed";
    return Response.json({ error: message }, { status: 400 });
  }
}
