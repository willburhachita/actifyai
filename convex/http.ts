import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { processMessage } from "./agent";

const http = httpRouter();

function getBaseUrl() {
  // @ts-ignore process is injected by convex
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

function shouldProxyToNext(baseUrl: string) {
  return !/localhost|127\.0\.0\.1/i.test(baseUrl);
}

async function tryProxyToNext(request: Request, bodyText: string) {
  const baseUrl = getBaseUrl();
  if (!shouldProxyToNext(baseUrl)) {
    return null;
  }

  try {
    const endpoint = new URL("/api/whatsapp/webhook", baseUrl).toString();
    const proxied = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": request.headers.get("content-type") || "application/x-www-form-urlencoded",
        "x-twilio-signature": request.headers.get("x-twilio-signature") || "",
      },
      body: bodyText,
    });

    return new Response(await proxied.text(), {
      status: proxied.status,
      headers: {
        "Content-Type": proxied.headers.get("content-type") || "text/xml; charset=utf-8",
      },
    });
  } catch (error) {
    console.warn("[Actify WhatsApp] Failed to proxy to Next.js webhook, using compatibility handler instead.", error);
    return null;
  }
}

http.route({
  path: "/whatsapp",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const bodyText = await request.text();

    const proxiedResponse = await tryProxyToNext(request, bodyText);
    if (proxiedResponse) {
      return proxiedResponse;
    }

    const params = new URLSearchParams(bodyText);
    const message = params.get("Body")?.trim() || "";
    const from = params.get("From")?.trim() || "";

    const whatsappId = from;

    const userContext = await ctx.runQuery(api.whatsapp.resolveWhatsAppUser, { whatsappId });

    let reply = "";
    if (!userContext) {
      const baseUrl = getBaseUrl();
      const returnTo = `/app/settings?wa=${encodeURIComponent(whatsappId)}`;
      const authLink = `${baseUrl}/auth/login?returnTo=${encodeURIComponent(returnTo)}`;

      reply = `Welcome to Actify AI!\n\nIt looks like this number is not linked to an account yet.\n\nLog in with the secure link below and finish linking in Settings.\n\n${authLink}`;
    } else {
      reply = await processMessage(message, userContext);
    }

    return new Response(`<Response><Message>${reply}</Message></Response>`, {
      headers: { "Content-Type": "text/xml; charset=utf-8" },
    });
  }),
});

export default http;
