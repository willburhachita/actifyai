import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    auth0Id: v.string(),
    name: v.string(),
    email: v.string(),
    avatar: v.optional(v.string()),
    maxBudget: v.number(),
    allowedActions: v.array(v.string()),
    verifiedOnly: v.boolean(),
    approvalThreshold: v.number(),
  }).index("by_auth0Id", ["auth0Id"]),

  shops: defineTable({
    slug: v.string(),
    label: v.string(),
    description: v.string(),
    source: v.string(),
    verified: v.boolean(),
    color: v.string(),
    image: v.optional(v.string()),
  }).index("by_slug", ["slug"]),

  products: defineTable({
    shopId: v.id("shops"),
    title: v.string(),
    handle: v.string(),
    description: v.string(),
    vendor: v.string(),
    price: v.number(),
    currencyCode: v.string(),
    availableForSale: v.boolean(),
    image: v.optional(v.string()),
    variantId: v.optional(v.string()),
    checkoutUrl: v.optional(v.string()),
  }).index("by_shopId", ["shopId"]),

  worldEntities: defineTable({
    entityId: v.string(),
    type: v.string(),
    label: v.string(),
    description: v.string(),
    posX: v.number(),
    posY: v.number(),
    shopId: v.optional(v.id("shops")),
    verified: v.optional(v.boolean()),
    accentColor: v.optional(v.string()),
    metadata: v.optional(v.any()),
  }).index("by_entityId", ["entityId"]),

  agentTasks: defineTable({
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    description: v.string(),
    status: v.string(),
    selectedShopId: v.optional(v.id("shops")),
    selectedProductId: v.optional(v.id("products")),
    explanation: v.optional(v.string()),
    budget: v.number(),
    approvalThreshold: v.number(),
    executionMode: v.optional(v.string()),
    executionMessage: v.optional(v.string()),
    checkoutUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    metadata: v.optional(v.any()),
  }).index("by_userId", ["userId"]),

  approvals: defineTable({
    taskId: v.id("agentTasks"),
    userId: v.id("users"),
    status: v.string(),
    reason: v.string(),
    createdAt: v.number(),
    resolvedAt: v.optional(v.number()),
  }).index("by_taskId", ["taskId"]),

  orders: defineTable({
    taskId: v.id("agentTasks"),
    userId: v.id("users"),
    shopId: v.id("shops"),
    productId: v.id("products"),
    status: v.string(),
    amount: v.number(),
    currencyCode: v.string(),
    checkoutUrl: v.optional(v.string()),
    executionMode: v.string(),
    createdAt: v.number(),
  }).index("by_taskId", ["taskId"]),

  activityLog: defineTable({
    userId: v.id("users"),
    taskId: v.optional(v.id("agentTasks")),
    orderId: v.optional(v.id("purchaseOrders")),
    type: v.string(),
    title: v.string(),
    detail: v.string(),
    createdAt: v.number(),
    metadata: v.optional(v.any()),
  }).index("by_userId", ["userId"]),

  wallets: defineTable({
    userId: v.id("users"),
    address: v.string(),
    tokenBalance: v.number(),
    hasClaimed: v.boolean(),
    connectedAt: v.number(),
  }).index("by_userId", ["userId"])
    .index("by_address", ["address"]),

  // eBay OAuth connections — one per user
  ebayConnections: defineTable({
    userId: v.id("users"),
    ebayUsername: v.optional(v.string()),
    accessToken: v.string(),
    refreshToken: v.string(),
    tokenExpiry: v.number(),
    scope: v.string(),
    connectedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // Purchase orders — supports both eBay items and seeded catalog items
  purchaseOrders: defineTable({
    userId: v.id("users"),
    ebayItemId: v.optional(v.string()),
    ebayListingUrl: v.optional(v.string()),
    shopId: v.optional(v.id("shops")),
    productId: v.optional(v.id("products")),
    status: v.string(),
    tokenAmount: v.number(),
    walletAddress: v.string(),
    escrowTxHash: v.optional(v.string()),
    releaseTxHash: v.optional(v.string()),
    productTitle: v.string(),
    shopLabel: v.string(),
    productImage: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"])
    .index("by_userId_and_status", ["userId", "status"])
    .index("by_status", ["status"]),
});
