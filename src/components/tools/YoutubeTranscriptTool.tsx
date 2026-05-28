import { useState } from "react";
import { toast } from "sonner";
import { Copy, Loader2, Sparkles } from "lucide-react";
import { ToolShell, Field } from "./shared";
import { cn } from "@/lib/utils";
import { useLlmApiKeys } from "@/hooks/useLlmApiKeys";
import { LlmKeyPanel } from "./LlmKeyPanel";
import type { LlmKeyAttempt, LlmProvider } from "@/lib/llm/providers";

async function fetchTranscript(query: string) {
  const res = await fetch(`/api/youtube/transcript?q=${encodeURIComponent(query)}`);
  const data = (await res.json()) as { videoId?: string; transcript?: string; error?: string };
  if (!res.ok) throw new Error(data.error ?? "Failed to fetch transcript");
  return { videoId: data.videoId!, transcript: data.transcript! };
}

async function summarizeTranscript(text: string, attempts: LlmKeyAttempt[]) {
  const res = await fetch("/api/youtube/summarize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, attempts }),
  });
  const data = (await res.json()) as { summary?: string; error?: string };
  if (!res.ok) throw new Error(data.error ?? "Summarization failed");
  return data.summary!;
}

export function YoutubeTranscriptTool() {
  const { keys, ready, addKey, removeKey, getDecryptedAttempts } = useLlmApiKeys();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [rawTranscript, setRawTranscript] = useState("");
  const [displayText, setDisplayText] = useState("");
  const [videoId, setVideoId] = useState("");
  const [isSummary, setIsSummary] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleAddKey = async (plain: string, label: string, provider: LlmProvider) => {
    await addKey(plain, label, provider);
  };

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setShowResults(false);
    try {
      const result = await fetchTranscript(query.trim());
      setRawTranscript(result.transcript);
      setDisplayText(result.transcript);
      setVideoId(result.videoId);
      setIsSummary(false);
      setShowResults(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch transcript");
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (isSummary) {
      setDisplayText(rawTranscript);
      setIsSummary(false);
      return;
    }

    const attempts = await getDecryptedAttempts();
    if (attempts.length === 0) {
      toast.error("Add at least one LLM API key to summarize.");
      return;
    }

    setSummarizing(true);
    try {
      const summary = await summarizeTranscript(rawTranscript, attempts);
      setDisplayText(summary);
      setIsSummary(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Summarization failed");
    } finally {
      setSummarizing(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(displayText);
    toast.success("Copied to clipboard");
  };

  const handleReset = () => {
    setShowResults(false);
    setQuery("");
    setRawTranscript("");
    setDisplayText("");
    setVideoId("");
    setIsSummary(false);
  };

  return (
    <ToolShell
      title="Transcripts."
      subtitle="Paste a YouTube URL or 11-character video ID. Optional LLM summarization — keys are encrypted in this browser only, tried in order, and never shown again after saving."
    >
      <LlmKeyPanel
        keys={keys}
        ready={ready}
        onAdd={handleAddKey}
        onRemove={removeKey}
        compact={showResults}
      />

      {!showResults ? (
        <form onSubmit={handleFetch} className="max-w-2xl">
          <Field
            id="yt-query"
            label="YouTube URL or Video ID"
            type="text"
            value={query}
            onChange={setQuery}
            placeholder="https://youtube.com/watch?v=… or aircAruvnKk"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="mt-6 inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-sm font-mono uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Extract transcript
          </button>
        </form>
      ) : (
        <div>
          <button
            type="button"
            onClick={handleReset}
            className="text-sm text-muted-foreground hover:text-foreground font-mono uppercase tracking-wider mb-6"
          >
            ← New search
          </button>

          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
            <div>
              <h2 className="font-display text-2xl font-bold">
                {isSummary ? "Highlights" : "Transcript"}
              </h2>
              {videoId && (
                <p className="text-xs text-muted-foreground font-mono mt-1">{videoId}</p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSummarize}
                disabled={summarizing || (!isSummary && keys.length === 0)}
                className="inline-flex items-center gap-2 border border-border px-4 py-2 text-xs font-mono uppercase tracking-wider hover:bg-surface-elevated transition-colors disabled:opacity-50"
              >
                {summarizing ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Sparkles size={14} />
                )}
                {isSummary ? "Full transcript" : "Summarize"}
              </button>
            </div>
          </div>

          {summarizing ? (
            <div className="flex flex-col items-center py-16 text-muted-foreground">
              <Loader2 size={24} className="animate-spin mb-3" />
              <p className="text-sm font-mono uppercase tracking-wider">Summarizing…</p>
            </div>
          ) : (
            <div
              className={cn(
                "text-muted-foreground leading-relaxed text-lg font-light whitespace-pre-wrap",
                !isSummary && "font-serif"
              )}
            >
              {displayText}
            </div>
          )}

          {!summarizing && (
            <button
              type="button"
              onClick={handleCopy}
              className="mt-8 inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-sm font-mono uppercase tracking-wider hover:opacity-90"
            >
              <Copy size={14} /> Copy
            </button>
          )}
        </div>
      )}
    </ToolShell>
  );
}
