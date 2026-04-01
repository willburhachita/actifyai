import { NextResponse } from "next/server";
import { buildEbayAuthUrl } from "@/lib/ebay/client";
import crypto from "crypto";

export async function GET() {
  // Generate a random state to prevent CSRF
  const state = crypto.randomBytes(16).toString("hex");

  // In production you'd store state in a cookie/session; for now redirect directly
  const authUrl = buildEbayAuthUrl(state);

  return NextResponse.redirect(authUrl);
}
