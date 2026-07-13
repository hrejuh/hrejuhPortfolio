import { Copy, Download, FileUp, LockKeyhole, Pencil, Plus, Trash2, WifiOff, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getVaultKey, saveVaultKey } from "@/lib/vault-crypto";
import { deleteVaultObject, loadVaultBytes, loadVaultJson, saveVaultBytes, saveVaultJson, syncVaultObject } from "@/lib/vault-store";
import { TabBar, ToolShell } from "./shared";

type ValueField = { id: string; label: string; value: string };
type RecordEntry = { id: string; kind: "record"; name: string; fields: ValueField[]; createdAt: number };
type FileEntry = { id: string; kind: "file"; name: string; size: number; type?: string; createdAt: number };
type LegacyEntry = { id: string; kind: "password"; name: string; username?: string; password?: string; createdAt: number };
type Entry = RecordEntry | FileEntry;
type Manifest = { version: 2; entries: Entry[] };
const empty: Manifest = { version: 2, entries: [] };
const field = (label = "", value = ""): ValueField => ({ id: crypto.randomUUID(), label, value });

function normalize(value: { entries?: Array<Entry | LegacyEntry> }): Manifest {
  return {
    version: 2,
    entries: (value.entries ?? []).map((entry) => entry.kind !== "password" ? entry : {
      id: entry.id, kind: "record", name: entry.name, createdAt: entry.createdAt,
      fields: [entry.username && field("Username", entry.username), entry.password && field("Password", entry.password)].filter(Boolean) as ValueField[],
    }),
  };
}

const templates: Record<string, string[]> = {
  Login: ["Username / email", "Password"],
  Card: ["Card number", "Name on card", "Expiry", "CVV", "PIN"],
  Identity: ["ID number", "Full name", "Date of birth"],
};

function FilePreview({ entry }: { entry: FileEntry }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (!entry.type?.startsWith("image/")) return;
    let active = true; let objectUrl = "";
    loadVaultBytes(entry.id).then((bytes) => {
      if (!bytes || !active) return;
      objectUrl = URL.createObjectURL(new Blob([bytes as BlobPart], { type: entry.type })); setUrl(objectUrl);
    }).catch(() => undefined);
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [entry.id, entry.type]);
  return <div className="mb-5 flex h-32 items-center justify-center overflow-hidden rounded-xl bg-muted/60">{url ? <img src={url} alt="" className="h-full w-full object-cover"/> : <span className="font-mono text-xs uppercase text-muted-foreground">Encrypted file</span>}</div>;
}

export function VaultTool() {
  const [unlocked, setUnlocked] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const [manifest, setManifest] = useState<Manifest>(empty);
  const [tab, setTab] = useState<"records" | "files">("records");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [fields, setFields] = useState<ValueField[]>([field()]);

  const refresh = async () => setManifest(normalize(await loadVaultJson("manifest", empty)));

  useEffect(() => {
    const status = () => setOnline(navigator.onLine);
    addEventListener("online", status); addEventListener("offline", status);
    getVaultKey().then((key) => { if (key) { setUnlocked(true); refresh().catch((error) => toast.error(error.message)); } });
    return () => { removeEventListener("online", status); removeEventListener("offline", status); };
  }, []);

  useEffect(() => {
    if (!unlocked || !online) return;
    const sync = async () => {
      await syncVaultObject("manifest");
      const latest = normalize(await loadVaultJson("manifest", empty));
      await Promise.all(latest.entries.filter((entry) => entry.kind === "file").map((entry) => syncVaultObject(entry.id)));
      setManifest(latest);
    };
    void sync();
    const timer = setInterval(sync, 10_000);
    return () => clearInterval(timer);
  }, [unlocked, online]);

  const unlock = async (file: File) => {
    const recovery = JSON.parse(await file.text()) as { site?: string; vaultKey?: string };
    if (recovery.site !== "hrejuh.com" || !recovery.vaultKey) throw new Error("Recover the account once to upgrade this older recovery file.");
    await saveVaultKey(recovery.vaultKey); setUnlocked(true); await refresh();
  };

  const commit = async (next: Manifest) => {
    setManifest(next);
    if (!await saveVaultJson("manifest", next)) toast.info("Saved offline. It will sync automatically.");
  };

  const resetForm = () => { setEditingId(null); setName(""); setFields([field()]); };
  const saveRecord = async () => {
    const values = fields.filter((item) => item.label.trim() || item.value.trim());
    if (!name.trim() || !values.length) return toast.error("Add a name and at least one value.");
    const record: RecordEntry = { id: editingId ?? crypto.randomUUID(), kind: "record", name: name.trim(), fields: values, createdAt: Date.now() };
    const entries = editingId ? manifest.entries.map((entry) => entry.id === editingId ? record : entry) : [record, ...manifest.entries];
    await commit({ version: 2, entries }); resetForm(); toast.success("Record saved.");
  };
  const edit = (entry: RecordEntry) => { setEditingId(entry.id); setName(entry.name); setFields(entry.fields.map((item) => ({ ...item }))); scrollTo({ top: 0, behavior: "smooth" }); };
  const remove = async (entry: Entry) => { if (entry.kind === "file") await deleteVaultObject(entry.id); await commit({ version: 2, entries: manifest.entries.filter((item) => item.id !== entry.id) }); };
  const addFile = async (file: File) => {
    const id = crypto.randomUUID();
    const synced = await saveVaultBytes(id, new Uint8Array(await file.arrayBuffer()));
    await commit({ version: 2, entries: [{ id, kind: "file", name: file.name, size: file.size, type: file.type, createdAt: Date.now() }, ...manifest.entries] });
    toast.success(synced ? "Encrypted and stored." : "Saved offline. It will upload automatically.");
  };
  const download = async (entry: FileEntry) => {
    const bytes = await loadVaultBytes(entry.id); if (!bytes) throw new Error("File not found.");
    const url = URL.createObjectURL(new Blob([bytes as BlobPart])); const link = document.createElement("a"); link.href = url; link.download = entry.name; link.click(); URL.revokeObjectURL(url);
  };
  const copy = (value: string) => navigator.clipboard.writeText(value).then(() => toast.success("Copied."));

  return <ToolShell title="Private Vault" subtitle="A private ledger for logins, cards, identity details, documents, and device transfers. Everything is encrypted before R2 sees it.">
    {!unlocked ? <label className="flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center hover:bg-accent/5">
      <LockKeyhole size={40} className="mb-4 text-accent"/><strong className="font-display text-2xl">Unlock this device</strong><span className="mt-2 max-w-md text-sm text-muted-foreground">Choose your recovery file once. Only its vault key is imported.</span>
      <input type="file" accept=".txt,.json" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) unlock(file).catch((error) => toast.error(error.message)); }}/><span className="mt-5 rounded-xl bg-primary px-5 py-3 text-primary-foreground">Choose recovery file</span>
    </label> : <>
      <div className="mb-5 flex items-center justify-between gap-3"><TabBar tabs={[{ id: "records", label: "Records" }, { id: "files", label: "Files & transfer" }]} active={tab} onChange={setTab}/>{!online && <span className="mb-8 flex items-center gap-1 text-xs text-muted-foreground"><WifiOff size={14}/> Offline</span>}</div>
      {tab === "records" ? <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
        <section className="self-start rounded-2xl border border-border bg-surface-elevated/30 p-5">
          <div className="mb-4 flex items-center justify-between"><p className="editorial-caption">{editingId ? "Edit record" : "New record"}</p>{editingId && <button aria-label="Cancel editing" onClick={resetForm}><X size={17}/></button>}</div>
          <input aria-label="Record name" placeholder="e.g. HDFC card, Aadhaar, GitHub" value={name} onChange={(event) => setName(event.target.value)} className="mb-4 w-full rounded-lg border border-border bg-background p-3 font-medium"/>
          <div className="mb-4 flex flex-wrap gap-2">{Object.entries(templates).map(([label, labels]) => <button key={label} type="button" onClick={() => setFields(labels.map((item) => field(item)))} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:border-accent hover:text-foreground">{label}</button>)}</div>
          <div className="space-y-3">{fields.map((item, index) => <div key={item.id} className="relative grid gap-2 pr-8 sm:grid-cols-[.8fr_1.2fr]"><input aria-label={`Field ${index + 1} label`} placeholder="Label" value={item.label} onChange={(event) => setFields(fields.map((field) => field.id === item.id ? { ...field, label: event.target.value } : field))} className="min-w-0 rounded-lg border border-border bg-background p-3 text-sm"/><input aria-label={`Field ${index + 1} value`} placeholder="Value" value={item.value} onChange={(event) => setFields(fields.map((field) => field.id === item.id ? { ...field, value: event.target.value } : field))} className="min-w-0 rounded-lg border border-border bg-background p-3 text-sm"/><button aria-label="Remove field" onClick={() => setFields(fields.filter((field) => field.id !== item.id))} className="absolute right-1 top-3 text-muted-foreground"><X size={16}/></button></div>)}</div>
          <button onClick={() => setFields([...fields, field()])} className="mt-3 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><Plus size={15}/> Add field</button>
          <button onClick={() => saveRecord().catch((error) => toast.error(error.message))} className="mt-5 w-full rounded-xl bg-primary p-3 font-medium text-primary-foreground">Save record</button>
        </section>
        <div className="space-y-3">{manifest.entries.filter((entry): entry is RecordEntry => entry.kind === "record").map((entry) => <article key={entry.id} className="overflow-hidden rounded-2xl border border-border bg-background"><header className="flex items-center justify-between border-b border-border px-4 py-3"><strong className="font-display text-lg">{entry.name}</strong><div className="flex gap-3"><button aria-label={`Edit ${entry.name}`} onClick={() => edit(entry)}><Pencil size={15}/></button><button aria-label={`Delete ${entry.name}`} onClick={() => remove(entry).catch((error) => toast.error(error.message))}><Trash2 size={15}/></button></div></header><div className="divide-y divide-border">{entry.fields.map((item) => <div key={item.id} className="grid grid-cols-[minmax(5rem,.55fr)_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3"><span className="truncate text-xs uppercase tracking-wide text-muted-foreground">{item.label || "Value"}</span><input readOnly value={item.value} aria-label={`${entry.name} ${item.label || "value"}`} className="min-w-0 bg-transparent font-mono text-sm outline-none"/><button aria-label={`Copy ${item.label || "value"}`} onClick={() => copy(item.value)} className="rounded-lg border border-border p-2 hover:border-accent"><Copy size={15}/></button></div>)}</div></article>)}</div>
      </div> : <div><label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-border p-10 hover:bg-accent/5"><FileUp size={20}/> Encrypt and add a document or image<input type="file" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) addFile(file).catch((error) => toast.error(error.message)); }}/></label><div className="mt-5 grid gap-3 sm:grid-cols-2">{manifest.entries.filter((entry): entry is FileEntry => entry.kind === "file").map((entry) => <article key={entry.id} className="rounded-2xl border border-border p-4"><FilePreview entry={entry}/><strong className="block truncate">{entry.name}</strong><span className="text-xs text-muted-foreground">{(entry.size/1024/1024).toFixed(1)} MB · available across devices</span><div className="mt-4 grid grid-cols-2 gap-2"><button onClick={() => download(entry).catch((error) => toast.error(error.message))} className="flex items-center justify-center gap-1 rounded-lg border border-border p-2 text-sm"><Download size={15}/> Download</button><button onClick={() => remove(entry).catch((error) => toast.error(error.message))} className="flex items-center justify-center gap-1 rounded-lg border border-border p-2 text-sm text-muted-foreground"><Trash2 size={15}/> Delete</button></div></article>)}</div></div>}
    </>}
  </ToolShell>;
}
