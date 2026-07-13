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
  purpose: "register" | "add-device" | "login";
  userId?: string;
  userHandle?: string;
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

const token = (bytes = 32) => randomBytes(bytes).toString("base64url");
const hash = (value: string) => createHash("sha256").update(value).digest("base64url");

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

function recoveryFile(userId: string, recoveryKey: string) {
  return { version: 1, site: "hrejuh.com", userId, recoveryKey };
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
  args: { origin: v.string(), challengeId: v.string(), response: v.any(), sessionToken: v.optional(v.string()) },
  handler: async (ctx, { origin: requestedOrigin, challengeId, response, sessionToken }): Promise<
    { userId: string; addedDevice: true } |
    { userId: string; sessionToken: string; recoveryFile: ReturnType<typeof recoveryFile> }
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

    const recoveryKey = token(32);
    const newSessionToken = token(32);
    await ctx.runMutation(internal.authStore.finishNewRegistration, {
      ...common,
      userHandle: challenge.userHandle,
      recoveryHash: hash(recoveryKey),
      tokenHash: hash(newSessionToken),
      expiresAt: Date.now() + SESSION_MS,
    });
    return { userId: challenge.userId, sessionToken: newSessionToken, recoveryFile: recoveryFile(challenge.userId, recoveryKey) };
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
  args: { userId: v.string(), recoveryKey: v.string() },
  handler: async (ctx, { userId, recoveryKey }) => {
    if (!/^hj_[A-Za-z0-9_-]{16}$/.test(userId) || recoveryKey.length < 40) throw new Error("Invalid recovery file.");
    const newRecoveryKey = token(32);
    const sessionToken = token(32);
    const now = Date.now();
    const recovered = await ctx.runMutation(internal.authStore.recover, {
      userId,
      recoveryHash: hash(recoveryKey),
      newRecoveryHash: hash(newRecoveryKey),
      tokenHash: hash(sessionToken),
      now,
      expiresAt: now + SESSION_MS,
    });
    if (!recovered) throw new Error("Recovery file not recognized.");
    return { userId, sessionToken, recoveryFile: recoveryFile(userId, newRecoveryKey) };
  },
});

export const logout = action({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    await ctx.runMutation(internal.authStore.logout, { tokenHash: hash(sessionToken) });
    return { ok: true };
  },
});
