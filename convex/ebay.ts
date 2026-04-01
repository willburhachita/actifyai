import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getEbayConnection = query({
  args: { auth0Id: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth0Id", (q) => q.eq("auth0Id", args.auth0Id))
      .unique();
    if (!user) return null;
    const conn = await ctx.db
      .query("ebayConnections")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
    if (!conn) return null;
    // Return without the raw tokens for security
    return {
      _id: conn._id,
      ebayUsername: conn.ebayUsername,
      connectedAt: conn.connectedAt,
      tokenExpiry: conn.tokenExpiry,
      isExpired: Date.now() > conn.tokenExpiry,
    };
  },
});

export const upsertEbayConnection = mutation({
  args: {
    auth0Id: v.string(),
    accessToken: v.string(),
    refreshToken: v.string(),
    tokenExpiry: v.number(),
    scope: v.string(),
    ebayUsername: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth0Id", (q) => q.eq("auth0Id", args.auth0Id))
      .unique();
    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("ebayConnections")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    const data = {
      userId: user._id,
      accessToken: args.accessToken,
      refreshToken: args.refreshToken,
      tokenExpiry: args.tokenExpiry,
      scope: args.scope,
      ebayUsername: args.ebayUsername,
      connectedAt: existing?.connectedAt ?? Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    }
    const connId = await ctx.db.insert("ebayConnections", data);

    await ctx.db.insert("activityLog", {
      userId: user._id,
      type: "system",
      title: "eBay account connected",
      detail: `eBay account${args.ebayUsername ? ` (${args.ebayUsername})` : ""} linked to Actify AI.`,
      createdAt: Date.now(),
    });

    return connId;
  },
});

export const getEbayTokens = query({
  args: { auth0Id: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth0Id", (q) => q.eq("auth0Id", args.auth0Id))
      .unique();
    if (!user) return null;
    return await ctx.db
      .query("ebayConnections")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
  },
});

export const disconnectEbay = mutation({
  args: { auth0Id: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth0Id", (q) => q.eq("auth0Id", args.auth0Id))
      .unique();
    if (!user) throw new Error("User not found");

    const conn = await ctx.db
      .query("ebayConnections")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
    if (conn) await ctx.db.delete(conn._id);

    await ctx.db.insert("activityLog", {
      userId: user._id,
      type: "system",
      title: "eBay account disconnected",
      detail: "eBay connection removed from Actify AI.",
      createdAt: Date.now(),
    });
  },
});
