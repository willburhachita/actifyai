import { action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const REAL_BRANDS = [
  { name: "Apple", desc: "Creator of the iPhone, iPad, and Mac.", color: "#ffffff", categories: ["smartphones", "laptops", "tablets"] },
  { name: "Nike", desc: "Premium athletic footwear, apparel, and equipment.", color: "#fa5400", categories: ["mens-shoes", "womens-shoes", "sports-accessories"] },
  { name: "Sony", desc: "Electronics, PlayStation, audio, and camera gear.", color: "#0066ff", categories: ["laptops", "smartphones", "mobile-accessories"] },
  { name: "IKEA", desc: "Ready-to-assemble furniture, kitchen appliances and home accessories.", color: "#0051ba", categories: ["furniture", "home-decoration"] },
  { name: "Sephora", desc: "Premium cosmetics and beauty products.", color: "#000000", categories: ["skincare", "fragrances", "beauty"] },
  { name: "Best Buy", desc: "Expert service. Unbeatable price.", color: "#0046be", categories: ["laptops", "smartphones", "tablets"] },
  { name: "Target", desc: "Expect More. Pay Less.", color: "#cc0000", categories: ["groceries", "home-decoration", "tops", "womens-dresses"] },
  { name: "Gucci", desc: "Italian luxury brand of fashion and leather goods.", color: "#d8a520", categories: ["sunglasses", "womens-bags", "womens-dresses"] },
  { name: "Rolex", desc: "Swiss luxury watch manufacturer.", color: "#006400", categories: ["mens-watches", "womens-watches"] },
  { name: "Whole Foods", desc: "America's Healthiest Grocery Store.", color: "#006400", categories: ["groceries"] },
  { name: "Tesla", desc: "Electric cars, giant batteries and solar.", color: "#e82127", categories: ["automotive", "motorcycle"] },
  { name: "GameStop", desc: "Power to the Players.", color: "#e31837", categories: ["smartphones", "laptops"] },
  { name: "Zara", desc: "The latest fashion trends for women, men, kids and TRF.", color: "#000000", categories: ["tops", "womens-dresses", "mens-shirts"] },
  { name: "Adidas", desc: "Impossible is Nothing. Sports clothing and shoes.", color: "#111111", categories: ["mens-shoes", "mens-shirts"] },
  { name: "Samsung", desc: "Galaxy phones, TVs, and home appliances.", color: "#1428a0", categories: ["smartphones", "laptops", "tablets"] }
];

const SUFFIXES = ["Flagship", "Atrium", "District", "Plaza", "Central", "Hub", "Center", "Square", "Gallery", "Boutique"];

export const populateMarketplace = action({
  args: {},
  handler: async (ctx) => {
    // Fetch 150 real mock products containing accurate images and realistic text via mapping matching
    let productsData: any[] = [];
    try {
        const res = await fetch("https://dummyjson.com/products?limit=150");
        const json = await res.json();
        productsData = json.products || [];
    } catch(e) {
        // Fallback or retry
    }

    // Create 100 Solid Commercial Brand Shops
    const shops = [];
    for (let i = 0; i < 100; i++) {
      const brand = REAL_BRANDS[Math.floor(Math.random() * REAL_BRANDS.length)];
      const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
      shops.push({
        slug: `shop-${brand.name.toLowerCase().replace(/ /g, '-')}-${i}`,
        label: `${brand.name} ${suffix}`,
        description: brand.desc,
        source: brand.name,
        verified: Math.random() > 0.1, // Major brands highly likely to be verified
        color: brand.color,
      });
      
      // Keep track of what brand this shop was so we can assign intelligent category products
      (shops as any)[shops.length-1]._brandCategories = brand.categories;
    }

    // Distribute products (intelligently matching Dummy JSON mock pools to the Brand category scope)
    const productInserts = [];
    for (let i = 0; i < shops.length; i++) {
        const shop = shops[i] as any;
        
        // Find pool of highly relevant products
        let matchedPool = productsData.filter(p => shop._brandCategories.includes(p.category));
        // Fallback to totally random products if the API category wasn't found so shops aren't ever empty
        if (matchedPool.length === 0) matchedPool = productsData;

        const numProducts = Math.floor(Math.random() * 4) + 2; // 2 to 5 products
        for (let p = 0; p < numProducts; p++) {
            const prod = matchedPool[Math.floor(Math.random() * matchedPool.length)];
            productInserts.push({
                shopIndex: i, // temp relational mapping
                title: prod.title,
                handle: `prod-${prod.id}-${i}-${p}`,
                description: prod.description,
                vendor: shop.source, 
                price: prod.price,
                currencyCode: "USD",
                availableForSale: true,
                image: prod.thumbnail, // Genuine thumbnail URL
            });
        }
        delete shop._brandCategories; // remove temp injection
    }

    // Call internal mutation to securely wipe and insert everything into the DB
    await ctx.runMutation((internal as any).seed.insertData, {
      shops,
      products: productInserts,
    });

    return "Successfully generated 100 branded corporate city hubs perfectly linked to visually rich dummy products!";
  },
});

export const insertData = internalMutation({
  args: {
    shops: v.any(),
    products: v.any(),
  },
  handler: async (ctx, args) => {
    // Clear old ones completely (refresh)
    const oldShops = await ctx.db.query("shops").collect();
    for (const s of oldShops) await ctx.db.delete(s._id);
    
    const oldProducts = await ctx.db.query("products").collect();
    for (const p of oldProducts) await ctx.db.delete(p._id);

    // Insert new
    for (let i = 0; i < args.shops.length; i++) {
      const shopId = await ctx.db.insert("shops", args.shops[i]);
      
      // Find and insert assigned products
      const assigned = args.products.filter((p: any) => p.shopIndex === i);
      for (const prod of assigned) {
        delete prod.shopIndex; // remove temporary mapping
        prod.shopId = shopId;
        await ctx.db.insert("products", prod);
      }
    }
  },
});
