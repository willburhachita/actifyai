import "server-only";

import { EBAY_CATEGORIES, searchEbayItems, type EbayCategory } from "@/lib/ebay/client";
import { getWorldCatalog } from "@/lib/shopify";

type ParsedIntent = {
  intent: "help" | "status" | "browse" | "compare" | "buy" | "unknown";
  query: string | null;
  category: EbayCategory | null;
  budgetAct: number | null;
  wantsExecution: boolean;
  confidence: number;
};

type Offer = {
  itemId?: string;
  title: string;
  priceAct: number;
  url?: string;
  imageUrl?: string;
  source: "ebay" | "demo";
  category: string;
  seller?: string;
};

type OfferContext = {
  offers: Offer[];
};

export type WhatsAppAgentContext = {
  userId: string;
  auth0Id: string;
  name: string;
  whatsappId: string | null;
  maxBudget: number;
  approvalThreshold: number;
  allowedActions: string[];
  allowedCategories: string[];
  verifiedOnly: boolean;
  agentPaused: boolean;
  walletBalance: number;
};

export type WhatsAppAgentResolution = {
  reply: string;
  intent?: {
    status: string;
    actionType: string;
    category?: string;
    proposedAmountAct?: number;
    requiresApproval: boolean;
    resultSummary: string;
    targetTitle?: string;
    targetUrl?: string;
    metadata?: Record<string, unknown>;
  };
  execution?: {
    type: "create_order";
    offer: Offer;
  };
};

function normalizeCategory(category: string | null | undefined): EbayCategory | null {
  if (!category) return null;

  const lower = category.toLowerCase();
  const allowed = Object.keys(EBAY_CATEGORIES) as EbayCategory[];
  return allowed.includes(lower as EbayCategory) ? (lower as EbayCategory) : null;
}

function extractBudgetAct(message: string) {
  const explicitAct = message.match(/(\d+(?:\.\d+)?)\s*act/i);
  if (explicitAct) {
    return Number(explicitAct[1]);
  }

  const under = message.match(/under\s+(\d+(?:\.\d+)?)/i);
  if (under) {
    return Number(under[1]);
  }

  const anyNumber = message.match(/(\d+(?:\.\d+)?)/);
  return anyNumber ? Number(anyNumber[1]) : null;
}

function fallbackParse(message: string): ParsedIntent {
  const lower = message.toLowerCase();
  const category =
    normalizeCategory(
      (Object.keys(EBAY_CATEGORIES) as EbayCategory[]).find((candidate) =>
        lower.includes(candidate),
      ),
    ) ?? (lower.includes("home") ? "home" : null);

  if (/(help|menu|what can you do)/i.test(lower)) {
    return {
      intent: "help",
      query: null,
      category,
      budgetAct: extractBudgetAct(message),
      wantsExecution: false,
      confidence: 0.8,
    };
  }

  if (/(status|limit|budget|settings|policy)/i.test(lower)) {
    return {
      intent: "status",
      query: null,
      category,
      budgetAct: extractBudgetAct(message),
      wantsExecution: false,
      confidence: 0.75,
    };
  }

  if (/(compare|best deal|recommend)/i.test(lower)) {
    return {
      intent: "compare",
      query: message,
      category,
      budgetAct: extractBudgetAct(message),
      wantsExecution: false,
      confidence: 0.7,
    };
  }

  if (/(buy|purchase|get me|order)/i.test(lower)) {
    return {
      intent: "buy",
      query: message,
      category,
      budgetAct: extractBudgetAct(message),
      wantsExecution: true,
      confidence: 0.72,
    };
  }

  if (/(find|show|browse|look for)/i.test(lower)) {
    return {
      intent: "browse",
      query: message,
      category,
      budgetAct: extractBudgetAct(message),
      wantsExecution: false,
      confidence: 0.68,
    };
  }

  return {
    intent: "unknown",
    query: message,
    category,
    budgetAct: extractBudgetAct(message),
    wantsExecution: false,
    confidence: 0.4,
  };
}

function parseOfferReference(message: string): number | null {
  const lower = message.toLowerCase();
  const numericMatch = lower.match(/\b(?:buy|purchase|order)\s+(?:option\s+)?([1-3])\b/);
  if (numericMatch) {
    return Number(numericMatch[1]) - 1;
  }

  if (/\b(first|1st)\b/.test(lower)) return 0;
  if (/\b(second|2nd)\b/.test(lower)) return 1;
  if (/\b(third|3rd)\b/.test(lower)) return 2;
  if (/\b(buy it|buy that|get it|purchase it|order it)\b/.test(lower)) return 0;

  return null;
}

async function parseIntentWithGemini(message: string): Promise<ParsedIntent | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const prompt = `You are a parser for a WhatsApp shopping agent.
Return only JSON with this shape:
{
  "intent": "help" | "status" | "browse" | "compare" | "buy" | "unknown",
  "query": "short shopping query or null",
  "category": "electronics" | "fashion" | "home" | "sports" | "collectibles" | null,
  "budgetAct": number | null,
  "wantsExecution": boolean,
  "confidence": number
}

Rules:
- If the user is asking about current limits, linked status, or policy, use "status".
- If the user is asking to search or discover options, use "browse".
- If the user asks for best, compare, recommendation, or cheapest, use "compare".
- If the user asks to buy, purchase, or order, use "buy".
- Keep query concise and remove operational words like "please" and "show me".
- budgetAct should be numeric when the message implies a spend cap.

User message:
${message}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 512,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    return null;
  }

  try {
    const parsed = JSON.parse(text) as ParsedIntent;
    return {
      intent: parsed.intent,
      query: parsed.query ?? null,
      category: normalizeCategory(parsed.category),
      budgetAct: typeof parsed.budgetAct === "number" ? parsed.budgetAct : null,
      wantsExecution: Boolean(parsed.wantsExecution),
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.6,
    };
  } catch {
    return null;
  }
}

async function parseIntent(message: string) {
  return (await parseIntentWithGemini(message)) ?? fallbackParse(message);
}

async function searchOffers(args: {
  query: string | null;
  category: EbayCategory | null;
  budgetAct: number | null;
}) {
  const results: Offer[] = [];
  const categoryId =
    args.category && args.category !== "all" ? EBAY_CATEGORIES[args.category].id : undefined;

  try {
    const response = await searchEbayItems({
      q: args.query ?? undefined,
      categoryIds: categoryId,
      limit: 5,
    });

    for (const item of response.itemSummaries ?? []) {
      const priceAct = Number(item.price?.value ?? "0");
      if (args.budgetAct !== null && priceAct > args.budgetAct) {
        continue;
      }

      results.push({
        itemId: item.itemId,
        title: item.title,
        priceAct,
        url: item.itemWebUrl,
        imageUrl: item.image?.imageUrl ?? item.thumbnailImages?.[0]?.imageUrl,
        source: "ebay",
        category: args.category ?? "all",
        seller: item.seller?.username,
      });
    }
  } catch {
    const fallback = await getWorldCatalog();
    for (const shop of fallback.shops) {
      for (const product of shop.products) {
        const searchable = `${product.title} ${product.description} ${product.vendor}`.toLowerCase();
        const matchesQuery =
          !args.query || searchable.includes(args.query.toLowerCase().replace(/[^a-z0-9 ]/gi, " "));
        const matchesBudget = args.budgetAct === null || product.price <= args.budgetAct;

        if (matchesQuery && matchesBudget) {
          results.push({
            title: product.title,
            priceAct: product.price,
            url: product.checkoutUrl,
            imageUrl: product.image,
            source: "demo",
            category: shop.slug,
            seller: product.vendor,
          });
        }
      }
    }
  }

  return results
    .sort((left, right) => left.priceAct - right.priceAct)
    .slice(0, 5);
}

function formatOffersReply(header: string, offers: Offer[]) {
  if (!offers.length) {
    return `${header}\n\nI couldn't find a matching item in the current catalog. Try a clearer product name or a higher ACT limit.`;
  }

  const lines = offers.slice(0, 3).map((offer, index) => {
    const seller = offer.seller ? ` - ${offer.seller}` : "";
    return `${index + 1}. ${offer.title} - ${offer.priceAct.toFixed(2)} ACT${seller}`;
  });

  return `${header}\n\n${lines.join("\n")}`;
}

function buildStatusReply(context: WhatsAppAgentContext) {
  return [
    `Hi ${context.name}, here is your current Actify agent status:`,
    `Wallet balance: ${context.walletBalance.toFixed(2)} ACT`,
    `Max auto budget: ${context.maxBudget.toFixed(2)} ACT`,
    `Approval threshold: ${context.approvalThreshold.toFixed(2)} ACT`,
    `Verified sellers only: ${context.verifiedOnly ? "yes" : "no"}`,
    `Agent paused: ${context.agentPaused ? "yes" : "no"}`,
    `Allowed actions: ${context.allowedActions.join(", ")}`,
    `Allowed categories: ${context.allowedCategories.join(", ")}`,
  ].join("\n");
}

export async function handleWhatsAppInstruction(args: {
  message: string;
  context: WhatsAppAgentContext;
  recentOfferContext?: OfferContext | null;
}): Promise<WhatsAppAgentResolution> {
  const { message, context, recentOfferContext } = args;

  if (context.agentPaused) {
    return {
      reply:
        "Your Actify agent is currently paused in the dashboard, so I won't act on requests right now.",
      intent: {
        status: "blocked",
        actionType: "paused",
        requiresApproval: false,
        resultSummary: "Blocked because the user paused the WhatsApp agent.",
      },
    };
  }

  const parsed = await parseIntent(message);

  if (parsed.intent === "help") {
    return {
      reply:
        "I can help you browse offers, compare deals, explain your ACT spending limits, and draft a purchase request. Try messages like 'find headphones under 40 ACT', 'compare electronics under 60 ACT', or 'status'.",
    };
  }

  if (parsed.intent === "status") {
    return {
      reply: buildStatusReply(context),
    };
  }

  if (parsed.intent === "unknown") {
    return {
      reply:
        "I couldn't confidently understand that request yet. Try 'find a keyboard under 50 ACT', 'compare electronics under 70 ACT', or 'status'.",
    };
  }

  const actionType =
    parsed.intent === "browse" ? "browse" : parsed.intent === "compare" ? "compare" : "execute_purchase";

  if (!context.allowedActions.includes(actionType) && parsed.intent !== "buy") {
    return {
      reply: `Your current agent policy does not allow ${actionType} actions. Update it in the dashboard settings if you want me to do that.`,
      intent: {
        status: "blocked",
        actionType,
        category: parsed.category ?? undefined,
        requiresApproval: false,
        resultSummary: `Blocked because ${actionType} is not allowed by policy.`,
      },
    };
  }

  if (parsed.intent === "buy" && !context.allowedActions.includes("execute_purchase") && !context.allowedActions.includes("draft_purchase")) {
    return {
      reply:
        "Your current policy does not allow purchase requests from WhatsApp. Enable draft_purchase or execute_purchase in the dashboard first.",
      intent: {
        status: "blocked",
        actionType: "execute_purchase",
        category: parsed.category ?? undefined,
        requiresApproval: false,
        resultSummary: "Blocked because purchase actions are not allowed by policy.",
      },
    };
  }

  if (
    parsed.category &&
    context.allowedCategories.length > 0 &&
    !context.allowedCategories.includes(parsed.category)
  ) {
    return {
      reply: `Your current policy does not allow ${parsed.category} purchases from WhatsApp.`,
      intent: {
        status: "blocked",
        actionType,
        category: parsed.category,
        requiresApproval: false,
        resultSummary: `Blocked because ${parsed.category} is not in the allowed categories list.`,
      },
    };
  }

  const effectiveBudget = Math.min(
    parsed.budgetAct ?? context.maxBudget,
    context.maxBudget,
    context.walletBalance,
  );

  const referencedOfferIndex = parseOfferReference(message);
  let offers =
    parsed.intent === "buy" && referencedOfferIndex !== null && recentOfferContext?.offers?.length
      ? recentOfferContext.offers
      : await searchOffers({
          query: parsed.query,
          category: parsed.category,
          budgetAct: effectiveBudget,
        });

  if (parsed.intent === "browse") {
    const topOffers = offers.slice(0, 3);
    return {
      reply: `${formatOffersReply(`Here are a few options under ${effectiveBudget.toFixed(2)} ACT.`, topOffers)}\n\nReply with "buy 1", "buy 2", or a product request like "buy headphones under 40 ACT" if you want me to proceed.`,
      intent: {
        status: "completed",
        actionType: "browse",
        category: parsed.category ?? undefined,
        requiresApproval: false,
        resultSummary: `Shared ${Math.min(offers.length, 3)} browse results with the user.`,
        metadata: {
          resultCount: offers.length,
          topOfferPriceAct: topOffers[0]?.priceAct ?? 0,
          offers: topOffers.map((offer) => ({
            itemId: offer.itemId ?? "",
            title: offer.title,
            priceAct: offer.priceAct,
            url: offer.url ?? "",
            imageUrl: offer.imageUrl ?? "",
            source: offer.source,
            category: offer.category,
            seller: offer.seller ?? "",
          })),
        },
      },
    };
  }

  if (parsed.intent === "compare") {
    const topOffers = offers.slice(0, 3);
    return {
      reply: `${formatOffersReply(`Best available deals under ${effectiveBudget.toFixed(2)} ACT.`, topOffers)}\n\nIf you'd like one of these, reply with "buy 1", "buy 2", or "buy 3".`,
      intent: {
        status: "completed",
        actionType: "compare",
        category: parsed.category ?? undefined,
        requiresApproval: false,
        resultSummary: `Shared comparison results under ${effectiveBudget.toFixed(2)} ACT.`,
        metadata: {
          resultCount: offers.length,
          topOfferPriceAct: topOffers[0]?.priceAct ?? 0,
          offers: topOffers.map((offer) => ({
            itemId: offer.itemId ?? "",
            title: offer.title,
            priceAct: offer.priceAct,
            url: offer.url ?? "",
            imageUrl: offer.imageUrl ?? "",
            source: offer.source,
            category: offer.category,
            seller: offer.seller ?? "",
          })),
        },
      },
    };
  }

  const selected =
    referencedOfferIndex !== null && offers[referencedOfferIndex]
      ? offers[referencedOfferIndex]
      : offers[0];
  if (!selected) {
    return {
      reply:
        "I couldn't find an eligible item to draft under your current limits. Try a higher budget or a more specific item request.",
      intent: {
        status: "blocked",
        actionType: "execute_purchase",
        category: parsed.category ?? undefined,
        requiresApproval: false,
        resultSummary: "No eligible item was found for the WhatsApp purchase request.",
      },
    };
  }

  if (selected.priceAct > context.walletBalance) {
    return {
      reply: `I found ${selected.title} at ${selected.priceAct.toFixed(2)} ACT, but your wallet only has ${context.walletBalance.toFixed(2)} ACT. I did not proceed.`,
      intent: {
        status: "blocked",
        actionType: "execute_purchase",
        category: parsed.category ?? undefined,
        proposedAmountAct: selected.priceAct,
        requiresApproval: false,
        resultSummary: "Blocked because the wallet balance is lower than the proposed spend.",
        targetTitle: selected.title,
        targetUrl: selected.url,
      },
    };
  }

  if (selected.priceAct > context.maxBudget) {
    return {
      reply: `I found ${selected.title} at ${selected.priceAct.toFixed(2)} ACT, but that exceeds your hard budget of ${context.maxBudget.toFixed(2)} ACT. I blocked the request.`,
      intent: {
        status: "blocked",
        actionType: "execute_purchase",
        category: parsed.category ?? undefined,
        proposedAmountAct: selected.priceAct,
        requiresApproval: false,
        resultSummary: "Blocked because the proposed spend exceeded the user's max budget.",
        targetTitle: selected.title,
        targetUrl: selected.url,
      },
    };
  }

  const canExecutePurchase = context.allowedActions.includes("execute_purchase");
  const canDraftPurchase = context.allowedActions.includes("draft_purchase");

  if (selected.priceAct > context.approvalThreshold) {
    return {
      reply: `I found ${selected.title} at ${selected.priceAct.toFixed(2)} ACT. That is within your budget but above your approval threshold of ${context.approvalThreshold.toFixed(2)} ACT, so I created a pending approval instead of proceeding.`,
      intent: {
        status: "pending_approval",
        actionType: "execute_purchase",
        category: parsed.category ?? undefined,
        proposedAmountAct: selected.priceAct,
        requiresApproval: true,
        resultSummary: "Purchase request deferred because it exceeds the approval threshold.",
        targetTitle: selected.title,
        targetUrl: selected.url,
        metadata: {
          source: selected.source,
        },
      },
    };
  }

  if (!canExecutePurchase && canDraftPurchase) {
    return {
      reply: `I prepared a purchase draft for ${selected.title} at ${selected.priceAct.toFixed(2)} ACT. Your policy allows drafts, but not autonomous checkout execution from WhatsApp.`,
      intent: {
        status: "draft_ready",
        actionType: "draft_purchase",
        category: parsed.category ?? undefined,
        proposedAmountAct: selected.priceAct,
        requiresApproval: false,
        resultSummary: "Created a WhatsApp purchase draft that is within the user's allowed budget.",
        targetTitle: selected.title,
        targetUrl: selected.url,
        metadata: {
          source: selected.source,
        },
      },
    };
  }

  if (!canExecutePurchase) {
    return {
      reply:
        "Your current policy does not allow autonomous purchases from WhatsApp. Enable execute_purchase or draft_purchase in the dashboard first.",
      intent: {
        status: "blocked",
        actionType: "execute_purchase",
        category: parsed.category ?? undefined,
        proposedAmountAct: selected.priceAct,
        requiresApproval: false,
        resultSummary: "Blocked because WhatsApp execution is not allowed by policy.",
        targetTitle: selected.title,
        targetUrl: selected.url,
      },
    };
  }

  return {
    reply: `I found ${selected.title} at ${selected.priceAct.toFixed(2)} ACT and it is within your approved WhatsApp limit. I'm creating the order now.`,
    intent: {
      status: "ready_to_execute",
      actionType: "execute_purchase",
      category: parsed.category ?? undefined,
      proposedAmountAct: selected.priceAct,
      requiresApproval: false,
      resultSummary: "Prepared an auto-approved WhatsApp purchase for execution.",
      targetTitle: selected.title,
      targetUrl: selected.url,
      metadata: {
        source: selected.source,
      },
    },
    execution: {
      type: "create_order",
      offer: selected,
    },
  };
}
