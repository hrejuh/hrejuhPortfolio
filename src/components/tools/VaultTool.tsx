import { Download, Eye, EyeOff, FileUp, KeyRound, LockKeyhole, Plus, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { decryptVault, encryptVault, getVaultKey, saveVaultKey } from "@/lib/vault-crypto";
import { TabBar, ToolShell } from "./shared";

type Entry = { id: string; kind: "password" | "file"; name: string; username?: string; password?: string; size?: number; createdAt: number };
type Manifest = { version: 1; entries: Entry[] };
const empty: Manifest = { version: 1, entries: [] };

async function object(id: string, init?: RequestInit) {
  const response = await fetch(`/api/vault?id=${encodeURIComponent(id)}`, { credentials: "same-origin", ...init });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error((await response.json().catch(() => null))?.error ?? await response.text());
  return response;
}

async function loadManifest() {
  const response = await object("manifest");
  if (!response) return empty;
  return JSON.parse(new TextDecoder().decode(await decryptVault(new Uint8Array(await response.arrayBuffer())))) as Manifest;
}

async function saveManifest(manifest: Manifest) {
  await object("manifest", { method: "PUT", headers: { "Content-Type": "application/octet-stream" }, body: await encryptVault(new TextEncoder().encode(JSON.stringify(manifest))) as BodyInit });
}

export function VaultTool() {
  const [unlocked, setUnlocked] = useState(false);
  const [manifest, setManifest] = useState<Manifest>(empty);
  const [tab, setTab] = useState<"passwords" | "files">("passwords");
  const [name, setName] = useState(""); const [username, setUsername] = useState(""); const [password, setPassword] = useState("");
  const [visible, setVisible] = useState<string | null>(null);

  useEffect(() => { getVaultKey().then((key) => { if (key) { setUnlocked(true); loadManifest().then(setManifest).catch((error) => toast.error(error.message)); } }); }, []);

  const unlock = async (file: File) => {
    const recovery = JSON.parse(await file.text()) as { site?: string; vaultKey?: string };
    if (recovery.site !== "hrejuh.com" || !recovery.vaultKey) throw new Error("This recovery file predates the vault. Recover the account once to upgrade it.");
    await saveVaultKey(recovery.vaultKey); setUnlocked(true); setManifest(await loadManifest());
  };

  const commit = async (next: Manifest) => { await saveManifest(next); setManifest(next); };
  const addPassword = async () => {
    if (!name || !password) return toast.error("Add a name and password.");
    const next = { ...manifest, entries: [{ id: crypto.randomUUID(), kind: "password" as const, name, username, password, createdAt: Date.now() }, ...manifest.entries] };
    await commit(next); setName(""); setUsername(""); setPassword(""); toast.success("Password saved.");
  };
  const addFile = async (file: File) => {
    const id = crypto.randomUUID();
    await object(id, { method: "PUT", headers: { "Content-Type": "application/octet-stream" }, body: await encryptVault(new Uint8Array(await file.arrayBuffer())) as BodyInit });
    await commit({ ...manifest, entries: [{ id, kind: "file", name: file.name, size: file.size, createdAt: Date.now() }, ...manifest.entries] });
    toast.success("File encrypted and stored.");
  };
  const remove = async (entry: Entry) => { if (entry.kind === "file") await object(entry.id, { method: "DELETE" }); await commit({ ...manifest, entries: manifest.entries.filter((item) => item.id !== entry.id) }); };
  const download = async (entry: Entry) => { const response = await object(entry.id); if (!response) throw new Error("File not found."); const bytes = await decryptVault(new Uint8Array(await response.arrayBuffer())); const url = URL.createObjectURL(new Blob([bytes as BlobPart])); const link = document.createElement("a"); link.href = url; link.download = entry.name; link.click(); URL.revokeObjectURL(url); };

  return <ToolShell title="Private Vault" subtitle="Passwords, images, documents, and device transfers—encrypted in this browser before Cloudflare R2 sees them.">
    {!unlocked ? <label className="flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center hover:bg-accent/5">
      <LockKeyhole size={40} className="mb-4 text-accent"/><strong className="font-display text-2xl">Unlock this device</strong><span className="mt-2 max-w-md text-sm text-muted-foreground">Choose your recovery file once. Only its vault key is imported; the account recovery key is not stored.</span>
      <input type="file" accept=".txt,.json" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) unlock(file).catch((error) => toast.error(error.message)); }}/><span className="mt-5 rounded-xl bg-primary px-5 py-3 text-primary-foreground">Choose recovery file</span>
    </label> : <>
      <TabBar tabs={[{ id: "passwords", label: "Passwords" }, { id: "files", label: "Files & transfer" }]} active={tab} onChange={setTab}/>
      {tab === "passwords" ? <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <div className="space-y-3 rounded-2xl border border-border p-5"><input aria-label="Name" placeholder="GitHub" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-border bg-background p-3"/><input aria-label="Username" placeholder="Username or email" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-lg border border-border bg-background p-3"/><input aria-label="Password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-border bg-background p-3"/><button onClick={() => addPassword().catch((e) => toast.error(e.message))} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary p-3 text-primary-foreground"><Plus size={17}/>Save password</button></div>
        <div className="space-y-3">{manifest.entries.filter((e) => e.kind === "password").map((entry) => <div key={entry.id} className="rounded-xl border border-border p-4"><div className="flex items-center justify-between"><div><strong>{entry.name}</strong><p className="text-sm text-muted-foreground">{entry.username}</p></div><button aria-label="Delete" onClick={() => remove(entry)}><Trash2 size={16}/></button></div><div className="mt-3 flex items-center gap-2 rounded-lg bg-muted p-2 font-mono text-sm"><span className="flex-1 truncate">{visible === entry.id ? entry.password : "••••••••••••"}</span><button aria-label="Show password" onClick={() => setVisible(visible === entry.id ? null : entry.id)}>{visible === entry.id ? <EyeOff size={16}/> : <Eye size={16}/>}</button><button aria-label="Copy password" onClick={() => navigator.clipboard.writeText(entry.password ?? "").then(() => toast.success("Copied."))}><KeyRound size={16}/></button></div></div>)}</div>
      </div> : <div><label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border p-8 hover:bg-accent/5"><FileUp size={20}/> Encrypt and upload<input type="file" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) addFile(file).catch((e) => toast.error(e.message)); }}/></label><div className="mt-5 space-y-2">{manifest.entries.filter((e) => e.kind === "file").map((entry) => <div key={entry.id} className="flex items-center gap-3 rounded-xl border border-border p-4"><Upload size={18}/><div className="min-w-0 flex-1"><strong className="block truncate">{entry.name}</strong><span className="text-xs text-muted-foreground">{((entry.size ?? 0)/1024/1024).toFixed(1)} MB · available on your signed-in devices</span></div><button aria-label="Download" onClick={() => download(entry).catch((e) => toast.error(e.message))}><Download size={18}/></button><button aria-label="Delete" onClick={() => remove(entry).catch((e) => toast.error(e.message))}><Trash2 size={18}/></button></div>)}</div></div>}
    </>}
  </ToolShell>;
}
