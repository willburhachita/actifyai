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

function generateVerificationCode() {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `ACT-${digits}`;
}

export const getAgentSettings = query({
  args: { auth0Id: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth0Id", (q) => q.eq("auth0Id", args.auth0Id))
      .unique();

    if (!user) {
      return null;
    }

    const now = Date.now();
    const pendingLinks = await ctx.db
      .query("pendingWhatsAppLinks")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .take(10);

    const activeLink = pendingLinks.find(
      (link) => link.status === "pending" && link.expiresAt > now,
    );

    return {
      auth0Id: user.auth0Id,
      whatsappId: user.whatsappId ?? null,
      maxBudget: user.maxBudget,
      approvalThreshold: user.approvalThreshold,
      allowedActions: user.allowedActions ?? DEFAULT_ALLOWED_ACTIONS,
      allowedCategories: user.allowedCategories ?? DEFAULT_ALLOWED_CATEGORIES,
      verifiedOnly: user.verifiedOnly,
      agentPaused: user.agentPaused ?? false,
      pendingWhatsAppLink: activeLink
        ? {
            code: activeLink.code,
            expiresAt: activeLink.expiresAt,
          }
        : null,
    };
  },
});

export const updateAgentSettings = mutation({
  args: {
    auth0Id: v.string(),
    maxBudget: v.number(),
    approvalThreshold: v.number(),
    allowedActions: v.array(v.string()),
    allowedCategories: v.array(v.string()),
    verifiedOnly: v.boolean(),
    agentPaused: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth0Id", (q) => q.eq("auth0Id", args.auth0Id))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      maxBudget: args.maxBudget,
      approvalThreshold: args.approvalThreshold,
      allowedActions: args.allowedActions,
      allowedCategories: args.allowedCategories,
      verifiedOnly: args.verifiedOnly,
      agentPaused: args.agentPaused,
    });

    await ctx.db.insert("activityLog", {
      userId: user._id,
      type: "system",
      title: "Agent policy updated",
      detail: `Max budget set to ${args.maxBudget} ACT with approval threshold ${args.approvalThreshold} ACT.`,
      createdAt: Date.now(),
      metadata: {
        allowedActions: args.allowedActions,
        allowedCategories: args.allowedCategories,
        verifiedOnly: args.verifiedOnly,
        agentPaused: args.agentPaused,
      },
    });

    return { success: true };
  },
});

export const generateWhatsAppVerificationCode = mutation({
  args: { auth0Id: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth0Id", (q) => q.eq("auth0Id", args.auth0Id))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const now = Date.now();
    const existingLinks = await ctx.db
      .query("pendingWhatsAppLinks")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .take(10);

    const activeLink = existingLinks.find(
      (link) => link.status === "pending" && link.expiresAt > now,
    );

    if (activeLink) {
      return {
        code: activeLink.code,
        expiresAt: activeLink.expiresAt,
      };
    }

    for (const link of existingLinks) {
      if (link.status === "pending") {
        await ctx.db.patch(link._id, {
          status: "expired",
        });
      }
    }

    const code = generateVerificationCode();
    const expiresAt = now + 15 * 60 * 1000;

    await ctx.db.insert("pendingWhatsAppLinks", {
      userId: user._id,
      code,
      provider: "twilio_whatsapp",
      status: "pending",
      expiresAt,
      createdAt: now,
    });

    await ctx.db.insert("activityLog", {
      userId: user._id,
      type: "system",
      title: "WhatsApp link code generated",
      detail: `A new WhatsApp verification code was generated and expires at ${new Date(expiresAt).toISOString()}.`,
      createdAt: now,
    });

    return { code, expiresAt };
  },
});

export const unlinkWhatsApp = mutation({
  args: { auth0Id: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth0Id", (q) => q.eq("auth0Id", args.auth0Id))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.whatsappId) {
      return { success: true };
    }

    const previousWhatsAppId = user.whatsappId;
    await ctx.db.patch(user._id, {
      whatsappId: undefined,
    });

    await ctx.db.insert("activityLog", {
      userId: user._id,
      type: "system",
      title: "WhatsApp disconnected",
      detail: `WhatsApp identity ${previousWhatsAppId} was unlinked from this account.`,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});
