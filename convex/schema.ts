import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  authUsers: defineTable({
    userId: v.string(),
    userHandle: v.string(),
    recoveryHash: v.string(),
    createdAt: v.number(),
  }).index("by_user_id", ["userId"]),

  authCredentials: defineTable({
    userId: v.string(),
    credentialId: v.string(),
    publicKey: v.array(v.number()),
    counter: v.number(),
    transports: v.optional(v.array(v.string())),
    deviceType: v.string(),
    backedUp: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_credential_id", ["credentialId"]),

  authChallenges: defineTable({
    challengeId: v.string(),
    challenge: v.string(),
    purpose: v.union(v.literal("register"), v.literal("add-device"), v.literal("pair-device"), v.literal("login")),
    userId: v.optional(v.string()),
    userHandle: v.optional(v.string()),
    pairingId: v.optional(v.string()),
    origin: v.string(),
    expiresAt: v.number(),
  }).index("by_challenge_id", ["challengeId"]),

  authSessions: defineTable({
    userId: v.string(),
    tokenHash: v.string(),
    expiresAt: v.number(),
    lastSeenAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_token_hash", ["tokenHash"])
    .index("by_user_id", ["userId"]),

  authPairings: defineTable({
    pairingId: v.string(),
    userId: v.string(),
    codeHash: v.string(),
    claimHash: v.optional(v.string()),
    fingerprint: v.optional(v.string()),
    deviceLabel: v.optional(v.string()),
    status: v.union(v.literal("waiting"), v.literal("pending"), v.literal("approved"), v.literal("consumed"), v.literal("rejected")),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_pairing_id", ["pairingId"])
    .index("by_code_hash", ["codeHash"])
    .index("by_user_id", ["userId"]),

  authPairRateLimits: defineTable({
    key: v.string(), count: v.number(), windowStart: v.number(),
  }).index("by_key", ["key"]),

  contacts: defineTable({
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
    status: v.union(
      v.literal("new"),
      v.literal("read"),
      v.literal("replied"),
      v.literal("archived")
    ),
    ipHash: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    submittedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_submitted_at", ["submittedAt"]),

  pageViews: defineTable({
    page: v.string(),
    referrer: v.optional(v.string()),
    country: v.optional(v.string()),
    sessionId: v.string(),
    timestamp: v.number(),
    duration: v.optional(v.number()),
  })
    .index("by_page", ["page"])
    .index("by_timestamp", ["timestamp"])
    .index("by_session", ["sessionId"]),

  projectClicks: defineTable({
    projectSlug: v.string(),
    clickType: v.union(
      v.literal("card"),
      v.literal("github"),
      v.literal("live"),
      v.literal("detail")
    ),
    sessionId: v.string(),
    timestamp: v.number(),
  })
    .index("by_project", ["projectSlug"])
    .index("by_timestamp", ["timestamp"]),

  contactRateLimits: defineTable({
    ipHash: v.string(),
    count: v.number(),
    windowStart: v.number(),
  }).index("by_ip_hash", ["ipHash"]),
});
