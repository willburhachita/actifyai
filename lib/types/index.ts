// ===== World Interaction Events =====
export type WorldEntityType =
  | "shop"
  | "mission"
  | "approval_point"
  | "activity_feed"
  | "system_zone";

export type WorldInteractionAction = "hover" | "select" | "activate";

export type WorldInteractionEvent = {
  entityId: string;
  entityType: WorldEntityType;
  action: WorldInteractionAction;
};

export type WorldPosition = {
  x: number;
  y: number;
};

// ===== Commerce Catalog =====
export type CommerceProduct = {
  id: string;
  shopId: string;
  title: string;
  handle: string;
  description: string;
  vendor: string;
  price: number;
  currencyCode: string;
  availableForSale: boolean;
  image?: string;
  variantId?: string;
  checkoutUrl?: string;
};

export type CommerceShopSource = "shopify" | "demo";

export type CommerceShop = {
  id: string;
  slug: string;
  label: string;
  description: string;
  verified: boolean;
  source: CommerceShopSource;
  color: string;
  position: WorldPosition;
  image?: string;
  products: CommerceProduct[];
};

// ===== World Entity Config =====
export type WorldEntity = {
  id: string;
  type: WorldEntityType;
  label: string;
  description: string;
  position: WorldPosition;
  verified?: boolean;
  accentColor?: string;
  shopId?: string;
  metadata?: Record<string, string | number | boolean>;
};

// ===== Panel State =====
export type PanelMode =
  | "overview"
  | "entity_detail"
  | "mission_active"
  | "approval_pending"
  | "activity_detail"
  | "settings";

export type PanelState = {
  mode: PanelMode;
  entityId?: string;
  entityType?: WorldEntityType;
  missionId?: string;
};

export type SelectedWorldEntity = {
  id: string;
  type: WorldEntityType;
};

// ===== Agent & Mission =====
export type MissionStatus =
  | "idle"
  | "queued"
  | "evaluating"
  | "approval_needed"
  | "executing"
  | "completed"
  | "blocked"
  | "failed";

export type MissionType = "best_verified_deal";

export type Mission = {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  status: MissionStatus;
  explanation?: string;
  budget: number;
  approvalThreshold: number;
  selectedShop?: CommerceShop;
  selectedProduct?: CommerceProduct;
  executionMessage?: string;
  executionMode?: "mock" | "shopify";
  checkoutUrl?: string;
  createdAt: number;
  updatedAt: number;
};

// ===== Activity Log =====
export type ActivityEntryType =
  | "action"
  | "decision"
  | "approval"
  | "error"
  | "system";

export type ActivityEntry = {
  id: string;
  timestamp: number;
  type: ActivityEntryType;
  title: string;
  detail: string;
  missionId?: string;
};

// ===== World Bootstrap =====
export type ExperiencePolicy = {
  budget: number;
  approvalThreshold: number;
  verifiedOnly: boolean;
};

export type WorldBootstrap = {
  source: CommerceShopSource;
  shops: CommerceShop[];
  worldEntities: WorldEntity[];
  policy: ExperiencePolicy;
  activity: ActivityEntry[];
};

export type WorldNoticeTone = "info" | "success" | "warning" | "error";

export type WorldNotice = {
  title: string;
  detail?: string;
  tone: WorldNoticeTone;
};

// ===== Delegated Execution =====
export type DelegatedExecutionRequest = {
  userId: string;
  actionType: "browse" | "compare" | "purchase";
  resourceId: string;
  amount?: number;
  metadata?: Record<string, string | number | boolean>;
};

// ===== User Session (frontend-safe) =====
export type AppUser = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
};
