const SALT_KEY = "hrejuh-crypto-salt";
const PEPPER = "hrejuh-llm-v1";

async function getAesKey(): Promise<CryptoKey> {
  let saltB64 = localStorage.getItem(SALT_KEY);
  if (!saltB64) {
    saltB64 = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
    localStorage.setItem(SALT_KEY, saltB64);
  }

  const salt = Uint8Array.from(atob(saltB64), (c) => c.charCodeAt(0));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(`${location.origin}:${PEPPER}`),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptSecret(plain: string): Promise<string> {
  const key = await getAesKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(plain)
  );

  return btoa(
    JSON.stringify({
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(cipher)),
    })
  );
}

export async function decryptSecret(encoded: string): Promise<string | null> {
  try {
    const { iv, data } = JSON.parse(atob(encoded)) as { iv: number[]; data: number[] };
    const key = await getAesKey();
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(iv) },
      key,
      new Uint8Array(data)
    );
    return new TextDecoder().decode(plain);
  } catch {
    return null;
  }
}

export async function loadEncryptedSecret(storageKey: string): Promise<string | null> {
  const stored = localStorage.getItem(storageKey);
  if (!stored) return null;
  return decryptSecret(stored);
}

export async function saveEncryptedSecret(storageKey: string, plain: string): Promise<void> {
  if (!plain.trim()) {
    localStorage.removeItem(storageKey);
    return;
  }
  localStorage.setItem(storageKey, await encryptSecret(plain.trim()));
}

export async function clearEncryptedSecret(storageKey: string): Promise<void> {
  localStorage.removeItem(storageKey);
}
