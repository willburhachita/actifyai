import { NextRequest, NextResponse } from "next/server";

// ── Mock eBay Browse API response ──────────────────────────────────────────
// Structured exactly like the real eBay Browse API so the frontend hooks work
// unchanged once real credentials are added.

const MOCK_ITEMS: Record<string, object[]> = {
  electronics: [
    { itemId: "mock-elec-001", title: "Apple MacBook Pro 14\" M3 Pro — 18GB RAM 512GB SSD Space Black", price: { value: "1849.99", currency: "USD" }, image: { imageUrl: "https://i.ebayimg.com/images/g/placeholder/s-l500.jpg" }, condition: "New", buyingOptions: ["FIXED_PRICE"], seller: { username: "apple_deals_pro", feedbackScore: 4821, feedbackPercentage: "99.2" }, itemWebUrl: "https://www.ebay.com/itm/mock-001", thumbnailImages: [] },
    { itemId: "mock-elec-002", title: "NVIDIA GeForce RTX 4090 24GB GDDR6X — Founders Edition", price: { value: "1299.00", currency: "USD" }, image: { imageUrl: "https://i.ebayimg.com/images/g/placeholder/s-l500.jpg" }, condition: "New", buyingOptions: ["FIXED_PRICE"], seller: { username: "gpu_warehouse", feedbackScore: 12540, feedbackPercentage: "99.6" }, itemWebUrl: "https://www.ebay.com/itm/mock-002", thumbnailImages: [] },
    { itemId: "mock-elec-003", title: "Samsung Galaxy S25 Ultra 256GB — Titanium Black Unlocked", price: { value: "899.99", currency: "USD" }, image: { imageUrl: "https://i.ebayimg.com/images/g/placeholder/s-l500.jpg" }, condition: "New", buyingOptions: ["FIXED_PRICE", "BEST_OFFER"], seller: { username: "mobile_city_store", feedbackScore: 7231, feedbackPercentage: "98.9" }, itemWebUrl: "https://www.ebay.com/itm/mock-003", thumbnailImages: [] },
    { itemId: "mock-elec-004", title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones — Black", price: { value: "279.95", currency: "USD" }, image: { imageUrl: "https://i.ebayimg.com/images/g/placeholder/s-l500.jpg" }, condition: "New", buyingOptions: ["FIXED_PRICE"], seller: { username: "audiotech_direct", feedbackScore: 3018, feedbackPercentage: "99.4" }, itemWebUrl: "https://www.ebay.com/itm/mock-004", thumbnailImages: [] },
    { itemId: "mock-elec-005", title: "Apple iPad Pro 13\" M4 Chip WiFi + Cellular 256GB — Silver", price: { value: "1149.00", currency: "USD" }, image: { imageUrl: "https://i.ebayimg.com/images/g/placeholder/s-l500.jpg" }, condition: "New", buyingOptions: ["FIXED_PRICE"], seller: { username: "itech_solutions", feedbackScore: 9102, feedbackPercentage: "99.7" }, itemWebUrl: "https://www.ebay.com/itm/mock-005", thumbnailImages: [] },
    { itemId: "mock-elec-006", title: "DJI Mini 4 Pro Drone with RC 2 Remote — Fly More Combo", price: { value: "959.00", currency: "USD" }, image: { imageUrl: "https://i.ebayimg.com/images/g/placeholder/s-l500.jpg" }, condition: "New", buyingOptions: ["FIXED_PRICE", "BEST_OFFER"], seller: { username: "drone_zone_usa", feedbackScore: 2241, feedbackPercentage: "98.7" }, itemWebUrl: "https://www.ebay.com/itm/mock-006", thumbnailImages: [] },
  ],
  fashion: [
    { itemId: "mock-fash-001", title: "Nike Air Jordan 1 Retro High OG \"Chicago\" Size 10 DS", price: { value: "389.99", currency: "USD" }, image: { imageUrl: "https://i.ebayimg.com/images/g/placeholder/s-l500.jpg" }, condition: "New", buyingOptions: ["FIXED_PRICE", "BEST_OFFER"], seller: { username: "kicks_connect", feedbackScore: 5234, feedbackPercentage: "99.1" }, itemWebUrl: "https://www.ebay.com/itm/mock-f01", thumbnailImages: [] },
    { itemId: "mock-fash-002", title: "Louis Vuitton Neverfull MM Monogram Tote Bag — Authentic", price: { value: "1350.00", currency: "USD" }, image: { imageUrl: "https://i.ebayimg.com/images/g/placeholder/s-l500.jpg" }, condition: "Used — Excellent", buyingOptions: ["FIXED_PRICE"], seller: { username: "luxury_resale_nyc", feedbackScore: 3120, feedbackPercentage: "99.8" }, itemWebUrl: "https://www.ebay.com/itm/mock-f02", thumbnailImages: [] },
    { itemId: "mock-fash-003", title: "Supreme Box Logo Hoodie FW23 — Black Size Large BNWT", price: { value: "449.00", currency: "USD" }, image: { imageUrl: "https://i.ebayimg.com/images/g/placeholder/s-l500.jpg" }, condition: "New with tags", buyingOptions: ["FIXED_PRICE", "BEST_OFFER"], seller: { username: "streetwear_vault", feedbackScore: 1897, feedbackPercentage: "98.5" }, itemWebUrl: "https://www.ebay.com/itm/mock-f03", thumbnailImages: [] },
    { itemId: "mock-fash-004", title: "Rolex Submariner Date 126610LN — Stainless Steel 41mm", price: { value: "12500.00", currency: "USD" }, image: { imageUrl: "https://i.ebayimg.com/images/g/placeholder/s-l500.jpg" }, condition: "Pre-owned", buyingOptions: ["FIXED_PRICE"], seller: { username: "certified_timepieces", feedbackScore: 8901, feedbackPercentage: "99.9" }, itemWebUrl: "https://www.ebay.com/itm/mock-f04", thumbnailImages: [] },
    { itemId: "mock-fash-005", title: "Adidas Yeezy Boost 350 V2 \"Zebra\" CP9654 Size 11", price: { value: "249.95", currency: "USD" }, image: { imageUrl: "https://i.ebayimg.com/images/g/placeholder/s-l500.jpg" }, condition: "New", buyingOptions: ["AUCTION", "BEST_OFFER"], seller: { username: "sneaker_lab", feedbackScore: 6402, feedbackPercentage: "99.3" }, itemWebUrl: "https://www.ebay.com/itm/mock-f05", thumbnailImages: [] },
  ],
  home: [
    { itemId: "mock-home-001", title: "Dyson V15 Detect Cordless Vacuum Cleaner — Gold/Iron", price: { value: "549.99", currency: "USD" }, image: { imageUrl: "https://i.ebayimg.com/images/g/placeholder/s-l500.jpg" }, condition: "New", buyingOptions: ["FIXED_PRICE"], seller: { username: "dyson_authorized", feedbackScore: 11230, feedbackPercentage: "99.5" }, itemWebUrl: "https://www.ebay.com/itm/mock-h01", thumbnailImages: [] },
    { itemId: "mock-home-002", title: "Weber Spirit II E-310 3-Burner LP Gas Grill — Black", price: { value: "479.00", currency: "USD" }, image: { imageUrl: "https://i.ebayimg.com/images/g/placeholder/s-l500.jpg" }, condition: "New", buyingOptions: ["FIXED_PRICE", "BEST_OFFER"], seller: { username: "grillmaster_depot", feedbackScore: 4312, feedbackPercentage: "98.8" }, itemWebUrl: "https://www.ebay.com/itm/mock-h02", thumbnailImages: [] },
    { itemId: "mock-home-003", title: "DeWalt 20V MAX Cordless Drill Driver Kit — DCD777C2", price: { value: "119.00", currency: "USD" }, image: { imageUrl: "https://i.ebayimg.com/images/g/placeholder/s-l500.jpg" }, condition: "New", buyingOptions: ["FIXED_PRICE"], seller: { username: "tools_express", feedbackScore: 8901, feedbackPercentage: "99.1" }, itemWebUrl: "https://www.ebay.com/itm/mock-h03", thumbnailImages: [] },
    { itemId: "mock-home-004", title: "Philips Hue White & Color Ambiance Starter Kit — 4 Bulbs + Bridge", price: { value: "189.95", currency: "USD" }, image: { imageUrl: "https://i.ebayimg.com/images/g/placeholder/s-l500.jpg" }, condition: "New", buyingOptions: ["FIXED_PRICE"], seller: { username: "smarthome_hub", feedbackScore: 3201, feedbackPercentage: "99.4" }, itemWebUrl: "https://www.ebay.com/itm/mock-h04", thumbnailImages: [] },
  ],
  sports: [
    { itemId: "mock-sport-001", title: "Pokémon Charizard VMAX Secret Rare 074/073 — PSA 10 GEM MINT", price: { value: "2450.00", currency: "USD" }, image: { imageUrl: "https://i.ebayimg.com/images/g/placeholder/s-l500.jpg" }, condition: "Graded — PSA 10", buyingOptions: ["AUCTION"], seller: { username: "card_vault_elite", feedbackScore: 4102, feedbackPercentage: "99.7" }, itemWebUrl: "https://www.ebay.com/itm/mock-s01", thumbnailImages: [] },
    { itemId: "mock-sport-002", title: "Peloton Bike+ — Touchscreen Indoor Exercise Bike Refurbished", price: { value: "1295.00", currency: "USD" }, image: { imageUrl: "https://i.ebayimg.com/images/g/placeholder/s-l500.jpg" }, condition: "Certified Refurbished", buyingOptions: ["FIXED_PRICE"], seller: { username: "peloton_certified", feedbackScore: 2801, feedbackPercentage: "98.9" }, itemWebUrl: "https://www.ebay.com/itm/mock-s02", thumbnailImages: [] },
    { itemId: "mock-sport-003", title: "LeBron James Rookie Card 2003-04 Upper Deck #1 — BGS 9.5", price: { value: "3800.00", currency: "USD" }, image: { imageUrl: "https://i.ebayimg.com/images/g/placeholder/s-l500.jpg" }, condition: "Graded — BGS 9.5", buyingOptions: ["FIXED_PRICE", "BEST_OFFER"], seller: { username: "sports_cards_pro", feedbackScore: 7821, feedbackPercentage: "99.6" }, itemWebUrl: "https://www.ebay.com/itm/mock-s03", thumbnailImages: [] },
    { itemId: "mock-sport-004", title: "Callaway Paradym X Driver 10.5° — Regular Flex New", price: { value: "349.00", currency: "USD" }, image: { imageUrl: "https://i.ebayimg.com/images/g/placeholder/s-l500.jpg" }, condition: "New", buyingOptions: ["FIXED_PRICE", "BEST_OFFER"], seller: { username: "golf_galaxy_store", feedbackScore: 5190, feedbackPercentage: "99.2" }, itemWebUrl: "https://www.ebay.com/itm/mock-s04", thumbnailImages: [] },
  ],
  collectibles: [
    { itemId: "mock-coll-001", title: "Amazing Spider-Man #300 CGC 9.8 — First Venom 1988 Marvel", price: { value: "3950.00", currency: "USD" }, image: { imageUrl: "https://i.ebayimg.com/images/g/placeholder/s-l500.jpg" }, condition: "Graded — CGC 9.8", buyingOptions: ["FIXED_PRICE"], seller: { username: "cgc_comics_vault", feedbackScore: 6231, feedbackPercentage: "99.8" }, itemWebUrl: "https://www.ebay.com/itm/mock-c01", thumbnailImages: [] },
    { itemId: "mock-coll-002", title: "1952 Topps Mickey Mantle #311 Baseball Card — SGC 4", price: { value: "18500.00", currency: "USD" }, image: { imageUrl: "https://i.ebayimg.com/images/g/placeholder/s-l500.jpg" }, condition: "Graded — SGC 4", buyingOptions: ["FIXED_PRICE", "BEST_OFFER"], seller: { username: "vintage_card_king", feedbackScore: 3401, feedbackPercentage: "99.9" }, itemWebUrl: "https://www.ebay.com/itm/mock-c02", thumbnailImages: [] },
    { itemId: "mock-coll-003", title: "LEGO Star Wars Millennium Falcon 75192 — Factory Sealed MISB", price: { value: "899.95", currency: "USD" }, image: { imageUrl: "https://i.ebayimg.com/images/g/placeholder/s-l500.jpg" }, condition: "New", buyingOptions: ["FIXED_PRICE"], seller: { username: "brick_collector_us", feedbackScore: 8120, feedbackPercentage: "99.4" }, itemWebUrl: "https://www.ebay.com/itm/mock-c03", thumbnailImages: [] },
    { itemId: "mock-coll-004", title: "1921 Morgan Silver Dollar AU-58 — Mint State Nearly Uncirculated", price: { value: "142.00", currency: "USD" }, image: { imageUrl: "https://i.ebayimg.com/images/g/placeholder/s-l500.jpg" }, condition: "Graded — AU-58", buyingOptions: ["AUCTION"], seller: { username: "coin_world_store", feedbackScore: 12012, feedbackPercentage: "99.1" }, itemWebUrl: "https://www.ebay.com/itm/mock-c04", thumbnailImages: [] },
    { itemId: "mock-coll-005", title: "Hot Wheels Red Line 1969 Volkswagen Beach Bomb — Rear-Load Prototype", price: { value: "72000.00", currency: "USD" }, image: { imageUrl: "https://i.ebayimg.com/images/g/placeholder/s-l500.jpg" }, condition: "Used", buyingOptions: ["BEST_OFFER"], seller: { username: "rare_diecast_finds", feedbackScore: 921, feedbackPercentage: "100.0" }, itemWebUrl: "https://www.ebay.com/itm/mock-c05", thumbnailImages: [] },
  ],
};

const CATEGORY_MAP: Record<string, string> = {
  electronics: "9355",
  fashion: "11450",
  home: "11700",
  sports: "888",
  collectibles: "1",
};

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const categoryIds = req.nextUrl.searchParams.get("category_ids") ?? "";
  const limit = Number(req.nextUrl.searchParams.get("limit") ?? "20");

  // Check if real credentials exist
  const hasCredentials = !!(process.env.EBAY_APP_ID && process.env.EBAY_CERT_ID &&
    !process.env.EBAY_APP_ID.startsWith("YOUR_"));

  if (hasCredentials) {
    // Forward to real eBay API
    const { searchEbayItems } = await import("@/lib/ebay/client");
    try {
      const result = await searchEbayItems({ q, categoryIds, limit, offset: 0 });
      return NextResponse.json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "eBay search failed";
      return NextResponse.json({ error: message }, { status: 502 });
    }
  }

  // ── MOCK MODE ── Return dummy data shaped like the real Browse API
  // Determine which category to return
  let category = "electronics";
  for (const [key, id] of Object.entries(CATEGORY_MAP)) {
    if (categoryIds.includes(id) || q.toLowerCase().includes(key)) {
      category = key;
      break;
    }
  }
  // "all" = mix items from every department
  if (categoryIds === "all" || q === "" && !categoryIds) category = "all";

  let items: object[];
  if (category === "all") {
    // Interleave one item from each department for a unified feed
    const keys = Object.keys(MOCK_ITEMS);
    const maxLen = Math.max(...keys.map(k => MOCK_ITEMS[k].length));
    items = [];
    for (let i = 0; i < maxLen; i++) {
      for (const k of keys) {
        if (MOCK_ITEMS[k][i]) items.push(MOCK_ITEMS[k][i]);
      }
    }
  } else {
    items = MOCK_ITEMS[category] ?? MOCK_ITEMS.electronics;
  }

  const filtered = q
    ? items.filter((it: any) => it.title.toLowerCase().includes(q.toLowerCase()))
    : items;

  const sliced = filtered.slice(0, limit);

  return NextResponse.json({
    href: `/api/ebay/search?q=${encodeURIComponent(q)}&category_ids=${categoryIds}`,
    total: filtered.length,
    limit,
    offset: 0,
    itemSummaries: sliced,
    _mock: true,
  });
}
