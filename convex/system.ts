import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getConfig = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const config = await ctx.db
      .query("systemConfig")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    return config?.value ?? null;
  },
});

export const setConfig = mutation({
  args: { key: v.string(), value: v.string() },
  handler: async (ctx, args) => {
    const config = await ctx.db
      .query("systemConfig")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    if (config) {
      await ctx.db.patch(config._id, { value: args.value });
    } else {
      await ctx.db.insert("systemConfig", { key: args.key, value: args.value });
    }
  },
});
