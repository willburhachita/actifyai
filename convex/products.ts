import { query } from "./_generated/server";
import { v } from "convex/values";

export const getProductById = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.productId);
  },
});

export const getProductsByShop = query({
  args: { shopId: v.id("shops") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_shopId", (q) => q.eq("shopId", args.shopId))
      .take(20);
  },
});
