import { query } from "./_generated/server";
import { v } from "convex/values";

// Simplified format for the 3D world iframe
export const getAllShopsWithProducts = query({
  handler: async (ctx) => {
    const shops = await ctx.db.query("shops").take(100);
    const shopsWithProducts = await Promise.all(
      shops.map(async (shop) => {
        const products = await ctx.db
          .query("products")
          .withIndex("by_shopId", (q) => q.eq("shopId", shop._id))
          .collect();
        return {
          name: shop.label,
          category: shop.source,
          desc: shop.description,
          color: shop.color,
          ai: "Generated AI recommendation insights.",
          products: products.map(p => ({
            name: p.title,
            price: `$${p.price}`,
            rating: "4.5",
            desc: p.description,
            tags: [p.vendor.substring(0, 10), "AI Pick"],
          }))
        };
      })
    );
    return shopsWithProducts;
  },
});

// Full data format for dashboard panels (includes IDs)
export const getShopsWithFullProducts = query({
  handler: async (ctx) => {
    const shops = await ctx.db.query("shops").take(100);
    return await Promise.all(
      shops.map(async (shop) => {
        const products = await ctx.db
          .query("products")
          .withIndex("by_shopId", (q) => q.eq("shopId", shop._id))
          .take(10);
        return { ...shop, products };
      })
    );
  },
});

export const getShopById = query({
  args: { shopId: v.id("shops") },
  handler: async (ctx, args) => {
    const shop = await ctx.db.get(args.shopId);
    if (!shop) return null;
    const products = await ctx.db
      .query("products")
      .withIndex("by_shopId", (q) => q.eq("shopId", shop._id))
      .take(10);
    return { ...shop, products };
  },
});
