import { startAuthentication, startRegistration } from "@simplewebauthn/browser";
import { Check, KeyRound, Link2, LogOut, ShieldCheck, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Account = { userId: string; deviceCount: number };
type Ceremony = { challengeId: string; options: any };
type RecoveryFile = { version: 1; site: "hrejuh.com"; userId: string; recoveryKey: string };
type OwnerPair = { pairingId: string; code: string; expiresAt: number; status?: string; fingerprint?: string; deviceLabel?: string };
type ClaimPair = { pairingId: string; claimToken: string; fingerprint: string; status?: string };

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
  const [ownerPair, setOwnerPair] = useState<OwnerPair | null>(null);
  const [claimPair, setClaimPair] = useState<ClaimPair | null>(null);
  const [pairCode, setPairCode] = useState("");

  useEffect(() => {
    authRequest<Account>({ op: "session" }).then(setAccount).catch(() => setAccount(null));
  }, []);

  useEffect(() => {
    if (!ownerPair || ["consumed", "rejected", "expired"].includes(ownerPair.status ?? "")) return;
    const timer = window.setInterval(async () => {
      try {
        const status = await authRequest<Partial<OwnerPair>>({ op: "pair-owner-status", pairingId: ownerPair.pairingId });
        setOwnerPair(current => current ? { ...current, ...status } : null);
      } catch { /* session message is handled on the next action */ }
    }, 2000);
    return () => window.clearInterval(timer);
  }, [ownerPair?.pairingId, ownerPair?.status]);

  useEffect(() => {
    if (!claimPair || claimPair.status === "approved") return;
    const timer = window.setInterval(async () => {
      try {
        const status = await authRequest<{ status: string }>({ op: "pair-claim-status", pairingId: claimPair.pairingId, claimToken: claimPair.claimToken });
        setClaimPair(current => current ? { ...current, ...status } : null);
      } catch { /* expiry is shown by the server state */ }
    }, 2000);
    return () => window.clearInterval(timer);
  }, [claimPair?.pairingId, claimPair?.status]);

  useEffect(() => {
    if (claimPair?.status !== "approved") return;
    run(async () => {
      const start = await authRequest<Ceremony>({ op: "pair-register-options", pairingId: claimPair.pairingId, claimToken: claimPair.claimToken });
      const response = await startRegistration({ optionsJSON: start.options });
      await authRequest({ op: "pair-register-verify", challengeId: start.challengeId, pairingId: claimPair.pairingId, claimToken: claimPair.claimToken, response });
      setAccount(await authRequest<Account>({ op: "session" }));
      setClaimPair(null);
      setMessage("Device linked and signed in.");
    });
  }, [claimPair?.status]);

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

  const createPair = () => run(async () => {
    setOwnerPair(await authRequest<OwnerPair>({ op: "pair-create" }));
    setMessage("Enter this code on the new device. Nothing happens until you approve it here.");
  });

  const claimLink = () => run(async () => {
    const result = await authRequest<ClaimPair>({ op: "pair-claim", code: pairCode, deviceLabel: `${navigator.platform || "Device"} · ${navigator.userAgent.includes("Firefox") ? "Firefox" : navigator.userAgent.includes("Edg") ? "Edge" : "Browser"}` });
    setClaimPair({ ...result, status: "pending" });
    setMessage("Check that the confirmation letters match, then approve on your signed-in device.");
  });

  const decidePair = (approve: boolean) => run(async () => {
    if (!ownerPair) return;
    await authRequest({ op: "pair-decide", pairingId: ownerPair.pairingId, approve });
    setOwnerPair({ ...ownerPair, status: approve ? "approved" : "rejected" });
    setMessage(approve ? "Approved. The new device will now create its own passkey." : "Request rejected.");
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
                <KeyRound size={18} /> Add a passkey on this device
              </button>
              {!ownerPair ? (
                <button disabled={busy} onClick={createPair} className="flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 font-medium hover:border-accent disabled:opacity-50">
                  <Link2 size={18} /> Link another device
                </button>
              ) : (
                <div className="rounded-xl border border-border p-4 text-center">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Linking code · expires in 5 minutes</p>
                  <p data-testid="pair-code" className="my-3 font-mono text-3xl font-bold tracking-widest">{ownerPair.code}</p>
                  {ownerPair.status === "pending" && <>
                    <p className="text-sm">{ownerPair.deviceLabel}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Confirm these letters on both devices</p>
                    <p data-testid="owner-fingerprint" className="my-2 font-mono text-2xl font-bold tracking-[.35em]">{ownerPair.fingerprint}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => decidePair(false)} className="rounded-lg border border-border px-3 py-2">Reject</button>
                      <button onClick={() => decidePair(true)} className="flex items-center justify-center gap-1 rounded-lg bg-primary px-3 py-2 text-primary-foreground"><Check size={16}/> Approve</button>
                    </div>
                  </>}
                  {ownerPair.status && ownerPair.status !== "pending" && ownerPair.status !== "waiting" && <p className="text-sm capitalize">{ownerPair.status}</p>}
                </div>
              )}
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
              {!claimPair ? <div className="rounded-xl border border-border p-3">
                <label className="mb-2 block text-xs font-medium text-muted-foreground">Link this device using a code</label>
                <div className="flex gap-2">
                  <input value={pairCode} onChange={event => setPairCode(event.target.value.toUpperCase())} maxLength={9} placeholder="ABCD-EFGH" className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 font-mono uppercase tracking-wider" />
                  <button disabled={busy || pairCode.replace(/\W/g, "").length !== 8} onClick={claimLink} className="rounded-lg bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50">Continue</button>
                </div>
              </div> : <div className="rounded-xl border border-border p-4 text-center">
                <p className="text-xs text-muted-foreground">Confirm these letters on your signed-in device</p>
                <p data-testid="claim-fingerprint" className="my-2 font-mono text-2xl font-bold tracking-[.35em]">{claimPair.fingerprint}</p>
                <p className="text-sm capitalize">{claimPair.status === "pending" ? "Waiting for approval…" : claimPair.status}</p>
              </div>}
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
