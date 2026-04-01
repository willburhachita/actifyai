import { NextResponse } from "next/server";

import { evaluateBestDealMission } from "@/lib/missions/bestDeal";
import { getWorldCatalog } from "@/lib/shopify";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    budget?: number;
    approvalThreshold?: number;
    verifiedOnly?: boolean;
    preferredShopId?: string;
  };

  const catalog = await getWorldCatalog();
  const budget = body.budget ?? catalog.policy.budget;
  const approvalThreshold = body.approvalThreshold ?? catalog.policy.approvalThreshold;
  const verifiedOnly = body.verifiedOnly ?? catalog.policy.verifiedOnly;

  const result = evaluateBestDealMission({
    shops: catalog.shops,
    budget,
    approvalThreshold,
    verifiedOnly,
    preferredShopId: body.preferredShopId,
  });

  return NextResponse.json(result);
}
