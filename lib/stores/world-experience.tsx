"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  ActivityEntry,
  CommerceProduct,
  CommerceShop,
  ExperiencePolicy,
  Mission,
  SelectedWorldEntity,
  WorldBootstrap,
  WorldEntity,
  WorldInteractionEvent,
  WorldNotice,
} from "@/lib/types";

type WorldExperienceContextValue = {
  loading: boolean;
  error?: string;
  source: "shopify" | "demo";
  shops: CommerceShop[];
  worldEntities: WorldEntity[];
  policy: ExperiencePolicy;
  activity: ActivityEntry[];
  activeMission?: Mission;
  selectedEntity?: SelectedWorldEntity;
  selectedShop?: CommerceShop;
  selectedProduct?: CommerceProduct;
  worldNotice?: WorldNotice;
  refreshCatalog: () => Promise<void>;
  handleWorldEvent: (event: WorldInteractionEvent) => void;
  selectShop: (shopId: string) => void;
  selectProduct: (shopId: string, productId: string) => void;
  launchBestDealMission: (preferredShopId?: string) => Promise<void>;
  resolveMissionApproval: (decision: "approve" | "reject") => Promise<void>;
  clearSelection: () => void;
};

const defaultPolicy: ExperiencePolicy = {
  budget: 120,
  approvalThreshold: 75,
  verifiedOnly: true,
};

const WorldExperienceContext = createContext<WorldExperienceContextValue | null>(null);

async function readJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export function WorldExperienceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [source, setSource] = useState<"shopify" | "demo">("demo");
  const [shops, setShops] = useState<CommerceShop[]>([]);
  const [worldEntities, setWorldEntities] = useState<WorldEntity[]>([]);
  const [policy, setPolicy] = useState<ExperiencePolicy>(defaultPolicy);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [activeMission, setActiveMission] = useState<Mission>();
  const [selectedEntity, setSelectedEntity] = useState<SelectedWorldEntity>();
  const [selectedProductId, setSelectedProductId] = useState<string>();
  const [worldNotice, setWorldNotice] = useState<WorldNotice>();

  const refreshCatalog = useCallback(async () => {
    setLoading(true);
    setError(undefined);

    try {
      const bootstrap = await readJson<WorldBootstrap>("/api/world/bootstrap");
      setSource(bootstrap.source);
      setShops(bootstrap.shops);
      setWorldEntities(bootstrap.worldEntities);
      setPolicy(bootstrap.policy);
      setActivity(bootstrap.activity);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to load the commerce district.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshCatalog();
  }, [refreshCatalog]);

  const selectedShop = useMemo(() => {
    if (!selectedEntity || selectedEntity.type !== "shop") return undefined;
    return shops.find((shop) => shop.id === selectedEntity.id);
  }, [selectedEntity, shops]);

  const selectedProduct = useMemo(() => {
    if (!selectedShop || !selectedProductId) return undefined;
    return selectedShop.products.find((product) => product.id === selectedProductId);
  }, [selectedProductId, selectedShop]);

  const clearSelection = useCallback(() => {
    setSelectedEntity(undefined);
    setSelectedProductId(undefined);
  }, []);

  const selectShop = useCallback(
    (shopId: string) => {
      setSelectedEntity({ id: shopId, type: "shop" });
      const shop = shops.find((candidate) => candidate.id === shopId);
      setSelectedProductId(shop?.products[0]?.id);
    },
    [shops],
  );

  const selectProduct = useCallback(
    (shopId: string, productId: string) => {
      setSelectedEntity({ id: shopId, type: "shop" });
      setSelectedProductId(productId);
    },
    [],
  );

  const handleWorldEvent = useCallback(
    (event: WorldInteractionEvent) => {
      if (event.action !== "select" && event.action !== "activate") return;

      setSelectedEntity({ id: event.entityId, type: event.entityType });

      if (event.entityType === "shop") {
        const shop = shops.find((candidate) => candidate.id === event.entityId);
        setSelectedProductId(shop?.products[0]?.id);
      } else {
        setSelectedProductId(undefined);
      }
    },
    [shops],
  );

  const appendActivity = useCallback((entries: ActivityEntry[]) => {
    setActivity((current) =>
      [...entries, ...current].sort((left, right) => right.timestamp - left.timestamp),
    );
  }, []);

  const finalizeMission = useCallback(
    async (mission: Mission, decision: "approve" | "reject") => {
      const result = await readJson<{ mission: Mission; activity: ActivityEntry[] }>(
        "/api/missions/approve",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mission,
            decision,
          }),
        },
      );

      setWorldNotice({
        title: decision === "approve" ? "Delegated action approved" : "Delegated action rejected",
        detail:
          decision === "approve"
            ? "Handing the selected product to the execution layer."
            : "Mission halted before execution.",
        tone: decision === "approve" ? "info" : "warning",
      });

      setActiveMission(result.mission);
      appendActivity(result.activity);

      if (result.mission.selectedShop) {
        setSelectedEntity({ id: result.mission.selectedShop.id, type: "shop" });
        setSelectedProductId(result.mission.selectedProduct?.id);
      }

      setWorldNotice({
        title:
          result.mission.status === "completed"
            ? "Execution completed"
            : result.mission.status === "failed"
              ? "Execution failed"
              : result.mission.status === "blocked"
                ? "Mission blocked"
                : "Mission updated",
        detail: result.mission.executionMessage ?? result.mission.explanation,
        tone:
          result.mission.status === "completed"
            ? "success"
            : result.mission.status === "failed"
              ? "error"
              : result.mission.status === "blocked"
                ? "warning"
                : "info",
      });
    },
    [appendActivity],
  );

  const launchBestDealMission = useCallback(
    async (preferredShopId?: string) => {
      try {
        setWorldNotice({
          title: "Scanning vendors...",
          detail: preferredShopId
            ? "Evaluating the selected shop against your budget."
            : "Comparing eligible products across the district.",
          tone: "info",
        });

        const result = await readJson<{ mission: Mission; activity: ActivityEntry[] }>(
          "/api/missions/best-deal",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              budget: policy.budget,
              approvalThreshold: policy.approvalThreshold,
              verifiedOnly: policy.verifiedOnly,
              preferredShopId,
            }),
          },
        );

        setActiveMission(result.mission);
        appendActivity(result.activity);

        if (result.mission.selectedShop) {
          setSelectedEntity({ id: result.mission.selectedShop.id, type: "shop" });
          setSelectedProductId(result.mission.selectedProduct?.id);
        }

        setWorldNotice({
          title:
            result.mission.status === "approval_needed"
              ? "Approval required"
              : result.mission.status === "blocked"
                ? "No eligible product found"
                : "Best product selected",
          detail: result.mission.explanation ?? result.mission.description,
          tone:
            result.mission.status === "approval_needed"
              ? "warning"
              : result.mission.status === "blocked"
                ? "warning"
                : "info",
        });

        if (result.mission.status === "executing") {
          await finalizeMission(result.mission, "approve");
        }
      } catch (missionError) {
        setWorldNotice({
          title: "Mission start failed",
          detail:
            missionError instanceof Error
              ? missionError.message
              : "The best-deal mission could not be started.",
          tone: "error",
        });
        appendActivity([
          {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            type: "error",
            title: "Mission failed to start",
            detail:
              missionError instanceof Error
                ? missionError.message
                : "The best-deal mission could not be started.",
          },
        ]);
      }
    },
    [appendActivity, finalizeMission, policy],
  );

  const resolveMissionApproval = useCallback(
    async (decision: "approve" | "reject") => {
      if (!activeMission) return;
      await finalizeMission(activeMission, decision);
    },
    [activeMission, finalizeMission],
  );

  const value = useMemo<WorldExperienceContextValue>(
    () => ({
      loading,
      error,
      source,
      shops,
      worldEntities,
      policy,
      activity,
      activeMission,
      selectedEntity,
      selectedShop,
      selectedProduct,
      worldNotice,
      refreshCatalog,
      handleWorldEvent,
      selectShop,
      selectProduct,
      launchBestDealMission,
      resolveMissionApproval,
      clearSelection,
    }),
    [
      activeMission,
      activity,
      clearSelection,
      error,
      handleWorldEvent,
      launchBestDealMission,
      loading,
      policy,
      refreshCatalog,
      resolveMissionApproval,
      selectProduct,
      selectShop,
      selectedEntity,
      selectedProduct,
      selectedShop,
      shops,
      source,
      worldNotice,
      worldEntities,
    ],
  );

  return (
    <WorldExperienceContext.Provider value={value}>
      {children}
    </WorldExperienceContext.Provider>
  );
}

export function useWorldExperience() {
  const context = useContext(WorldExperienceContext);

  if (!context) {
    throw new Error("useWorldExperience must be used within a WorldExperienceProvider");
  }

  return context;
}
