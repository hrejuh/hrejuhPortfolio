import {
  decryptSecret,
  encryptSecret,
  loadEncryptedSecret,
  clearEncryptedSecret,
} from "@/lib/secure-storage";
import { inferProvider, type LlmKeyAttempt, type LlmProvider } from "@/lib/llm/providers";

const LEGACY_KEY_STORAGE = "hrejuh-tools-llm-api-key";
const KEYS_STORAGE = "hrejuh-tools-llm-api-keys";

export type LlmKeyRecord = {
  id: string;
  hint: string;
  label: string;
  provider: import("@/lib/llm/providers").LlmProvider;
  ciphertext: string;
  addedAt: number;
};

/** Mask for display — never reconstructs the full key. */
export function maskKeyHint(key: string): string {
  const k = key.trim();
  if (k.length <= 8) return "••••••••";
  return `${k.slice(0, 4)}••••${k.slice(-4)}`;
}

function newId(): string {
  return crypto.randomUUID();
}

async function loadRecords(): Promise<LlmKeyRecord[]> {
  const raw = localStorage.getItem(KEYS_STORAGE);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as LlmKeyRecord[];
      if (Array.isArray(parsed)) {
        return parsed.map((record) => ({
          ...record,
          provider: record.provider ?? inferProvider("", record.label),
        }));
      }
    } catch {
      localStorage.removeItem(KEYS_STORAGE);
    }
  }

  const legacy = await loadEncryptedSecret(LEGACY_KEY_STORAGE);
  if (legacy?.trim()) {
    const migrated = await addLlmKeyRecord(legacy.trim(), "Saved key");
    await clearEncryptedSecret(LEGACY_KEY_STORAGE);
    return [migrated];
  }

  return [];
}

async function persistRecords(records: LlmKeyRecord[]): Promise<void> {
  localStorage.setItem(KEYS_STORAGE, JSON.stringify(records));
}

async function addLlmKeyRecord(
  plain: string,
  label = "",
  provider: LlmProvider = "auto"
): Promise<LlmKeyRecord> {
  const trimmed = plain.trim();
  if (trimmed.length < 10) {
    throw new Error("API key looks too short.");
  }

  const record: LlmKeyRecord = {
    id: newId(),
    hint: maskKeyHint(trimmed),
    label: label.trim() || inferProvider(trimmed, label),
    provider: provider === "auto" ? inferProvider(trimmed, label) : provider,
    ciphertext: await encryptSecret(trimmed),
    addedAt: Date.now(),
  };

  const records = await loadRecords();
  for (const existing of records) {
    const existingPlain = await decryptLlmKey(existing);
    if (existingPlain === trimmed) {
      throw new Error("This key is already saved.");
    }
  }

  records.push(record);
  await persistRecords(records);
  return record;
}

export async function listLlmKeys(): Promise<LlmKeyRecord[]> {
  return loadRecords();
}

export async function addLlmKey(plain: string, label = "", provider: LlmProvider = "auto") {
  return addLlmKeyRecord(plain, label, provider);
}

export async function removeLlmKey(id: string): Promise<void> {
  const records = await loadRecords();
  await persistRecords(records.filter((r) => r.id !== id));
}

export async function decryptLlmKey(record: LlmKeyRecord): Promise<string | null> {
  return decryptSecret(record.ciphertext);
}

export async function decryptAllLlmKeys(records?: LlmKeyRecord[]): Promise<string[]> {
  const attempts = await decryptAllLlmAttempts(records);
  return attempts.map((a) => a.apiKey);
}

export async function decryptAllLlmAttempts(records?: LlmKeyRecord[]): Promise<LlmKeyAttempt[]> {
  const list = records ?? (await loadRecords());
  const attempts: LlmKeyAttempt[] = [];
  for (const record of list) {
    const plain = await decryptLlmKey(record);
    if (plain?.trim()) {
      attempts.push({
        apiKey: plain.trim(),
        provider: record.provider ?? "auto",
        label: record.label,
      });
    }
  }
  return attempts;
}
