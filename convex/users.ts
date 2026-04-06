import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getPreference = query({
  args: { auth0Id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_auth0Id", (q) => q.eq("auth0Id", args.auth0Id))
      .unique();
  },
});

export const syncAuth0User = mutation({
  args: {
    auth0Id: v.string(),
    name: v.string(),
    email: v.string(),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_auth0Id", (q) => q.eq("auth0Id", args.auth0Id))
      .unique();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        name: args.name,
        email: args.email,
        ...(args.avatar !== undefined && { avatar: args.avatar }),
      });
      return existingUser._id;
    }

    return await ctx.db.insert("users", {
      auth0Id: args.auth0Id,
      name: args.name,
      email: args.email,
      avatar: args.avatar,
      maxBudget: 250,
      allowedActions: ["browse", "compare", "draft_purchase", "execute_purchase"],
      allowedCategories: ["electronics", "fashion", "home", "sports", "collectibles"],
      verifiedOnly: true,
      approvalThreshold: 50,
      agentPaused: false,
    });
  },
});

export const updatePreference = mutation({
  args: {
    auth0Id: v.string(),
    maxBudget: v.optional(v.number()),
    approvalThreshold: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth0Id", (q) => q.eq("auth0Id", args.auth0Id))
      .unique();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      ...(args.maxBudget !== undefined && { maxBudget: args.maxBudget }),
      ...(args.approvalThreshold !== undefined && { approvalThreshold: args.approvalThreshold }),
    });
  },
});

export const updateAvatar = mutation({
  args: {
    auth0Id: v.string(),
    avatar: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth0Id", (q) => q.eq("auth0Id", args.auth0Id))
      .unique();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, { avatar: args.avatar });
  },
});
