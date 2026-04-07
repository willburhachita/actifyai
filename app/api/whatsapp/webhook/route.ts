import { NextRequest } from "next/server";
import { ConvexHttpClient } from "convex/browser";

import { api } from "@/convex/_generated/api";
import { handleWhatsAppInstruction } from "@/lib/agent/whatsapp";
import { buildTwiMLMessage, getConfiguredWhatsAppNumber } from "@/lib/twilio/client";
import { verifyTwilioSignature } from "@/lib/twilio/verify";

export const runtime = "nodejs";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function xmlResponse(body: string, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
    },
  });
}

function shouldRequireSignatureValidation() {
  if (process.env.TWILIO_REQUIRE_SIGNATURE === "false") {
    return false;
  }

  return process.env.NODE_ENV === "production";
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const params = new URLSearchParams(rawBody);
  const signature = request.headers.get("x-twilio-signature");
  const verification = verifyTwilioSignature({
    url: request.url,
    params,
    signature,
    authToken: process.env.TWILIO_AUTH_TOKEN,
  });

  if (shouldRequireSignatureValidation() && !verification.valid) {
    return xmlResponse(buildTwiMLMessage("Signature validation failed."), 403);
  }

  const from = params.get("From")?.trim() ?? "";
  const to = params.get("To")?.trim() ?? getConfiguredWhatsAppNumber();
  const body = params.get("Body")?.trim() ?? "";
  const profileName = params.get("ProfileName")?.trim() || undefined;
  const messageSid = params.get("MessageSid")?.trim() || undefined;

  if (!from || !body) {
    return xmlResponse(buildTwiMLMessage("Missing WhatsApp sender or message body."), 400);
  }

  const normalizedBody = body.replace(/\s+/g, " ").trim();

  const linkedUser = await convex.query(api.whatsapp.resolveWhatsAppUser, {
    whatsappId: from,
  });

  if (!linkedUser) {
    const maybeCode = normalizedBody.toUpperCase();

    if (/^ACT-\d{4}$/.test(maybeCode)) {
      try {
        const linked = await convex.mutation(api.whatsapp.linkWhatsAppFromCode, {
          whatsappId: from,
          code: maybeCode,
          profileName,
        });

        return xmlResponse(
          buildTwiMLMessage(
            `You're linked, ${linked.name}. Your WhatsApp is now connected to Actify AI. You can ask me things like "status", "find electronics under 40 ACT", or "buy headphones under 30 ACT".`,
          ),
        );
      } catch (error) {
        const detail = error instanceof Error ? error.message : "Unable to link right now.";
        return xmlResponse(
          buildTwiMLMessage(`${detail} Generate a fresh code from the Actify dashboard and try again.`),
        );
      }
    }

    return xmlResponse(
      buildTwiMLMessage(
        "This WhatsApp number is not linked to an Actify account yet. Log into the dashboard, open Settings, generate a WhatsApp verification code, then send that code here.",
      ),
    );
  }

  await convex.mutation(api.whatsapp.recordInboundMessage, {
    whatsappId: from,
    fromAddress: from,
    toAddress: to,
    body: normalizedBody,
    providerMessageId: messageSid,
    metadata: {
      profileName: profileName ?? "",
      signatureValidated: verification.valid,
    },
  });

  const resolution = await handleWhatsAppInstruction({
    message: normalizedBody,
    context: linkedUser,
    recentOfferContext: await convex.query(api.whatsapp.getRecentOfferContext, {
      userId: linkedUser.userId,
    }),
  });

  let finalReply = resolution.reply;
  let finalIntent = resolution.intent;

  if (resolution.execution?.type === "create_order") {
    const selectedOffer = resolution.execution.offer;

    if (!linkedUser.walletAddress) {
      finalReply =
        "Your WhatsApp is linked, but there is no wallet connected to your Actify account yet. Connect MetaMask in the dashboard first, then I can buy on your behalf within policy.";
      finalIntent = {
        status: "blocked",
        actionType: "execute_purchase",
        category: selectedOffer.category,
        proposedAmountAct: selectedOffer.priceAct,
        requiresApproval: false,
        resultSummary: "Blocked because the linked user has no connected wallet address.",
        targetTitle: selectedOffer.title,
        targetUrl: selectedOffer.url,
        metadata: {
          source: selectedOffer.source,
        },
      };
    } else {
      try {
        const orderId = await convex.mutation(api.purchaseOrders.createOrder, {
          auth0Id: linkedUser.auth0Id,
          tokenAmount: selectedOffer.priceAct,
          walletAddress: linkedUser.walletAddress,
          productTitle: selectedOffer.title,
          shopLabel: selectedOffer.source === "ebay" ? "eBay Mall" : "Actify Demo Catalog",
          productImage: selectedOffer.imageUrl,
          escrowTxHash: `whatsapp-ai-${Date.now()}`,
          ebayItemId: selectedOffer.source === "ebay" ? selectedOffer.itemId : undefined,
          ebayListingUrl: selectedOffer.url,
          ebayCheckoutUrl: selectedOffer.url,
        });

        finalReply = [
          `Done — I created an Actify order for ${selectedOffer.title} at ${selectedOffer.priceAct.toFixed(2)} ACT.`,
          `It is now associated with your linked account and activity log.`,
          selectedOffer.url ? `Checkout link: ${selectedOffer.url}` : "",
        ]
          .filter(Boolean)
          .join("\n");

        finalIntent = {
          status: "completed",
          actionType: "execute_purchase",
          category: selectedOffer.category,
          proposedAmountAct: selectedOffer.priceAct,
          requiresApproval: false,
          resultSummary: `Created an order from WhatsApp for ${selectedOffer.title} at ${selectedOffer.priceAct.toFixed(2)} ACT.`,
          targetTitle: selectedOffer.title,
          targetUrl: selectedOffer.url,
          metadata: {
            source: selectedOffer.source,
            orderId,
            initiatedBy: "whatsapp_ai",
          },
        };
      } catch (error) {
        const detail = error instanceof Error ? error.message : "Unable to create the purchase order right now.";
        finalReply = `I found the item, but I couldn't complete the Actify purchase record yet: ${detail}`;
        finalIntent = {
          status: "blocked",
          actionType: "execute_purchase",
          category: selectedOffer.category,
          proposedAmountAct: selectedOffer.priceAct,
          requiresApproval: false,
          resultSummary: `Execution failed while creating the WhatsApp purchase order: ${detail}`,
          targetTitle: selectedOffer.title,
          targetUrl: selectedOffer.url,
          metadata: {
            source: selectedOffer.source,
          },
        };
      }
    }
  }

  if (finalIntent) {
    await convex.mutation(api.whatsapp.createAgentIntent, {
      userId: linkedUser.userId,
      source: "whatsapp",
      sourceMessageId: messageSid,
      instruction: normalizedBody,
      status: finalIntent.status,
      actionType: finalIntent.actionType,
      category: finalIntent.category,
      proposedAmountAct: finalIntent.proposedAmountAct,
      requiresApproval: finalIntent.requiresApproval,
      resultSummary: finalIntent.resultSummary,
      targetTitle: finalIntent.targetTitle,
      targetUrl: finalIntent.targetUrl,
      metadata: finalIntent.metadata,
    });
  }

  await convex.mutation(api.whatsapp.recordOutboundMessage, {
    userId: linkedUser.userId,
    fromAddress: to,
    toAddress: from,
    body: finalReply,
    status: "sent_via_twiml",
    metadata: {
      sourceMessageId: messageSid ?? "",
    },
  });

  return xmlResponse(buildTwiMLMessage(finalReply));
}
