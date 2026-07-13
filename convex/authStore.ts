import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const saveChallenge = internalMutation({
  args: {
    challengeId: v.string(),
    challenge: v.string(),
    purpose: v.union(v.literal("register"), v.literal("add-device"), v.literal("login")),
    userId: v.optional(v.string()),
    userHandle: v.optional(v.string()),
    origin: v.string(),
    expiresAt: v.number(),
  },
  handler: (ctx, args) => ctx.db.insert("authChallenges", args),
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
