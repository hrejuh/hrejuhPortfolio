import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const saveChallenge = internalMutation({
  args: {
    challengeId: v.string(),
    challenge: v.string(),
    purpose: v.union(v.literal("register"), v.literal("add-device"), v.literal("pair-device"), v.literal("login")),
    userId: v.optional(v.string()),
    userHandle: v.optional(v.string()),
    pairingId: v.optional(v.string()),
    origin: v.string(),
    expiresAt: v.number(),
  },
  handler: (ctx, args) => ctx.db.insert("authChallenges", args),
});

export const createPairing = internalMutation({
  args: { pairingId: v.string(), userId: v.string(), codeHash: v.string(), now: v.number(), expiresAt: v.number() },
  handler: async (ctx, args) => {
    const limitKey = `create:${args.userId}`;
    const limit = await ctx.db.query("authPairRateLimits").withIndex("by_key", q => q.eq("key", limitKey)).unique();
    if (limit && args.now - limit.windowStart < 60 * 60 * 1000 && limit.count >= 5) throw new Error("Too many linking codes. Try again later.");
    if (!limit || args.now - limit.windowStart >= 60 * 60 * 1000) {
      if (limit) await ctx.db.patch(limit._id, { count: 1, windowStart: args.now });
      else await ctx.db.insert("authPairRateLimits", { key: limitKey, count: 1, windowStart: args.now });
    } else await ctx.db.patch(limit._id, { count: limit.count + 1 });
    const active = await ctx.db.query("authPairings").withIndex("by_user_id", q => q.eq("userId", args.userId)).collect();
    for (const pair of active) if (pair.status === "waiting" || pair.status === "pending" || pair.status === "approved") await ctx.db.patch(pair._id, { status: "rejected" });
    await ctx.db.insert("authPairings", { pairingId: args.pairingId, userId: args.userId, codeHash: args.codeHash, status: "waiting", createdAt: args.now, expiresAt: args.expiresAt });
  },
});

export const claimPairing = internalMutation({
  args: { codeHash: v.string(), claimHash: v.string(), fingerprint: v.string(), deviceLabel: v.string(), rateKey: v.string(), now: v.number() },
  handler: async (ctx, args) => {
    const limit = await ctx.db.query("authPairRateLimits").withIndex("by_key", q => q.eq("key", args.rateKey)).unique();
    if (limit && args.now - limit.windowStart < 10 * 60 * 1000 && limit.count >= 10) throw new Error("Too many code attempts. Try again later.");
    if (!limit || args.now - limit.windowStart >= 10 * 60 * 1000) {
      if (limit) await ctx.db.patch(limit._id, { count: 1, windowStart: args.now });
      else await ctx.db.insert("authPairRateLimits", { key: args.rateKey, count: 1, windowStart: args.now });
    } else await ctx.db.patch(limit._id, { count: limit.count + 1 });
    const pair = await ctx.db.query("authPairings").withIndex("by_code_hash", q => q.eq("codeHash", args.codeHash)).unique();
    if (!pair || pair.status !== "waiting" || pair.expiresAt <= args.now) return null;
    await ctx.db.patch(pair._id, { status: "pending", claimHash: args.claimHash, fingerprint: args.fingerprint, deviceLabel: args.deviceLabel });
    return { pairingId: pair.pairingId, fingerprint: args.fingerprint, expiresAt: pair.expiresAt };
  },
});

export const getPairing = internalQuery({
  args: { pairingId: v.string() },
  handler: (ctx, { pairingId }) => ctx.db.query("authPairings").withIndex("by_pairing_id", q => q.eq("pairingId", pairingId)).unique(),
});

export const setPairingStatus = internalMutation({
  args: { pairingId: v.string(), userId: v.string(), status: v.union(v.literal("approved"), v.literal("rejected")) },
  handler: async (ctx, args) => {
    const pair = await ctx.db.query("authPairings").withIndex("by_pairing_id", q => q.eq("pairingId", args.pairingId)).unique();
    if (!pair || pair.userId !== args.userId || pair.status !== "pending" || pair.expiresAt <= Date.now()) throw new Error("This linking request has expired.");
    await ctx.db.patch(pair._id, { status: args.status });
  },
});

export const finishPairedRegistration = internalMutation({
  args: { challengeId: v.string(), pairingId: v.string(), claimHash: v.string(), userId: v.string(), credentialId: v.string(), publicKey: v.array(v.number()), counter: v.number(), transports: v.optional(v.array(v.string())), deviceType: v.string(), backedUp: v.boolean(), tokenHash: v.string(), now: v.number(), expiresAt: v.number() },
  handler: async (ctx, args) => {
    const challenge = await ctx.db.query("authChallenges").withIndex("by_challenge_id", q => q.eq("challengeId", args.challengeId)).unique();
    const pair = await ctx.db.query("authPairings").withIndex("by_pairing_id", q => q.eq("pairingId", args.pairingId)).unique();
    if (!challenge || !pair || pair.status !== "approved" || pair.claimHash !== args.claimHash || pair.userId !== args.userId || pair.expiresAt <= args.now) throw new Error("This linking request has expired.");
    const existing = await ctx.db.query("authCredentials").withIndex("by_credential_id", q => q.eq("credentialId", args.credentialId)).unique();
    if (existing) throw new Error("This passkey is already registered.");
    await ctx.db.insert("authCredentials", { userId: args.userId, credentialId: args.credentialId, publicKey: args.publicKey, counter: args.counter, transports: args.transports, deviceType: args.deviceType, backedUp: args.backedUp, createdAt: args.now });
    await ctx.db.insert("authSessions", { userId: args.userId, tokenHash: args.tokenHash, createdAt: args.now, lastSeenAt: args.now, expiresAt: args.expiresAt });
    await ctx.db.patch(pair._id, { status: "consumed" });
    await ctx.db.delete(challenge._id);
  },
});

export const getChallenge = internalQuery({
  args: { challengeId: v.string() },
  handler: (ctx, { challengeId }) =>
    ctx.db.query("authChallenges").withIndex("by_challenge_id", (q) => q.eq("challengeId", challengeId)).unique(),
});

export const getUser = internalQuery({
  args: { userId: v.string() },
  handler: (ctx, { userId }) =>
    ctx.db.query("authUsers").withIndex("by_user_id", (q) => q.eq("userId", userId)).unique(),
});

export const getCredential = internalQuery({
  args: { credentialId: v.string() },
  handler: (ctx, { credentialId }) =>
    ctx.db.query("authCredentials").withIndex("by_credential_id", (q) => q.eq("credentialId", credentialId)).unique(),
});

export const getCredentials = internalQuery({
  args: { userId: v.string() },
  handler: (ctx, { userId }) =>
    ctx.db.query("authCredentials").withIndex("by_user_id", (q) => q.eq("userId", userId)).collect(),
});

export const useSession = internalMutation({
  args: { tokenHash: v.string(), now: v.number(), expiresAt: v.number() },
  handler: async (ctx, { tokenHash, now, expiresAt }) => {
    const session = await ctx.db.query("authSessions").withIndex("by_token_hash", (q) => q.eq("tokenHash", tokenHash)).unique();
    if (!session || session.expiresAt <= now) {
      if (session) await ctx.db.delete(session._id);
      return null;
    }
    await ctx.db.patch(session._id, { lastSeenAt: now, expiresAt });
    return { userId: session.userId };
  },
});

export const finishNewRegistration = internalMutation({
  args: {
    challengeId: v.string(), userId: v.string(), userHandle: v.string(), recoveryHash: v.string(),
    credentialId: v.string(), publicKey: v.array(v.number()), counter: v.number(),
    transports: v.optional(v.array(v.string())), deviceType: v.string(), backedUp: v.boolean(),
    tokenHash: v.string(), now: v.number(), expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    const challenge = await ctx.db.query("authChallenges").withIndex("by_challenge_id", (q) => q.eq("challengeId", args.challengeId)).unique();
    if (!challenge) throw new Error("This sign-in request has expired.");
    const existing = await ctx.db.query("authCredentials").withIndex("by_credential_id", (q) => q.eq("credentialId", args.credentialId)).unique();
    if (existing) throw new Error("This passkey is already registered.");
    await ctx.db.insert("authUsers", { userId: args.userId, userHandle: args.userHandle, recoveryHash: args.recoveryHash, createdAt: args.now });
    await ctx.db.insert("authCredentials", {
      userId: args.userId, credentialId: args.credentialId, publicKey: args.publicKey, counter: args.counter,
      transports: args.transports, deviceType: args.deviceType, backedUp: args.backedUp, createdAt: args.now,
    });
    await ctx.db.insert("authSessions", { userId: args.userId, tokenHash: args.tokenHash, createdAt: args.now, lastSeenAt: args.now, expiresAt: args.expiresAt });
    await ctx.db.delete(challenge._id);
  },
});

export const finishDeviceRegistration = internalMutation({
  args: {
    challengeId: v.string(), userId: v.string(), credentialId: v.string(), publicKey: v.array(v.number()),
    counter: v.number(), transports: v.optional(v.array(v.string())), deviceType: v.string(), backedUp: v.boolean(), now: v.number(),
  },
  handler: async (ctx, args) => {
    const challenge = await ctx.db.query("authChallenges").withIndex("by_challenge_id", (q) => q.eq("challengeId", args.challengeId)).unique();
    if (!challenge) throw new Error("This device request has expired.");
    const existing = await ctx.db.query("authCredentials").withIndex("by_credential_id", (q) => q.eq("credentialId", args.credentialId)).unique();
    if (existing) throw new Error("This passkey is already registered.");
    await ctx.db.insert("authCredentials", {
      userId: args.userId, credentialId: args.credentialId, publicKey: args.publicKey, counter: args.counter,
      transports: args.transports, deviceType: args.deviceType, backedUp: args.backedUp, createdAt: args.now,
    });
    await ctx.db.delete(challenge._id);
  },
});

export const finishLogin = internalMutation({
  args: { challengeId: v.string(), credentialId: v.string(), counter: v.number(), backedUp: v.boolean(), tokenHash: v.string(), now: v.number(), expiresAt: v.number() },
  handler: async (ctx, args) => {
    const challenge = await ctx.db.query("authChallenges").withIndex("by_challenge_id", (q) => q.eq("challengeId", args.challengeId)).unique();
    const credential = await ctx.db.query("authCredentials").withIndex("by_credential_id", (q) => q.eq("credentialId", args.credentialId)).unique();
    if (!challenge || !credential) throw new Error("This sign-in request has expired.");
    await ctx.db.patch(credential._id, { counter: args.counter, backedUp: args.backedUp });
    await ctx.db.insert("authSessions", { userId: credential.userId, tokenHash: args.tokenHash, createdAt: args.now, lastSeenAt: args.now, expiresAt: args.expiresAt });
    await ctx.db.delete(challenge._id);
    return { userId: credential.userId };
  },
});

export const recover = internalMutation({
  args: { userId: v.string(), recoveryHash: v.string(), newRecoveryHash: v.string(), tokenHash: v.string(), now: v.number(), expiresAt: v.number() },
  handler: async (ctx, args) => {
    const user = await ctx.db.query("authUsers").withIndex("by_user_id", (q) => q.eq("userId", args.userId)).unique();
    if (!user || user.recoveryHash !== args.recoveryHash) return false;
    await ctx.db.patch(user._id, { recoveryHash: args.newRecoveryHash });
    await ctx.db.insert("authSessions", { userId: args.userId, tokenHash: args.tokenHash, createdAt: args.now, lastSeenAt: args.now, expiresAt: args.expiresAt });
    return true;
  },
});

export const logout = internalMutation({
  args: { tokenHash: v.string() },
  handler: async (ctx, { tokenHash }) => {
    const session = await ctx.db.query("authSessions").withIndex("by_token_hash", (q) => q.eq("tokenHash", tokenHash)).unique();
    if (session) await ctx.db.delete(session._id);
  },
});
