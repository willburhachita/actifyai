import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const DEFAULT_ALLOWED_ACTIONS = [
  "browse",
  "compare",
  "draft_purchase",
  "execute_purchase",
];

const DEFAULT_ALLOWED_CATEGORIES = [
  "electronics",
  "fashion",
  "home",
  "sports",
  "collectibles",
];

export const resolveWhatsAppUser = query({
  args: { whatsappId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_whatsappId", (q) => q.eq("whatsappId", args.whatsappId))
      .unique();

    if (!user) {
      return null;
    }

    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    return {
      userId: user._id,
      auth0Id: user.auth0Id,
      name: user.name,
      email: user.email,
      whatsappId: user.whatsappId ?? null,
      maxBudget: user.maxBudget,
      approvalThreshold: user.approvalThreshold,
      allowedActions: user.allowedActions ?? DEFAULT_ALLOWED_ACTIONS,
      allowedCategories: user.allowedCategories ?? DEFAULT_ALLOWED_CATEGORIES,
      verifiedOnly: user.verifiedOnly,
      agentPaused: user.agentPaused ?? false,
      walletBalance: wallet?.tokenBalance ?? 0,
      walletAddress: wallet?.address ?? null,
    };
  },
});

export const linkWhatsAppFromCode = mutation({
  args: {
    whatsappId: v.string(),
    code: v.string(),
    profileName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const pendingLink = await ctx.db
      .query("pendingWhatsAppLinks")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .unique();

    if (!pendingLink) {
      throw new Error("Verification code not found.");
    }

    if (pendingLink.status !== "pending") {
      throw new Error("Verification code has already been used.");
    }

    if (pendingLink.expiresAt < Date.now()) {
      await ctx.db.patch(pendingLink._id, {
        status: "expired",
      });
      throw new Error("Verification code has expired.");
    }

    const user = await ctx.db.get(pendingLink.userId);
    if (!user) {
      throw new Error("Linked user not found.");
    }

    await ctx.db.patch(user._id, {
      whatsappId: args.whatsappId,
    });

    await ctx.db.patch(pendingLink._id, {
      status: "claimed",
      claimedAt: Date.now(),
    });

    await ctx.db.insert("activityLog", {
      userId: user._id,
      type: "system",
      title: "WhatsApp linked",
      detail: `WhatsApp identity ${args.whatsappId}${args.profileName ? ` (${args.profileName})` : ""} linked to Actify AI.`,
      createdAt: Date.now(),
      metadata: {
        provider: "twilio_whatsapp",
      },
    });

    return {
      success: true,
      userId: user._id,
      name: user.name,
      whatsappId: args.whatsappId,
    };
  },
});

export const recordInboundMessage = mutation({
  args: {
    whatsappId: v.string(),
    fromAddress: v.string(),
    toAddress: v.string(),
    body: v.string(),
    providerMessageId: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_whatsappId", (q) => q.eq("whatsappId", args.whatsappId))
      .unique();

    if (!user) {
      return null;
    }

    const messageId = await ctx.db.insert("whatsappMessages", {
      userId: user._id,
      direction: "inbound",
      fromAddress: args.fromAddress,
      toAddress: args.toAddress,
      providerMessageId: args.providerMessageId,
      body: args.body,
      status: "received",
      createdAt: Date.now(),
      metadata: args.metadata,
    });

    return {
      messageId,
      userId: user._id,
      auth0Id: user.auth0Id,
    };
  },
});

export const recordOutboundMessage = mutation({
  args: {
    userId: v.id("users"),
    fromAddress: v.string(),
    toAddress: v.string(),
    body: v.string(),
    status: v.string(),
    providerMessageId: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("whatsappMessages", {
      userId: args.userId,
      direction: "outbound",
      fromAddress: args.fromAddress,
      toAddress: args.toAddress,
      providerMessageId: args.providerMessageId,
      body: args.body,
      status: args.status,
      createdAt: Date.now(),
      metadata: args.metadata,
    });
  },
});

export const createAgentIntent = mutation({
  args: {
    userId: v.id("users"),
    source: v.string(),
    sourceMessageId: v.optional(v.string()),
    instruction: v.string(),
    status: v.string(),
    actionType: v.string(),
    category: v.optional(v.string()),
    proposedAmountAct: v.optional(v.number()),
    requiresApproval: v.boolean(),
    resultSummary: v.optional(v.string()),
    targetTitle: v.optional(v.string()),
    targetUrl: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const intentId = await ctx.db.insert("agentIntents", {
      userId: args.userId,
      source: args.source,
      sourceMessageId: args.sourceMessageId,
      instruction: args.instruction,
      status: args.status,
      actionType: args.actionType,
      category: args.category,
      proposedAmountAct: args.proposedAmountAct,
      requiresApproval: args.requiresApproval,
      resultSummary: args.resultSummary,
      targetTitle: args.targetTitle,
      targetUrl: args.targetUrl,
      metadata: args.metadata,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("activityLog", {
      userId: args.userId,
      type: args.requiresApproval ? "approval" : "decision",
      title: `WhatsApp agent ${args.status}`,
      detail: args.resultSummary ?? `Intent ${args.actionType} was recorded from WhatsApp.`,
      createdAt: now,
      metadata: {
        intentId,
        actionType: args.actionType,
        category: args.category,
        proposedAmountAct: args.proposedAmountAct,
      },
    });

    return intentId;
  },
});

export const listRecentAgentIntents = query({
  args: {
    auth0Id: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth0Id", (q) => q.eq("auth0Id", args.auth0Id))
      .unique();

    if (!user) {
      return [];
    }

    return await ctx.db
      .query("agentIntents")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(args.limit ?? 10);
  },
});
