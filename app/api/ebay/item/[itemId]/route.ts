import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params;
  const hasCredentials = !!(process.env.EBAY_APP_ID && process.env.EBAY_CERT_ID &&
    !process.env.EBAY_APP_ID.startsWith("YOUR_"));

  if (hasCredentials) {
    const { getEbayItem } = await import("@/lib/ebay/client");
    try {
      const item = await getEbayItem(itemId);
      return NextResponse.json(item);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Item not found";
      return NextResponse.json({ error: message }, { status: 502 });
    }
  }

  // ── MOCK detail — realistic eBay Browse API item shape ──
  const MOCK_DETAIL: Record<string, object> = {
    "mock-elec-001": {
      itemId: "mock-elec-001",
      title: "Apple MacBook Pro 14\" M3 Pro — 18GB RAM 512GB SSD Space Black",
      image: { imageUrl: "https://i.ebayimg.com/images/g/placeholder/s-l1600.jpg" },
      price: { value: "1849.99", currency: "USD" },
      condition: "New",
      buyingOptions: ["FIXED_PRICE"],
      seller: { username: "apple_deals_pro", feedbackScore: 4821, feedbackPercentage: "99.2" },
      itemWebUrl: "https://www.ebay.com/itm/mock-001",
      localizedAspects: [
        { name: "Brand", value: "Apple" }, { name: "Model", value: "MacBook Pro 14-inch (2023)" },
        { name: "Processor", value: "Apple M3 Pro" }, { name: "RAM", value: "18 GB" },
        { name: "Storage", value: "512 GB SSD" }, { name: "Display", value: "14.2\" Liquid Retina XDR" },
        { name: "Battery Life", value: "Up to 18 hours" }, { name: "Color", value: "Space Black" },
      ],
      shippingOptions: [{ shippingServiceCode: "FedEx 2Day", shippingCost: { value: "0.00", currency: "USD" } }],
      returnTerms: { returnsAccepted: true, returnPeriod: { value: 30, unit: "DAY" } },
      description: "Brand new sealed MacBook Pro 14-inch with M3 Pro chip. Ships same day from US warehouse.",
    },
    "mock-elec-002": {
      itemId: "mock-elec-002",
      title: "NVIDIA GeForce RTX 4090 24GB GDDR6X — Founders Edition",
      image: { imageUrl: "https://i.ebayimg.com/images/g/placeholder/s-l1600.jpg" },
      price: { value: "1299.00", currency: "USD" },
      condition: "New",
      buyingOptions: ["FIXED_PRICE"],
      seller: { username: "gpu_warehouse", feedbackScore: 12540, feedbackPercentage: "99.6" },
      itemWebUrl: "https://www.ebay.com/itm/mock-002",
      localizedAspects: [
        { name: "Brand", value: "NVIDIA" }, { name: "Model", value: "RTX 4090 Founders Edition" },
        { name: "VRAM", value: "24 GB GDDR6X" }, { name: "Memory Bus", value: "384-bit" },
        { name: "TDP", value: "450W" }, { name: "Outputs", value: "3x DisplayPort 1.4a, 1x HDMI 2.1a" },
      ],
      shippingOptions: [{ shippingServiceCode: "UPS Ground", shippingCost: { value: "0.00", currency: "USD" } }],
      returnTerms: { returnsAccepted: true, returnPeriod: { value: 30, unit: "DAY" } },
    },
  };

  // Return specific mock or a generic one
  const detail = MOCK_DETAIL[itemId] ?? {
    itemId,
    title: "eBay Item — Demo Mode",
    image: { imageUrl: "https://i.ebayimg.com/images/g/placeholder/s-l1600.jpg" },
    price: { value: "99.99", currency: "USD" },
    condition: "New",
    buyingOptions: ["FIXED_PRICE"],
    seller: { username: "ebay_seller", feedbackScore: 1000, feedbackPercentage: "99.0" },
    itemWebUrl: "https://www.ebay.com",
    localizedAspects: [
      { name: "Status", value: "Demo Mode — Add eBay credentials for live data" },
    ],
    shippingOptions: [{ shippingServiceCode: "Standard Shipping", shippingCost: { value: "0.00", currency: "USD" } }],
  };

  return NextResponse.json({ ...detail, _mock: true });
}
