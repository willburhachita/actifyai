import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ebayItemId = String(body.ebayItemId ?? "").trim();

    if (!ebayItemId) {
      return NextResponse.json(
        { success: false, error: "ebayItemId is required" },
        { status: 400 }
      );
    }

    let checkoutUrl = `https://www.ebay.com/itm/${encodeURIComponent(ebayItemId)}`;

    if (!ebayItemId.startsWith("mock-")) {
      try {
        const { getEbayItem } = await import("@/lib/ebay/client");
        const item = await getEbayItem(ebayItemId);
        checkoutUrl = item.itemWebUrl || checkoutUrl;
      } catch (error) {
        console.warn("[ebay/order] Falling back to listing URL", error);
      }
    }

    return NextResponse.json({
      success: true,
      verified: true,
      checkoutUrl,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to prepare eBay checkout";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
