import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getActivityByAuth0Id = query({
  args: { auth0Id: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth0Id", (q) => q.eq("auth0Id", args.auth0Id))
      .unique();
    if (!user) return [];

    return await ctx.db
      .query("activityLog")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(100);
  },
});

export const logActivity = mutation({
  args: {
    auth0Id: v.string(),
    type: v.string(),
    title: v.string(),
    detail: v.string(),
    orderId: v.optional(v.id("purchaseOrders")),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth0Id", (q) => q.eq("auth0Id", args.auth0Id))
      .unique();
    if (!user) throw new Error("User not found");

    return await ctx.db.insert("activityLog", {
      userId: user._id,
      orderId: args.orderId,
      type: args.type,
      title: args.title,
      detail: args.detail,
      createdAt: Date.now(),
      metadata: args.metadata,
    });
  },
});
