const DB = "hrejuh-vault";

function database() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB, 2);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains("keys")) request.result.createObjectStore("keys");
      if (!request.result.objectStoreNames.contains("objects")) request.result.createObjectStore("objects");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export type CachedVaultObject = { data: Uint8Array; pending: boolean };

export async function saveVaultCache(id: string, data: Uint8Array, pending: boolean) {
  const db = await database();
  await new Promise<void>((resolve, reject) => {
    const request = db.transaction("objects", "readwrite").objectStore("objects").put({ data, pending }, id);
    request.onsuccess = () => resolve(); request.onerror = () => reject(request.error);
  });
  db.close();
}

export async function loadVaultCache(id: string) {
  const db = await database();
  const cached = await new Promise<CachedVaultObject | undefined>((resolve, reject) => {
    const request = db.transaction("objects").objectStore("objects").get(id);
    request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
  });
  db.close();
  return cached;
}

export async function deleteVaultCache(id: string) {
  const db = await database();
  await new Promise<void>((resolve, reject) => {
    const request = db.transaction("objects", "readwrite").objectStore("objects").delete(id);
    request.onsuccess = () => resolve(); request.onerror = () => reject(request.error);
  });
  db.close();
}

export async function saveVaultKey(encoded: string) {
  const raw = Uint8Array.from(atob(encoded.replace(/-/g, "+").replace(/_/g, "/")), (char) => char.charCodeAt(0));
  if (raw.length !== 32) throw new Error("Invalid vault recovery key.");
  const key = await crypto.subtle.importKey("raw", raw, "AES-GCM", true, ["encrypt", "decrypt"]);
  const db = await database();
  await new Promise<void>((resolve, reject) => {
    const request = db.transaction("keys", "readwrite").objectStore("keys").put(key, "account");
    request.onsuccess = () => resolve(); request.onerror = () => reject(request.error);
  });
  db.close();
}

export async function getVaultKey() {
  const db = await database();
  const key = await new Promise<CryptoKey | undefined>((resolve, reject) => {
    const request = db.transaction("keys").objectStore("keys").get("account");
    request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
  });
  db.close();
  return key;
}

export async function encryptVault(data: Uint8Array) {
  const key = await getVaultKey();
  if (!key) throw new Error("Unlock your vault first.");
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data as BufferSource));
  const output = new Uint8Array(13 + cipher.length); output[0] = 1; output.set(iv, 1); output.set(cipher, 13);
  return output;
}

export async function decryptVault(data: Uint8Array) {
  const key = await getVaultKey();
  if (!key || data[0] !== 1) throw new Error("Could not decrypt this vault item.");
  return new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv: data.slice(1, 13) }, key, data.slice(13)));
}
