import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
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
