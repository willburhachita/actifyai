import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getWalletByAuth0Id = query({
  args: { auth0Id: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth0Id", (q) => q.eq("auth0Id", args.auth0Id))
      .unique();
    if (!user) return null;
    return await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
  },
});

export const connectWallet = mutation({
  args: {
    auth0Id: v.string(),
    address: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth0Id", (q) => q.eq("auth0Id", args.auth0Id))
      .unique();
    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    if (existing) {
      if (existing.address !== args.address.toLowerCase()) {
        await ctx.db.patch(existing._id, { address: args.address.toLowerCase() });
      }
      return existing._id;
    }

    const walletId = await ctx.db.insert("wallets", {
      userId: user._id,
      address: args.address.toLowerCase(),
      tokenBalance: 100,
      hasClaimed: false,
      connectedAt: Date.now(),
    });

    await ctx.db.insert("activityLog", {
      userId: user._id,
      type: "system",
      title: "Wallet connected",
      detail: `MetaMask wallet ${args.address.slice(0, 6)}...${args.address.slice(-4)} connected. 100 ACT tokens credited.`,
      createdAt: Date.now(),
    });

    return walletId;
  },
});

export const updateBalance = mutation({
  args: {
    auth0Id: v.string(),
    newBalance: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth0Id", (q) => q.eq("auth0Id", args.auth0Id))
      .unique();
    if (!user) throw new Error("User not found");

    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
    if (!wallet) throw new Error("Wallet not found");

    await ctx.db.patch(wallet._id, { tokenBalance: args.newBalance });
  },
});

export const markFaucetClaimed = mutation({
  args: { auth0Id: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth0Id", (q) => q.eq("auth0Id", args.auth0Id))
      .unique();
    if (!user) throw new Error("User not found");

    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
    if (!wallet) throw new Error("Wallet not found");

    await ctx.db.patch(wallet._id, { hasClaimed: true });
  },
});

export const buyTokens = mutation({
  args: {
    auth0Id: v.string(),
    amountACT: v.number(),
    amountETH: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth0Id", (q) => q.eq("auth0Id", args.auth0Id))
      .unique();
    if (!user) throw new Error("User not found");

    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
    if (!wallet) throw new Error("Wallet not found");

    await ctx.db.patch(wallet._id, { tokenBalance: wallet.tokenBalance + args.amountACT });

    await ctx.db.insert("activityLog", {
      userId: user._id,
      type: "action",
      title: "ACT Tokens Purchased",
      detail: `Exchanged ${args.amountETH} ETH for ${args.amountACT} ACT.`,
      createdAt: Date.now(),
    });
  },
});
