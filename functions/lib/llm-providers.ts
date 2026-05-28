type LlmProvider = "groq" | "cerebras" | "gemini" | "openrouter" | "auto";

export type LlmKeyAttempt = {
  apiKey: string;
  provider: LlmProvider;
  label?: string;
};

const SYSTEM_PROMPT =
  "You are a professional assistant. Distill the following video transcript down into the most important highlights and core concepts. Keep it concise, engaging, and well-structured.";

const PROVIDERS: Record<Exclude<LlmProvider, "auto">, { url: string; model: string }> = {
  groq: {
    url: "https://api.groq.com/openai/v1/chat/completions",
    model: "llama-3.1-8b-instant",
  },
  cerebras: {
    url: "https://api.cerebras.ai/v1/chat/completions",
    model: "llama3.1-8b",
  },
  gemini: {
    url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    model: "gemini-2.0-flash",
  },
  openrouter: {
    url: "https://openrouter.ai/api/v1/chat/completions",
    model: "meta-llama/llama-3.3-70b-instruct:free",
  },
};

function inferProvider(apiKey: string, label = ""): Exclude<LlmProvider, "auto"> {
  const k = apiKey.trim();
  const l = label.toLowerCase();
  if (l.includes("groq") || k.startsWith("gsk_")) return "groq";
  if (l.includes("openrouter") || k.startsWith("sk-or-")) return "openrouter";
  if (l.includes("cerebras") || k.startsWith("csk-")) return "cerebras";
  if (l.includes("gemini") || l.includes("google") || k.startsWith("AIza")) return "gemini";
  return "groq";
}

function resolveProvider(apiKey: string, provider: LlmProvider, label = "") {
  return provider === "auto" ? inferProvider(apiKey, label) : provider;
}

function isRetryableStatus(status: number) {
  return status === 429 || status === 401 || status === 403 || status === 503;
}

async function summarizeWithProvider(text: string, attempt: LlmKeyAttempt): Promise<string> {
  const resolved = resolveProvider(attempt.apiKey, attempt.provider, attempt.label);
  const config = PROVIDERS[resolved];
  const truncated = text.slice(0, 100_000);

  const headers: Record<string, string> = {
    Authorization: `Bearer ${attempt.apiKey.trim()}`,
    "Content-Type": "application/json",
  };
  if (resolved === "openrouter") {
    headers["HTTP-Referer"] = "https://hrejuh.com";
    headers["X-Title"] = "hrejuh YouTube tool";
  }

  const res = await fetch(config.url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: config.model,
      temperature: 0.5,
      max_tokens: 500,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Please summarize this transcript:\n\n${truncated}` },
      ],
    }),
  });

  const data = (await res.json()) as {
    error?: { message?: string };
    choices?: Array<{ message?: { content?: string } }>;
  };

  if (!res.ok) {
    throw Object.assign(new Error(data.error?.message ?? "Failed to summarize transcript."), {
      status: res.status,
    });
  }

  const summary = data.choices?.[0]?.message?.content;
  if (!summary) {
    throw Object.assign(new Error("Empty summary returned from the LLM."), { status: 502 });
  }
  return summary;
}

export async function summarizeWithLlmAttempts(text: string, attempts: LlmKeyAttempt[]) {
  const list = attempts.filter((a) => a.apiKey.trim());
  if (list.length === 0) throw new Error("Add at least one LLM API key to summarize.");

  let lastError: Error & { status?: number } = new Error("All LLM API keys failed.");
  for (const attempt of list) {
    try {
      return await summarizeWithProvider(text, attempt);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      const status = (lastError as Error & { status?: number }).status;
      if (status === undefined || !isRetryableStatus(status)) throw lastError;
    }
  }
  throw lastError;
}

/** Legacy: plain key strings, auto-detect provider. */
export async function summarizeWithLlmKeys(text: string, apiKeys: string[]) {
  return summarizeWithLlmAttempts(
    text,
    apiKeys.map((apiKey) => ({ apiKey, provider: "auto" as const }))
  );
}
