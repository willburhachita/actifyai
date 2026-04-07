import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createOrder = mutation({
  args: {
    auth0Id: v.string(),
    productId: v.optional(v.id("products")),
    shopId: v.optional(v.id("shops")),
    tokenAmount: v.number(),
    walletAddress: v.string(),
    productTitle: v.string(),
    shopLabel: v.string(),
    productImage: v.optional(v.string()),
    escrowTxHash: v.optional(v.string()),
    ebayItemId: v.optional(v.string()),
    ebayListingUrl: v.optional(v.string()),
    ebayCheckoutUrl: v.optional(v.string()),
    escrowComId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth0Id", (q) => q.eq("auth0Id", args.auth0Id))
      .unique();
    if (!user) throw new Error("User not found");

    const orderId = await ctx.db.insert("purchaseOrders", {
      userId: user._id,
      shopId: args.shopId,
      productId: args.productId,
      status: args.escrowTxHash ? "escrowed" : "pending",
      tokenAmount: args.tokenAmount,
      walletAddress: args.walletAddress,
      escrowTxHash: args.escrowTxHash,
      productTitle: args.productTitle,
      shopLabel: args.shopLabel,
      productImage: args.productImage,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Deduct from wallet balance
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
    if (wallet) {
      await ctx.db.patch(wallet._id, {
        tokenBalance: Math.max(0, wallet.tokenBalance - args.tokenAmount),
      });
    }

    await ctx.db.insert("activityLog", {
      userId: user._id,
      orderId,
      type: "action",
      title: "Purchase initiated",
      detail: `${args.tokenAmount} ACT locked in escrow for ${args.productTitle} from ${args.shopLabel}.`,
      createdAt: Date.now(),
    });

    return orderId;
  },
});

export const getMyOrders = query({
  args: { auth0Id: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth0Id", (q) => q.eq("auth0Id", args.auth0Id))
      .unique();
    if (!user) return [];

    return await ctx.db
      .query("purchaseOrders")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50);
  },
});

export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("purchaseOrders"),
    auth0Id: v.string(),
    status: v.string(),
    txHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_auth0Id", (q) => q.eq("auth0Id", args.auth0Id))
      .unique();
    if (!user || user._id !== order.userId) throw new Error("Unauthorized");

    const updates: Record<string, unknown> = {
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.status === "escrowed" && args.txHash) {
      updates.escrowTxHash = args.txHash;
    }
    if (args.status === "completed" && args.txHash) {
      updates.releaseTxHash = args.txHash;
    }

    await ctx.db.patch(args.orderId, updates);

    // If refunded, restore wallet balance
    if (args.status === "refunded") {
      const wallet = await ctx.db
        .query("wallets")
        .withIndex("by_userId", (q) => q.eq("userId", order.userId))
        .unique();
      if (wallet) {
        await ctx.db.patch(wallet._id, {
          tokenBalance: wallet.tokenBalance + order.tokenAmount,
        });
      }
    }

    const statusLabels: Record<string, string> = {
      escrowed: "Tokens locked in escrow",
      completed: "Funds released — purchase complete",
      disputed: "Dispute opened",
      refunded: "Tokens refunded to wallet",
    };

    await ctx.db.insert("activityLog", {
      userId: order.userId,
      orderId: args.orderId,
      type: args.status === "completed" ? "action" : args.status === "refunded" ? "error" : "system",
      title: statusLabels[args.status] ?? "Order updated",
      detail: `Order for ${order.productTitle} — status: ${args.status}.${args.txHash ? ` Tx: ${args.txHash.slice(0, 10)}...` : ""}`,
      createdAt: Date.now(),
    });
  },
});

export const getOrderById = query({
  args: { orderId: v.id("purchaseOrders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.orderId);
  },
});
