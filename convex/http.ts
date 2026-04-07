import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { processMessage } from "./agent";

const http = httpRouter();

http.route({
  path: "/whatsapp",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Twilio sends application/x-www-form-urlencoded
    const bodyText = await request.text();
    const params = new URLSearchParams(bodyText);
    const message = params.get("Body") || "";
    const from = params.get("From") || "";

    // Normalize number, twilio sends "whatsapp:+1234567"
    const whatsappId = from.replace("whatsapp:", "");

    // Check if user is linked in the database
    const userContext = await ctx.runQuery(api.whatsapp.resolveWhatsAppUser, { whatsappId });

    let reply = "";
    if (!userContext) {
      // @ts-ignore process injected by convex
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const authLink = `${baseUrl}/auth/login?returnTo=/app/settings?wa=${encodeURIComponent(whatsappId)}`;
      
      reply = `Welcome to Actify AI! 👋\n\nIt looks like this number isn't linked to an account yet.\n\nPlease click the secure link below to log in / sign up. It will automatically link your WhatsApp!\n\n🔗 ${authLink}`;
    } else {
      reply = await processMessage(message, userContext);
    }

    return new Response(
      `<Response><Message>${reply}</Message></Response>`,
      { headers: { "Content-Type": "text/xml" } }
    );
  }),
});

export default http;
