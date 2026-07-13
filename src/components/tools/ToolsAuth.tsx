import { startAuthentication, startRegistration } from "@simplewebauthn/browser";
import { KeyRound, Link2, LogOut, ShieldCheck, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Account = { userId: string; deviceCount: number };
type Ceremony = { challengeId: string; options: any };
type RecoveryFile = { version: 1; site: "hrejuh.com"; userId: string; recoveryKey: string };

async function authRequest<T>(body: Record<string, unknown>): Promise<T> {
  const response = await fetch("/api/auth", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(data.error ?? "Authentication failed.");
  return data;
}

function downloadRecoveryFile(file: RecoveryFile) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(file, null, 2)], { type: "text/plain" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "hrejuh-recovery-key.txt";
  link.click();
  URL.revokeObjectURL(url);
}

export function ToolsAuth() {
  const dialog = useRef<HTMLDialogElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    authRequest<Account>({ op: "session" }).then(setAccount).catch(() => setAccount(null));
  }, []);

  const run = async (work: () => Promise<void>) => {
    setBusy(true);
    setMessage("");
    try { await work(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Authentication failed."); }
    finally { setBusy(false); }
  };

  const register = () => run(async () => {
    const start = await authRequest<Ceremony>({ op: "register-options" });
    const response = await startRegistration({ optionsJSON: start.options });
    const result = await authRequest<Account & { recoveryFile: RecoveryFile }>({ op: "register-verify", challengeId: start.challengeId, response });
    downloadRecoveryFile(result.recoveryFile);
    setAccount({ userId: result.userId, deviceCount: 1 });
    setMessage("Account created. Keep the downloaded recovery file somewhere safe.");
  });

  const signIn = () => run(async () => {
    const start = await authRequest<Ceremony>({ op: "login-options" });
    const response = await startAuthentication({ optionsJSON: start.options });
    const result = await authRequest<{ userId: string }>({ op: "login-verify", challengeId: start.challengeId, response });
    const fresh = await authRequest<Account>({ op: "session" });
    setAccount(fresh);
    setMessage(`Signed in as ${result.userId}.`);
  });

  const addDevice = () => run(async () => {
    const start = await authRequest<Ceremony>({ op: "device-options" });
    const response = await startRegistration({ optionsJSON: start.options });
    await authRequest({ op: "device-verify", challengeId: start.challengeId, response });
    setAccount(await authRequest<Account>({ op: "session" }));
    setMessage("Passkey added. The browser may sync it, or keep it on the device you selected.");
  });

  const recover = (file: File) => run(async () => {
    if (file.size > 10_000) throw new Error("Invalid recovery file.");
    const recovery = JSON.parse(await file.text()) as RecoveryFile;
    if (recovery.version !== 1 || recovery.site !== "hrejuh.com") throw new Error("Invalid recovery file.");
    const result = await authRequest<{ userId: string; recoveryFile: RecoveryFile }>({ op: "recover", recovery });
    downloadRecoveryFile(result.recoveryFile);
    setAccount(await authRequest<Account>({ op: "session" }));
    setMessage(`Access restored for ${result.userId}. Your replacement recovery file was downloaded; the old one no longer works.`);
  });

  const signOut = () => run(async () => {
    await authRequest({ op: "logout" });
    setAccount(null);
    setMessage("Signed out. Your passkey can sign you back in anytime.");
  });

  return (
    <>
      <button
        onClick={() => dialog.current?.showModal()}
        className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-background px-4 py-2 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
      >
        {account ? <ShieldCheck size={16} /> : <KeyRound size={16} />}
        {account ? "Account" : "Sign in"}
      </button>

      <dialog ref={dialog} className="m-auto w-[min(92vw,30rem)] rounded-2xl border border-border bg-background p-0 text-foreground shadow-2xl backdrop:bg-black/60">
        <div className="p-6 md:p-8">
          <button onClick={() => dialog.current?.close()} aria-label="Close" className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
            <X size={18} />
          </button>

          <p className="editorial-caption mb-3">Private access</p>
          <h2 className="font-display text-3xl font-bold">{account ? "Your account" : "No email. No password."}</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {account
              ? "This browser stays signed in while you use it. After 15 days without a visit, your passkey is required again."
              : "A passkey creates an anonymous account and signs you in with your device lock. We never receive your fingerprint, face, or private key."}
          </p>

          {account ? (
            <div className="mt-6 space-y-3">
              <div className="rounded-xl border border-border bg-muted p-4">
                <span className="block font-mono text-xs uppercase tracking-wider text-muted-foreground">Anonymous ID</span>
                <span className="mt-1 block break-all font-mono text-sm">{account.userId}</span>
                <span className="mt-3 block text-xs text-muted-foreground">{account.deviceCount} registered {account.deviceCount === 1 ? "passkey" : "passkeys"}</span>
              </div>
              <button disabled={busy} onClick={addDevice} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground disabled:opacity-50">
                <Link2 size={18} /> Add another device
              </button>
              <button disabled={busy} onClick={signOut} className="flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50">
                <LogOut size={16} /> Sign out
              </button>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              <button disabled={busy} onClick={signIn} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground disabled:opacity-50">
                <KeyRound size={18} /> Sign in with a passkey
              </button>
              <button disabled={busy} onClick={register} className="w-full rounded-xl border border-border px-4 py-3 text-sm font-medium hover:border-accent disabled:opacity-50">
                Create anonymous account
              </button>
              <button disabled={busy} onClick={() => fileInput.current?.click()} className="flex w-full items-center justify-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50">
                <Upload size={16} /> Use recovery file
              </button>
              <input
                ref={fileInput}
                type="file"
                accept=".txt,.json,text/plain,application/json"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) recover(file);
                  event.target.value = "";
                }}
              />
              <p className="pt-2 text-xs leading-5 text-muted-foreground">
                One recovery file exists per account. Using it replaces it; the previous copy becomes invalid.
              </p>
            </div>
          )}

          {message && <p role="status" className="mt-4 rounded-lg bg-muted px-3 py-2 text-sm leading-5">{message}</p>}
        </div>
      </dialog>
    </>
  );
}
