import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { LlmKeyRecord } from "@/lib/llm-keys";
import type { LlmProvider } from "@/lib/llm/providers";

const PROVIDER_OPTIONS: Array<{ value: LlmProvider; label: string }> = [
  { value: "auto", label: "Auto-detect" },
  { value: "groq", label: "Groq" },
  { value: "cerebras", label: "Cerebras" },
  { value: "gemini", label: "Gemini" },
  { value: "openrouter", label: "OpenRouter" },
];

type LlmKeyPanelProps = {
  keys: LlmKeyRecord[];
  ready: boolean;
  onAdd: (plain: string, label: string, provider: LlmProvider) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  compact?: boolean;
};

export function LlmKeyPanel({ keys, ready, onAdd, onRemove, compact }: LlmKeyPanelProps) {
  const [draftKey, setDraftKey] = useState("");
  const [draftLabel, setDraftLabel] = useState("");
  const [draftProvider, setDraftProvider] = useState<LlmProvider>("auto");
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftKey.trim()) {
      toast.error("Enter an LLM API key to save.");
      return;
    }
    setAdding(true);
    try {
      await onAdd(draftKey.trim(), draftLabel.trim(), draftProvider);
      setDraftKey("");
      setDraftLabel("");
      setDraftProvider("auto");
      toast.success("Key saved securely.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save key.");
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await onRemove(id);
      toast.success("Key removed.");
    } catch {
      toast.error("Could not remove key.");
    }
  };

  return (
    <section
      className={
        compact
          ? "rounded-xl border border-border bg-surface-elevated/40 p-4"
          : "rounded-xl border border-border bg-surface-elevated/40 p-5 mb-8"
      }
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
          LLM API keys
        </p>
        {ready && (
          <span className="text-[10px] font-mono text-muted-foreground">
            {keys.length} saved · tried in order · encrypted vault sync
          </span>
        )}
      </div>

      {!ready ? (
        <p className="text-sm text-muted-foreground">Loading keys…</p>
      ) : (
        <>
          {keys.length > 0 && (
            <ul className="space-y-2 mb-4">
              {keys.map((key, index) => (
                <li
                  key={key.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/50 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-[10px] font-mono text-muted-foreground uppercase">
                      #{index + 1} · {key.provider}
                    </p>
                    <p className="font-mono text-sm tracking-wide truncate">{key.hint}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{key.label}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(key.id)}
                    className="shrink-0 p-1.5 text-muted-foreground hover:text-error transition-colors"
                    aria-label={`Remove ${key.label}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-2">
            <div className="w-[120px] min-w-[100px]">
              <label
                htmlFor="llm-key-provider"
                className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block mb-1"
              >
                Provider
              </label>
              <select
                id="llm-key-provider"
                value={draftProvider}
                onChange={(e) => setDraftProvider(e.target.value as LlmProvider)}
                className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent h-[38px]"
              >
                {PROVIDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[100px]">
              <label
                htmlFor="llm-key-label"
                className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block mb-1"
              >
                Label
              </label>
              <input
                id="llm-key-label"
                type="text"
                value={draftLabel}
                onChange={(e) => setDraftLabel(e.target.value)}
                placeholder="Optional"
                autoComplete="off"
                className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div className="flex-[2] min-w-[160px]">
              <label
                htmlFor="llm-key-draft"
                className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block mb-1"
              >
                New key
              </label>
              <input
                id="llm-key-draft"
                type="password"
                value={draftKey}
                onChange={(e) => setDraftKey(e.target.value)}
                placeholder="Paste once — never shown again"
                autoComplete="new-password"
                className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <button
              type="submit"
              disabled={adding || !draftKey.trim()}
              className="inline-flex items-center gap-1.5 border border-border px-3 py-2 text-xs font-mono uppercase tracking-wider hover:bg-surface-elevated transition-colors disabled:opacity-50 h-[38px]"
            >
              <Plus size={14} />
              Add
            </button>
          </form>
        </>
      )}
    </section>
  );
}
