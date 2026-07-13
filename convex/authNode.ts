"use node";

import { createHash, randomBytes } from "node:crypto";
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type AuthenticationResponseJSON,
  type RegistrationResponseJSON,
} from "@simplewebauthn/server";
import { v } from "convex/values";
import { action, type ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";

const SESSION_MS = 15 * 24 * 60 * 60 * 1000;
const CHALLENGE_MS = 5 * 60 * 1000;

type Challenge = {
  challenge: string;
  purpose: "register" | "add-device" | "pair-device" | "login";
  userId?: string;
  userHandle?: string;
  pairingId?: string;
  origin: string;
  expiresAt: number;
};
type StoredCredential = {
  userId: string;
  credentialId: string;
  publicKey: number[];
  counter: number;
  transports?: string[];
};
type Pairing = { pairingId: string; userId: string; claimHash?: string; fingerprint?: string; deviceLabel?: string; requesterPublicKey?: string; vaultEnvelope?: string; status: "waiting" | "pending" | "approved" | "consumed" | "rejected"; expiresAt: number };

const token = (bytes = 32) => randomBytes(bytes).toString("base64url");
const hash = (value: string) => createHash("sha256").update(value).digest("base64url");
const PAIR_ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ";
const pairingCode = () => Array.from(randomBytes(8), byte => PAIR_ALPHABET[byte % PAIR_ALPHABET.length]).join("");

function recoveryFile(userId: string, recoveryKey: string) {
  return { version: 1 as const, site: "hrejuh.com" as const, userId, recoveryKey };
}

function relyingParty(origin: string) {
  const url = new URL(origin);
  const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if ((!local || url.protocol !== "http:") && (url.protocol !== "https:" || !["hrejuh.com", "www.hrejuh.com"].includes(url.hostname))) {
    throw new Error("Authentication is not available on this origin.");
  }
  return { origin: url.origin, rpID: local ? url.hostname : "hrejuh.com" };
}

async function activeUser(ctx: ActionCtx, sessionToken: string): Promise<string> {
  if (!sessionToken) throw new Error("Please sign in again.");
  const now = Date.now();
  const session: { userId: string } | null = await ctx.runMutation(internal.authStore.useSession, {
    tokenHash: hash(sessionToken), now, expiresAt: now + SESSION_MS,
  });
  if (!session) throw new Error("Please sign in again.");
  return session.userId;
}

export const beginRegistration = action({
  args: { origin: v.string(), sessionToken: v.optional(v.string()) },
  handler: async (ctx, { origin: requestedOrigin, sessionToken }) => {
    const { origin, rpID } = relyingParty(requestedOrigin);
    const addingDevice = Boolean(sessionToken);
    const userId = sessionToken ? await activeUser(ctx, sessionToken) : `hj_${token(12)}`;
    const user = addingDevice ? await ctx.runQuery(internal.authStore.getUser, { userId }) : null;
    if (addingDevice && !user) throw new Error("Account not found.");
    const userHandle = user?.userHandle ?? token(32);
    const credentials = addingDevice ? await ctx.runQuery(internal.authStore.getCredentials, { userId }) : [];
    const options = await generateRegistrationOptions({
      rpName: "hrejuh tools",
      rpID,
      userID: new Uint8Array(Buffer.from(userHandle, "base64url")),
      userName: userId,
      userDisplayName: userId,
      attestationType: "none",
      supportedAlgorithmIDs: [-7, -257],
      excludeCredentials: credentials.map((credential: { credentialId: string; transports?: string[] }) => ({
        id: credential.credentialId,
        transports: credential.transports as any,
      })),
      authenticatorSelection: { residentKey: "required", userVerification: "required" },
    });
    const challengeId = token(18);
    await ctx.runMutation(internal.authStore.saveChallenge, {
      challengeId,
      challenge: options.challenge,
      purpose: addingDevice ? "add-device" : "register",
      userId,
      userHandle,
      origin,
      expiresAt: Date.now() + CHALLENGE_MS,
    });
    return { challengeId, options };
  },
});

export const finishRegistration = action({
  args: { origin: v.string(), challengeId: v.string(), response: v.any(), recoveryHash: v.optional(v.string()), sessionToken: v.optional(v.string()) },
  handler: async (ctx, { origin: requestedOrigin, challengeId, response, recoveryHash, sessionToken }): Promise<
    { userId: string; addedDevice: true } |
    { userId: string; sessionToken: string; recoveryFile?: ReturnType<typeof recoveryFile> }
  > => {
    const { origin, rpID } = relyingParty(requestedOrigin);
    const challenge: Challenge | null = await ctx.runQuery(internal.authStore.getChallenge, { challengeId });
    if (!challenge || challenge.expiresAt <= Date.now() || challenge.origin !== origin) throw new Error("This passkey request has expired.");
    if (!challenge.userId || !challenge.userHandle) throw new Error("Invalid passkey request.");
    if ((challenge.purpose === "add-device") !== Boolean(sessionToken)) throw new Error("Invalid passkey request.");
    if (sessionToken && (await activeUser(ctx, sessionToken)) !== challenge.userId) throw new Error("Please sign in again.");

    const verification = await verifyRegistrationResponse({
      response: response as RegistrationResponseJSON,
      expectedChallenge: challenge.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true,
    });
    if (!verification.verified || !verification.registrationInfo) throw new Error("Passkey verification failed.");
    const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;
    const common = {
      challengeId,
      userId: challenge.userId,
      credentialId: credential.id,
      publicKey: Array.from(credential.publicKey),
      counter: credential.counter,
      transports: credential.transports,
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
      now: Date.now(),
    };

    if (challenge.purpose === "add-device") {
      await ctx.runMutation(internal.authStore.finishDeviceRegistration, common);
      return { userId: challenge.userId, addedDevice: true };
    }

    const legacyRecoveryKey = recoveryHash ? undefined : token(32);
    const storedRecoveryHash = recoveryHash ?? hash(legacyRecoveryKey!);
    if (!/^[A-Za-z0-9_-]{43}$/.test(storedRecoveryHash)) throw new Error("Invalid recovery setup.");
    const newSessionToken = token(32);
    await ctx.runMutation(internal.authStore.finishNewRegistration, {
      ...common,
      userHandle: challenge.userHandle,
      recoveryHash: storedRecoveryHash,
      tokenHash: hash(newSessionToken),
      expiresAt: Date.now() + SESSION_MS,
    });
    return { userId: challenge.userId, sessionToken: newSessionToken, ...(legacyRecoveryKey ? { recoveryFile: recoveryFile(challenge.userId, legacyRecoveryKey) } : {}) };
  },
});

export const beginLogin = action({
  args: { origin: v.string() },
  handler: async (ctx, { origin: requestedOrigin }) => {
    const { origin, rpID } = relyingParty(requestedOrigin);
    const options = await generateAuthenticationOptions({ rpID, userVerification: "required" });
    const challengeId = token(18);
    await ctx.runMutation(internal.authStore.saveChallenge, {
      challengeId, challenge: options.challenge, purpose: "login", origin, expiresAt: Date.now() + CHALLENGE_MS,
    });
    return { challengeId, options };
  },
});

export const finishLogin = action({
  args: { origin: v.string(), challengeId: v.string(), response: v.any() },
  handler: async (ctx, { origin: requestedOrigin, challengeId, response }): Promise<{ userId: string; sessionToken: string }> => {
    const { origin, rpID } = relyingParty(requestedOrigin);
    const challenge: Challenge | null = await ctx.runQuery(internal.authStore.getChallenge, { challengeId });
    if (!challenge || challenge.purpose !== "login" || challenge.expiresAt <= Date.now() || challenge.origin !== origin) {
      throw new Error("This sign-in request has expired.");
    }
    const authResponse = response as AuthenticationResponseJSON;
    const credential: StoredCredential | null = await ctx.runQuery(internal.authStore.getCredential, { credentialId: authResponse.id });
    if (!credential) throw new Error("Passkey not recognized.");
    const verification = await verifyAuthenticationResponse({
      response: authResponse,
      expectedChallenge: challenge.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: credential.credentialId,
        publicKey: new Uint8Array(credential.publicKey),
        counter: credential.counter,
        transports: credential.transports as any,
      },
      requireUserVerification: true,
    });
    if (!verification.verified) throw new Error("Passkey verification failed.");
    const sessionToken = token(32);
    const now = Date.now();
    const result: { userId: string } = await ctx.runMutation(internal.authStore.finishLogin, {
      challengeId,
      credentialId: credential.credentialId,
      counter: verification.authenticationInfo.newCounter,
      backedUp: verification.authenticationInfo.credentialBackedUp,
      tokenHash: hash(sessionToken),
      now,
      expiresAt: now + SESSION_MS,
    });
    return { ...result, sessionToken };
  },
});

export const session = action({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }): Promise<{ userId: string; deviceCount: number }> => {
    const userId = await activeUser(ctx, sessionToken);
    const credentials: StoredCredential[] = await ctx.runQuery(internal.authStore.getCredentials, { userId });
    return { userId, deviceCount: credentials.length };
  },
});

export const recoverAccount = action({
  args: { userId: v.string(), recoveryKey: v.optional(v.string()), recoveryHash: v.optional(v.string()), newRecoveryHash: v.optional(v.string()) },
  handler: async (ctx, { userId, recoveryKey, recoveryHash, newRecoveryHash }) => {
    const legacyNewKey = recoveryKey ? token(32) : undefined;
    const currentHash = recoveryHash ?? (recoveryKey ? hash(recoveryKey) : "");
    const replacementHash = newRecoveryHash ?? (legacyNewKey ? hash(legacyNewKey) : "");
    if (!/^hj_[A-Za-z0-9_-]{16}$/.test(userId) || !/^[A-Za-z0-9_-]{43}$/.test(currentHash) || !/^[A-Za-z0-9_-]{43}$/.test(replacementHash)) throw new Error("Invalid recovery file.");
    const sessionToken = token(32);
    const now = Date.now();
    const recovered = await ctx.runMutation(internal.authStore.recover, {
      userId,
      recoveryHash: currentHash,
      newRecoveryHash: replacementHash,
      tokenHash: hash(sessionToken),
      now,
      expiresAt: now + SESSION_MS,
    });
    if (!recovered) throw new Error("Recovery file not recognized.");
    return { userId, sessionToken, ...(legacyNewKey ? { recoveryFile: recoveryFile(userId, legacyNewKey) } : {}) };
  },
});

export const logout = action({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    await ctx.runMutation(internal.authStore.logout, { tokenHash: hash(sessionToken) });
    return { ok: true };
  },
});

export const createPairing = action({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    const userId = await activeUser(ctx, sessionToken);
    const code = pairingCode();
    const pairingId = token(18);
    const now = Date.now();
    await ctx.runMutation(internal.authStore.createPairing, { pairingId, userId, codeHash: hash(code), now, expiresAt: now + CHALLENGE_MS });
    return { pairingId, code: `${code.slice(0, 4)}-${code.slice(4)}`, expiresAt: now + CHALLENGE_MS };
  },
});

export const claimPairing = action({
  args: { code: v.string(), deviceLabel: v.string(), requesterPublicKey: v.string(), rateKey: v.string() },
  handler: async (ctx, args): Promise<{ pairingId: string; fingerprint: string; expiresAt: number; claimToken: string }> => {
    const code = args.code.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (code.length !== 8) throw new Error("Enter the 8-character linking code.");
    const claimToken = token(32);
    const fingerprint = hash(claimToken).replace(/[^A-Z0-9]/gi, "").slice(0, 4).toUpperCase();
    const result: { pairingId: string; fingerprint: string; expiresAt: number } | null = await ctx.runMutation(internal.authStore.claimPairing, {
      codeHash: hash(code), claimHash: hash(claimToken), fingerprint,
      deviceLabel: args.deviceLabel.slice(0, 80), requesterPublicKey: args.requesterPublicKey.slice(0, 1000), rateKey: `claim:${hash(args.rateKey)}`, now: Date.now(),
    });
    if (!result) throw new Error("Code not found or expired.");
    return { ...result, claimToken };
  },
});

export const pairingOwnerStatus = action({
  args: { sessionToken: v.string(), pairingId: v.string() },
  handler: async (ctx, args): Promise<{ status: string; fingerprint?: string; deviceLabel?: string; requesterPublicKey?: string }> => {
    const userId = await activeUser(ctx, args.sessionToken);
    const pair: Pairing | null = await ctx.runQuery(internal.authStore.getPairing, { pairingId: args.pairingId });
    if (!pair || pair.userId !== userId) throw new Error("Linking request not found.");
    return { status: pair.expiresAt <= Date.now() && pair.status !== "consumed" ? "expired" : pair.status, fingerprint: pair.fingerprint, deviceLabel: pair.deviceLabel, requesterPublicKey: pair.requesterPublicKey };
  },
});

export const pairingClaimStatus = action({
  args: { pairingId: v.string(), claimToken: v.string() },
  handler: async (ctx, args): Promise<{ status: string; fingerprint?: string; vaultEnvelope?: string }> => {
    const pair: Pairing | null = await ctx.runQuery(internal.authStore.getPairing, { pairingId: args.pairingId });
    if (!pair || pair.claimHash !== hash(args.claimToken)) throw new Error("Linking request not found.");
    return { status: pair.expiresAt <= Date.now() && pair.status !== "consumed" ? "expired" : pair.status, fingerprint: pair.fingerprint, vaultEnvelope: pair.vaultEnvelope };
  },
});

export const decidePairing = action({
  args: { sessionToken: v.string(), pairingId: v.string(), approve: v.boolean(), vaultEnvelope: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await activeUser(ctx, args.sessionToken);
    if (args.vaultEnvelope && args.vaultEnvelope.length > 4000) throw new Error("Invalid vault transfer.");
    await ctx.runMutation(internal.authStore.setPairingStatus, { pairingId: args.pairingId, userId, status: args.approve ? "approved" : "rejected", vaultEnvelope: args.vaultEnvelope });
    return { ok: true };
  },
});

export const beginPairedRegistration = action({
  args: { origin: v.string(), pairingId: v.string(), claimToken: v.string() },
  handler: async (ctx, args) => {
    const { origin, rpID } = relyingParty(args.origin);
    const pair = await ctx.runQuery(internal.authStore.getPairing, { pairingId: args.pairingId });
    if (!pair || pair.status !== "approved" || pair.claimHash !== hash(args.claimToken) || pair.expiresAt <= Date.now()) throw new Error("This linking request has not been approved.");
    const user = await ctx.runQuery(internal.authStore.getUser, { userId: pair.userId });
    if (!user) throw new Error("Account not found.");
    const credentials = await ctx.runQuery(internal.authStore.getCredentials, { userId: pair.userId });
    const options = await generateRegistrationOptions({
      rpName: "hrejuh tools", rpID, userID: new Uint8Array(Buffer.from(user.userHandle, "base64url")), userName: pair.userId, userDisplayName: pair.userId,
      attestationType: "none", supportedAlgorithmIDs: [-7, -257],
      excludeCredentials: credentials.map((credential: { credentialId: string; transports?: string[] }) => ({ id: credential.credentialId, transports: credential.transports as any })),
      authenticatorSelection: { residentKey: "required", userVerification: "required" },
    });
    const challengeId = token(18);
    await ctx.runMutation(internal.authStore.saveChallenge, { challengeId, challenge: options.challenge, purpose: "pair-device", userId: pair.userId, userHandle: user.userHandle, pairingId: pair.pairingId, origin, expiresAt: Date.now() + CHALLENGE_MS });
    return { challengeId, options };
  },
});

export const finishPairedRegistration = action({
  args: { origin: v.string(), challengeId: v.string(), pairingId: v.string(), claimToken: v.string(), response: v.any() },
  handler: async (ctx, args): Promise<{ userId: string; sessionToken: string }> => {
    const { origin, rpID } = relyingParty(args.origin);
    const challenge: (Challenge & { pairingId?: string }) | null = await ctx.runQuery(internal.authStore.getChallenge, { challengeId: args.challengeId });
    if (!challenge || challenge.purpose !== "pair-device" || challenge.pairingId !== args.pairingId || challenge.expiresAt <= Date.now() || challenge.origin !== origin || !challenge.userId) throw new Error("This linking request has expired.");
    const verification = await verifyRegistrationResponse({ response: args.response as RegistrationResponseJSON, expectedChallenge: challenge.challenge, expectedOrigin: origin, expectedRPID: rpID, requireUserVerification: true });
    if (!verification.verified || !verification.registrationInfo) throw new Error("Passkey verification failed.");
    const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;
    const sessionToken = token(32); const now = Date.now();
    await ctx.runMutation(internal.authStore.finishPairedRegistration, {
      challengeId: args.challengeId, pairingId: args.pairingId, claimHash: hash(args.claimToken), userId: challenge.userId,
      credentialId: credential.id, publicKey: Array.from(credential.publicKey), counter: credential.counter, transports: credential.transports,
      deviceType: credentialDeviceType, backedUp: credentialBackedUp, tokenHash: hash(sessionToken), now, expiresAt: now + SESSION_MS,
    });
    return { userId: challenge.userId, sessionToken };
  },
});
