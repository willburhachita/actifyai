import "server-only";

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_FROM_NUMBER =
  process.env.TWILIO_WHATSAPP_FROM_NUMBER ??
  process.env.NEXT_PUBLIC_TWILIO_WHATSAPP_NUMBER;

export function getConfiguredWhatsAppNumber() {
  return TWILIO_WHATSAPP_FROM_NUMBER ?? "whatsapp:+14155238886";
}

export async function sendWhatsAppMessage(args: {
  to: string;
  body: string;
}) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM_NUMBER) {
    throw new Error("Twilio WhatsApp environment variables are incomplete.");
  }

  const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");
  const form = new URLSearchParams({
    From: TWILIO_WHATSAPP_FROM_NUMBER,
    To: args.to,
    Body: args.body,
  });

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Twilio send failed: ${response.status} - ${text}`);
  }

  return (await response.json()) as { sid: string; status: string };
}

export function buildTwiMLMessage(message: string) {
  const escaped = message
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

  return `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escaped}</Message></Response>`;
}
