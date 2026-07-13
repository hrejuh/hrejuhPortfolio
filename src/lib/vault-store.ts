import { decryptVault, deleteVaultCache, encryptVault, loadVaultCache, saveVaultCache } from "./vault-crypto";

async function request(id: string, init?: RequestInit) {
  const response = await fetch(`/api/vault?id=${encodeURIComponent(id)}`, { credentials: "same-origin", ...init });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error((await response.json().catch(() => null))?.error ?? await response.text());
  return response;
}

async function upload(id: string, data: Uint8Array) {
  await request(id, { method: "PUT", headers: { "Content-Type": "application/octet-stream" }, body: data as BodyInit });
  await saveVaultCache(id, data, false);
}

export async function syncVaultObject(id: string) {
  const cached = await loadVaultCache(id);
  if (!cached?.pending) return true;
  try { await upload(id, cached.data); return true; } catch { return false; }
}

export async function loadVaultBytes(id: string) {
  const cached = await loadVaultCache(id);
  if (cached?.pending) {
    try { await upload(id, cached.data); } catch { return decryptVault(cached.data); }
    return decryptVault(cached.data);
  }
  try {
    const response = await request(id);
    if (!response) return cached ? decryptVault(cached.data) : null;
    const data = new Uint8Array(await response.arrayBuffer());
    await saveVaultCache(id, data, false);
    return decryptVault(data);
  } catch {
    if (cached) return decryptVault(cached.data);
    throw new Error("This item is not available offline yet.");
  }
}

export async function saveVaultBytes(id: string, plain: Uint8Array) {
  const data = await encryptVault(plain);
  await saveVaultCache(id, data, true);
  try { await upload(id, data); return true; } catch { return false; }
}

export async function deleteVaultObject(id: string) {
  await request(id, { method: "DELETE" });
  await deleteVaultCache(id);
}

export async function loadVaultJson<T>(id: string, fallback: T) {
  const bytes = await loadVaultBytes(id);
  return bytes ? JSON.parse(new TextDecoder().decode(bytes)) as T : fallback;
}

export async function saveVaultJson(id: string, value: unknown) {
  return saveVaultBytes(id, new TextEncoder().encode(JSON.stringify(value)));
}
