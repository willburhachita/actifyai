/**
 * eBay API client — server-side only.
 * Handles application token (Client Credentials) for Browse API,
 * and user token refresh for connected eBay accounts.
 */

const EBAY_ENV = process.env.EBAY_ENV ?? "sandbox";

export const EBAY_BASE = EBAY_ENV === "production"
  ? "https://api.ebay.com"
  : "https://api.sandbox.ebay.com";

export const EBAY_AUTH_BASE = EBAY_ENV === "production"
  ? "https://auth.ebay.com"
  : "https://auth.sandbox.ebay.com";

const APP_ID = process.env.EBAY_APP_ID ?? "";
const CERT_ID = process.env.EBAY_CERT_ID ?? "";

const basicAuth = Buffer.from(`${APP_ID}:${CERT_ID}`).toString("base64");

// Cache the app-level token in memory between requests
let cachedAppToken: { token: string; expiry: number } | null = null;

export async function getApplicationToken(): Promise<string> {
  if (cachedAppToken && Date.now() < cachedAppToken.expiry - 60_000) {
    return cachedAppToken.token;
  }

  const resp = await fetch(`${EBAY_BASE}/identity/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope",
    cache: "no-store",
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`eBay token fetch failed: ${resp.status} — ${text}`);
  }

  const data = (await resp.json()) as { access_token: string; expires_in: number };
  cachedAppToken = {
    token: data.access_token,
    expiry: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
}

// eBay Category IDs for the Mall
export const EBAY_CATEGORIES = {
  all:          { id: "all",   label: "All Departments", color: "#0064d2" },
  electronics:  { id: "9355",  label: "Electronics",     color: "#05e7ff" },
  fashion:      { id: "11450", label: "Fashion",          color: "#ff8aa6" },
  home:         { id: "11700", label: "Home & Garden",    color: "#8dffb3" },
  sports:       { id: "888",   label: "Sports",           color: "#ffbf5f" },
  collectibles: { id: "1",     label: "Collectibles",     color: "#7bc8ff" },
} as const;

export type EbayCategory = keyof typeof EBAY_CATEGORIES;

export type EbayItemSummary = {
  itemId: string;
  title: string;
  price: { value: string; currency: string };
  image?: { imageUrl: string };
  condition?: string;
  itemWebUrl: string;
  seller?: { username: string; feedbackScore: number; feedbackPercentage: string };
  categories?: Array<{ categoryId: string; categoryName: string }>;
  buyingOptions?: string[];
  thumbnailImages?: Array<{ imageUrl: string }>;
  shortDescription?: string;
  itemGroupHref?: string;
};

export type EbayItemDetail = EbayItemSummary & {
  description?: string;
  localizedAspects?: Array<{ name: string; value: string }>;
  shippingOptions?: Array<{
    shippingServiceCode: string;
    trademarkSymbol: string;
    shippingCost: { value: string; currency: string };
  }>;
  estimatedAvailabilities?: Array<{
    estimatedAvailabilityStatus: string;
    estimatedAvailableQuantity?: number;
  }>;
};

export type EbaySearchResult = {
  total: number;
  limit: number;
  offset: number;
  itemSummaries: EbayItemSummary[];
};

export async function searchEbayItems(params: {
  q?: string;
  categoryIds?: string;
  limit?: number;
  offset?: number;
  filter?: string;
}): Promise<EbaySearchResult> {
  const token = await getApplicationToken();
  const url = new URL(`${EBAY_BASE}/buy/browse/v1/item_summary/search`);
  if (params.q) url.searchParams.set("q", params.q);
  if (params.categoryIds) url.searchParams.set("category_ids", params.categoryIds);
  url.searchParams.set("limit", String(params.limit ?? 20));
  url.searchParams.set("offset", String(params.offset ?? 0));
  url.searchParams.set("filter", params.filter ?? "buyingOptions:{FIXED_PRICE}");

  const resp = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`eBay search failed: ${resp.status} — ${text}`);
  }

  return resp.json() as Promise<EbaySearchResult>;
}

export async function getEbayItem(itemId: string): Promise<EbayItemDetail> {
  const token = await getApplicationToken();
  const resp = await fetch(`${EBAY_BASE}/buy/browse/v1/item/${encodeURIComponent(itemId)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
    },
    cache: "no-store",
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`eBay getItem failed: ${resp.status} — ${text}`);
  }

  return resp.json() as Promise<EbayItemDetail>;
}

/** Build the eBay OAuth authorization URL */
export function buildEbayAuthUrl(state: string): string {
  const redirectUri = process.env.EBAY_REDIRECT_URI ?? "";
  const scopes = [
    "https://api.ebay.com/oauth/api_scope",
    "https://api.ebay.com/oauth/api_scope/commerce.identity.readonly",
  ].join("%20");

  return `${EBAY_AUTH_BASE}/oauth2/authorize?client_id=${APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopes}&state=${state}`;
}

/** Exchange authorization code for tokens */
export async function exchangeEbayCode(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  const redirectUri = process.env.EBAY_REDIRECT_URI ?? "";
  const resp = await fetch(`${EBAY_BASE}/identity/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }).toString(),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`eBay code exchange failed: ${resp.status} — ${text}`);
  }

  return resp.json() as Promise<{ access_token: string; refresh_token: string; expires_in: number }>;
}
