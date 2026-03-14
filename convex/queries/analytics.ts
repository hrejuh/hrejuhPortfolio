import { query } from "../_generated/server";
import { v } from "convex/values";

export const getPageViewStats = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, { days = 30 }) => {
    const since = Date.now() - days * 24 * 60 * 60 * 1000;
    const views = await ctx.db
      .query("pageViews")
      .withIndex("by_timestamp", (q) => q.gte("timestamp", since))
      .collect();

    const byPage = views.reduce<Record<string, number>>((acc, v) => {
      acc[v.page] = (acc[v.page] ?? 0) + 1;
      return acc;
    }, {});

    return { total: views.length, byPage };
  },
});

export const getTopProjects = query({
  args: {},
  handler: async (ctx) => {
    const clicks = await ctx.db.query("projectClicks").collect();
    const byProject = clicks.reduce<Record<string, number>>((acc, c) => {
      acc[c.projectSlug] = (acc[c.projectSlug] ?? 0) + 1;
      return acc;
    }, {});
    return byProject;
  },
});
