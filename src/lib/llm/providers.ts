export type LlmProvider = "groq" | "cerebras" | "gemini" | "openrouter" | "auto";

export type LlmKeyAttempt = {
  apiKey: string;
  provider: LlmProvider;
  label?: string;
};

const SYSTEM_PROMPT =
  "You are a professional assistant. Distill the following video transcript down into the most important highlights and core concepts. Keep it concise, engaging, and well-structured.";

type ProviderConfig = {
  url: string;
  model: string;
  extraHeaders?: Record<string, string>;
};

const PROVIDERS: Record<Exclude<LlmProvider, "auto">, ProviderConfig> = {
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
    extraHeaders: {
      "HTTP-Referer": typeof location !== "undefined" ? location.origin : "https://hrejuh.com",
      "X-Title": "hrejuh YouTube tool",
    },
  },
};

export function inferProvider(apiKey: string, label = ""): Exclude<LlmProvider, "auto"> {
  const k = apiKey.trim();
  const l = label.toLowerCase();

  if (l.includes("groq") || k.startsWith("gsk_")) return "groq";
  if (l.includes("openrouter") || k.startsWith("sk-or-")) return "openrouter";
  if (l.includes("cerebras") || k.startsWith("csk-")) return "cerebras";
  if (l.includes("gemini") || l.includes("google") || k.startsWith("AIza")) return "gemini";

  return "groq";
}

export function resolveProvider(
  apiKey: string,
  provider: LlmProvider,
  label = ""
): Exclude<LlmProvider, "auto"> {
  return provider === "auto" ? inferProvider(apiKey, label) : provider;
}

function isRetryableStatus(status?: number): boolean {
  return status === 429 || status === 401 || status === 403 || status === 503;
}

export async function summarizeWithProvider(
  text: string,
  apiKey: string,
  provider: LlmProvider,
  label = ""
): Promise<string> {
  const resolved = resolveProvider(apiKey, provider, label);
  const config = PROVIDERS[resolved];
  const truncated = text.slice(0, 100_000);

  const res = await fetch(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey.trim()}`,
      "Content-Type": "application/json",
      ...config.extraHeaders,
    },
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
    const err = new Error(data.error?.message ?? "Failed to summarize transcript.") as Error & {
      status?: number;
      provider?: string;
    };
    err.status = res.status;
    err.provider = resolved;
    throw err;
  }

  const summary = data.choices?.[0]?.message?.content;
  if (!summary) {
    const err = new Error("Empty summary returned from the LLM.") as Error & {
      status?: number;
      provider?: string;
    };
    err.status = 502;
    err.provider = resolved;
    throw err;
  }

  return summary;
}

export async function summarizeWithLlmAttempts(
  text: string,
  attempts: LlmKeyAttempt[]
): Promise<string> {
  const list = attempts.filter((a) => a.apiKey.trim());
  if (list.length === 0) {
    throw new Error("Add at least one LLM API key to summarize.");
  }

  let lastError: Error | null = null;
  for (const attempt of list) {
    try {
      return await summarizeWithProvider(text, attempt.apiKey, attempt.provider, attempt.label);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      const status = (lastError as Error & { status?: number }).status;
      if (!isRetryableStatus(status)) throw lastError;
    }
  }

  throw lastError ?? new Error("All LLM API keys failed.");
}

/** @deprecated Use summarizeWithLlmAttempts */
export async function summarizeWithLlmKeys(text: string, apiKeys: string[]): Promise<string> {
  return summarizeWithLlmAttempts(
    text,
    apiKeys.map((apiKey) => ({ apiKey, provider: "auto" as const }))
  );
}

export { isRetryableStatus, SYSTEM_PROMPT, PROVIDERS };
