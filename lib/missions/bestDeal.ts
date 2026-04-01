import type { ActivityEntry, CommerceProduct, CommerceShop, Mission, WorldBootstrap } from "@/lib/types";

type EvaluateBestDealInput = {
  shops: CommerceShop[];
  budget: number;
  approvalThreshold: number;
  verifiedOnly: boolean;
  preferredShopId?: string;
};

type EvaluateBestDealResult = {
  mission: Mission;
  activity: ActivityEntry[];
};

function createActivityEntry(
  type: ActivityEntry["type"],
  title: string,
  detail: string,
  missionId?: string,
): ActivityEntry {
  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    type,
    title,
    detail,
    missionId,
  };
}

function rankProducts(products: Array<{ product: CommerceProduct; shop: CommerceShop }>) {
  return [...products].sort((left, right) => {
    if (left.product.price !== right.product.price) {
      return left.product.price - right.product.price;
    }

    if (left.shop.verified !== right.shop.verified) {
      return left.shop.verified ? -1 : 1;
    }

    return left.product.title.localeCompare(right.product.title);
  });
}

export function evaluateBestDealMission({
  shops,
  budget,
  approvalThreshold,
  verifiedOnly,
  preferredShopId,
}: EvaluateBestDealInput): EvaluateBestDealResult {
  const missionId = crypto.randomUUID();
  const startedAt = Date.now();
  const scope = preferredShopId ? shops.filter((shop) => shop.id === preferredShopId) : shops;
  const candidateProducts = scope.flatMap((shop) =>
    shop.products
      .filter((product) => product.availableForSale)
      .filter((product) => (verifiedOnly ? shop.verified : true))
      .filter((product) => product.price <= budget)
      .map((product) => ({ shop, product })),
  );

  const activity: ActivityEntry[] = [
    createActivityEntry(
      "system",
      "Mission queued",
      preferredShopId
        ? "Agent locked onto a selected shop and is preparing the comparison."
        : "Agent is scanning all eligible shops in the commerce district.",
      missionId,
    ),
    createActivityEntry(
      "decision",
      "Catalog scan started",
      `Compared ${scope.length} shop${scope.length === 1 ? "" : "s"} against a budget of $${budget}.`,
      missionId,
    ),
  ];

  const rankedProducts = rankProducts(candidateProducts);
  const winningCandidate = rankedProducts[0];

  if (!winningCandidate) {
    const mission: Mission = {
      id: missionId,
      type: "best_verified_deal",
      title: "Find the best verified deal",
      description: "Search eligible shops and surface the most budget-friendly available product.",
      status: "blocked",
      explanation: "No available product matched the active budget and policy.",
      budget,
      approvalThreshold,
      createdAt: startedAt,
      updatedAt: Date.now(),
    };

    return {
      mission,
      activity: [
        ...activity,
        createActivityEntry(
          "error",
          "Mission blocked",
          "No available product matched the active budget and verification policy.",
          missionId,
        ),
      ],
    };
  }

  const requiresApproval = winningCandidate.product.price > approvalThreshold;
  const status = requiresApproval ? "approval_needed" : "executing";
  const explanation = `${winningCandidate.product.title} is the lowest-priced eligible product at $${winningCandidate.product.price.toFixed(
    2,
  )} from ${winningCandidate.shop.label}.`;

  const mission: Mission = {
    id: missionId,
    type: "best_verified_deal",
    title: "Find the best verified deal",
    description: "Search eligible shops and surface the most budget-friendly available product.",
    status,
    explanation,
    budget,
    approvalThreshold,
    selectedShop: winningCandidate.shop,
    selectedProduct: winningCandidate.product,
    createdAt: startedAt,
    updatedAt: Date.now(),
  };

  activity.push(
    createActivityEntry(
      "decision",
      "Best product selected",
      `${winningCandidate.product.title} was selected from ${winningCandidate.shop.label}.`,
      missionId,
    ),
  );

  if (requiresApproval) {
    activity.push(
      createActivityEntry(
        "approval",
        "Approval required",
        `The selected product exceeds the approval threshold of $${approvalThreshold}.`,
        missionId,
      ),
    );
  } else {
    activity.push(
      createActivityEntry(
        "action",
        "Execution started",
        "The delegated execution adapter is preparing a cart or a simulated purchase.",
        missionId,
      ),
    );
  }

  return { mission, activity };
}

export function buildInitialActivity(bootstrap: WorldBootstrap): ActivityEntry[] {
  return [
    {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type: "system",
      title: "World synced",
      detail:
        bootstrap.source === "shopify"
          ? "Shopify collections were imported into the commerce district."
          : "Demo fallback catalog loaded because live Shopify data was unavailable.",
    },
  ];
}
