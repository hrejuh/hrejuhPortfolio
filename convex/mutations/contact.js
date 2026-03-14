import { mutation } from "../_generated/server";
import { v } from "convex/values";
export const submitContact = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        subject: v.string(),
        message: v.string(),
        ipHash: v.optional(v.string()),
        userAgent: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Rate limit: max 3 per IP per hour
        if (args.ipHash) {
            const windowStart = Date.now() - 60 * 60 * 1000;
            const existing = await ctx.db
                .query("contactRateLimits")
                .withIndex("by_ip_hash", (q) => q.eq("ipHash", args.ipHash))
                .first();
            if (existing) {
                if (existing.windowStart > windowStart && existing.count >= 3) {
                    throw new Error("Rate limit exceeded. Please try again later.");
                }
                if (existing.windowStart <= windowStart) {
                    await ctx.db.patch(existing._id, { count: 1, windowStart: Date.now() });
                }
                else {
                    await ctx.db.patch(existing._id, { count: existing.count + 1 });
                }
            }
            else {
                await ctx.db.insert("contactRateLimits", {
                    ipHash: args.ipHash,
                    count: 1,
                    windowStart: Date.now(),
                });
            }
        }
        if (args.message.length < 10)
            throw new Error("Message too short.");
        if (args.message.length > 5000)
            throw new Error("Message too long.");
        return await ctx.db.insert("contacts", {
            name: args.name.trim(),
            email: args.email.toLowerCase().trim(),
            subject: args.subject.trim(),
            message: args.message.trim(),
            status: "new",
            ipHash: args.ipHash,
            userAgent: args.userAgent,
            submittedAt: Date.now(),
        });
    },
});
