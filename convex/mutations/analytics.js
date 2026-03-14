import { mutation } from "../_generated/server";
import { v } from "convex/values";
export const recordPageView = mutation({
    args: {
        page: v.string(),
        referrer: v.optional(v.string()),
        country: v.optional(v.string()),
        sessionId: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("pageViews", {
            page: args.page,
            referrer: args.referrer,
            country: args.country,
            sessionId: args.sessionId,
            timestamp: Date.now(),
        });
    },
});
export const updatePageDuration = mutation({
    args: {
        sessionId: v.string(),
        page: v.string(),
        duration: v.number(),
    },
    handler: async (ctx, args) => {
        const view = await ctx.db
            .query("pageViews")
            .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
            .order("desc")
            .first();
        if (view && view.page === args.page) {
            await ctx.db.patch(view._id, { duration: args.duration });
        }
    },
});
export const recordProjectClick = mutation({
    args: {
        projectSlug: v.string(),
        clickType: v.union(v.literal("card"), v.literal("github"), v.literal("live"), v.literal("detail")),
        sessionId: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("projectClicks", {
            projectSlug: args.projectSlug,
            clickType: args.clickType,
            sessionId: args.sessionId,
            timestamp: Date.now(),
        });
    },
});
