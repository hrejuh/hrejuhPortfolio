import { query } from "../_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("contacts")
      .withIndex("by_submitted_at")
      .order("desc")
      .take(100);
  },
});
