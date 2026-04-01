import { NextResponse } from "next/server";

import { buildInitialActivity } from "@/lib/missions/bestDeal";
import { getWorldCatalog } from "@/lib/shopify";

export async function GET() {
  const catalog = await getWorldCatalog();
  const activity = buildInitialActivity({
    source: catalog.source,
    shops: catalog.shops,
    worldEntities: catalog.worldEntities,
    policy: catalog.policy,
    activity: [],
  });

  return NextResponse.json({
    ...catalog,
    activity,
  });
}
