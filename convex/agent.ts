import { askGemini } from "./gemini";

type AgentUserContext = {
  name?: string;
  maxBudget?: number;
  approvalThreshold?: number;
  allowedCategories?: string[];
  allowedActions?: string[];
  walletBalance?: number;
  agentPaused?: boolean;
};

function extractBudget(message: string) {
  const actMatch = message.match(/(\d+(?:\.\d+)?)\s*act/i);
  if (actMatch) {
    return Number(actMatch[1]);
  }

  const underMatch = message.match(/under\s+(\d+(?:\.\d+)?)/i);
  if (underMatch) {
    return Number(underMatch[1]);
  }

  return null;
}

function buildStatusReply(userContext: AgentUserContext) {
  const budget = userContext.maxBudget ?? 0;
  const threshold = userContext.approvalThreshold ?? 0;
  const walletBalance = userContext.walletBalance ?? 0;
  const categories = userContext.allowedCategories?.length
    ? userContext.allowedCategories.join(", ")
    : "all categories";
  const actions = userContext.allowedActions?.length
    ? userContext.allowedActions.join(", ")
    : "browse, compare";

  return [
    `Hi ${userContext.name || "there"}, here is your Actify status:`,
    `Wallet balance: ${walletBalance.toFixed(2)} ACT`,
    `Max budget: ${budget.toFixed(2)} ACT`,
    `Approval threshold: ${threshold.toFixed(2)} ACT`,
    `Allowed actions: ${actions}`,
    `Allowed categories: ${categories}`,
    `Agent paused: ${userContext.agentPaused ? "yes" : "no"}`,
  ].join("\n");
}

function buildFallbackReply(message: string, userContext: AgentUserContext) {
  const lower = message.toLowerCase();
  const requestedBudget = extractBudget(message);
  const maxBudget = userContext.maxBudget ?? 0;
  const approvalThreshold = userContext.approvalThreshold ?? 0;
  const walletBalance = userContext.walletBalance ?? 0;
  const executeAllowed = userContext.allowedActions?.includes("execute_purchase") ?? false;
  const draftAllowed = userContext.allowedActions?.includes("draft_purchase") ?? false;

  if (userContext.agentPaused) {
    return "Your Actify WhatsApp agent is paused in the dashboard right now, so I will not act on requests until you resume it.";
  }

  if (/(help|menu|what can you do)/i.test(lower)) {
    return "I can help with status, recommendations, browsing, comparing deals, and policy-aware purchase requests. Try: 'status', 'find electronics under 40 ACT', or 'buy headphones under 30 ACT'.";
  }

  if (/(status|budget|limit|policy|settings)/i.test(lower)) {
    return buildStatusReply(userContext);
  }

  if (/(buy|purchase|order)/i.test(lower)) {
    if (!executeAllowed && !draftAllowed) {
      return "Your current policy does not allow WhatsApp purchases. Enable draft or execute permissions in the dashboard first.";
    }

    if (requestedBudget !== null && requestedBudget > walletBalance) {
      return `This request looks above your wallet balance of ${walletBalance.toFixed(2)} ACT, so I did not proceed.`;
    }

    if (requestedBudget !== null && requestedBudget > maxBudget) {
      return `This request appears above your max budget of ${maxBudget.toFixed(2)} ACT, so I blocked it.`;
    }

    if (requestedBudget !== null && requestedBudget > approvalThreshold) {
      return `This request appears to be above your approval threshold of ${approvalThreshold.toFixed(2)} ACT, so it should be handled as pending approval in the dashboard.`;
    }

    if (executeAllowed) {
      return "Your connection is active and your limits look compatible with a small purchase. For the richest live buying flow, point Twilio to /api/whatsapp/webhook on your Next.js app.";
    }

    return "Your connection is active and I can prepare draft purchases, but autonomous checkout is not enabled in your policy.";
  }

  if (/(compare|recommend|best deal|browse|find|show|search)/i.test(lower)) {
    return "Your WhatsApp connection is active. I can help interpret shopping requests, and the full live recommendation flow is available through the Next.js WhatsApp webhook. Try 'find electronics under 40 ACT' once that webhook is connected.";
  }

  return "I could not confidently interpret that request in compatibility mode. Try 'status', 'find electronics under 40 ACT', or 'buy headphones under 30 ACT'.";
}

export async function processMessage(message: string, userContext: AgentUserContext) {
  const aiResponse = await askGemini(message, userContext);

  if (!aiResponse) {
    return buildFallbackReply(message, userContext);
  }

  if (aiResponse.includes("ACTION: search_ebay")) {
    return "?? I understood this as a shopping search. For live recommendations and buying, use the Next.js WhatsApp webhook at /api/whatsapp/webhook.";
  }

  return aiResponse;
}
