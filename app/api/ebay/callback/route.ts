import { NextRequest, NextResponse } from "next/server";
import { exchangeEbayCode, EBAY_BASE } from "@/lib/ebay/client";
import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Create a server-side Auth0 client to read the session in a Route Handler
const auth0 = new Auth0Client();

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      new URL(`/app/settings?ebay_error=${error ?? "no_code"}`, req.url)
    );
  }

  try {
    // Auth0 v4 App Router: getSession() reads from the request cookie context
    const session = await auth0.getSession(req);
    const auth0Id = session?.user?.sub;

    if (!auth0Id) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    const tokens = await exchangeEbayCode(code);

    // Try to get eBay username using the identity API
    let ebayUsername: string | undefined;
    try {
      const identResp = await fetch(`${EBAY_BASE}/commerce/identity/v1/user`, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      if (identResp.ok) {
        const ident = (await identResp.json()) as { username?: string };
        ebayUsername = ident.username;
      }
    } catch {
      // Identity call is optional
    }

    await convex.mutation(api.ebay.upsertEbayConnection, {
      auth0Id,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiry: Date.now() + tokens.expires_in * 1000,
      scope: "https://api.ebay.com/oauth/api_scope",
      ebayUsername,
    });

    return NextResponse.redirect(new URL("/app/settings?ebay_connected=1", req.url));
  } catch (err) {
    console.error("eBay OAuth callback error:", err);
    return NextResponse.redirect(
      new URL("/app/settings?ebay_error=exchange_failed", req.url)
    );
  }
}
