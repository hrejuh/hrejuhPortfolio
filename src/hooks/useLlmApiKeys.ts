import { useCallback, useEffect, useState } from "react";
import {
  addLlmKey,
  listLlmKeys,
  removeLlmKey,
  decryptAllLlmAttempts,
  type LlmKeyRecord,
} from "@/lib/llm-keys";
import type { LlmKeyAttempt, LlmProvider } from "@/lib/llm/providers";

export function useLlmApiKeys() {
  const [keys, setKeys] = useState<LlmKeyRecord[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const list = await listLlmKeys();
    setKeys(list);
    return list;
  }, []);

  useEffect(() => {
    refresh().finally(() => setReady(true));
  }, [refresh]);

  const addKey = useCallback(
    async (plain: string, label = "", provider: LlmProvider = "auto") => {
      const record = await addLlmKey(plain, label, provider);
      await refresh();
      return record;
    },
    [refresh]
  );

  const removeKey = useCallback(
    async (id: string) => {
      await removeLlmKey(id);
      await refresh();
    },
    [refresh]
  );

  const getDecryptedAttempts = useCallback(async (): Promise<LlmKeyAttempt[]> => {
    return decryptAllLlmAttempts(keys);
  }, [keys]);

  return { keys, ready, addKey, removeKey, getDecryptedAttempts, refresh };
}
