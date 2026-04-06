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
  });

  if (resolution.intent) {
    await convex.mutation(api.whatsapp.createAgentIntent, {
      userId: linkedUser.userId,
      source: "whatsapp",
      sourceMessageId: messageSid,
      instruction: normalizedBody,
      status: resolution.intent.status,
      actionType: resolution.intent.actionType,
      category: resolution.intent.category,
      proposedAmountAct: resolution.intent.proposedAmountAct,
      requiresApproval: resolution.intent.requiresApproval,
      resultSummary: resolution.intent.resultSummary,
      targetTitle: resolution.intent.targetTitle,
      targetUrl: resolution.intent.targetUrl,
      metadata: resolution.intent.metadata,
    });
  }

  await convex.mutation(api.whatsapp.recordOutboundMessage, {
    userId: linkedUser.userId,
    fromAddress: to,
    toAddress: from,
    body: resolution.reply,
    status: "sent_via_twiml",
    metadata: {
      sourceMessageId: messageSid ?? "",
    },
  });

  return xmlResponse(buildTwiMLMessage(resolution.reply));
}
