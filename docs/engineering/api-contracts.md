# API And Interaction Contracts

## Purpose

These contracts keep the left rail, world canvas, right panel, and backend task system aligned.

## Frontend To Backend Contracts

### Create Mission

```ts
type CreateMissionInput = {
  missionType: "best_verified_deal" | "lowest_price" | "policy_review";
  budget?: number;
  category?: string;
  sourceEntityId?: string;
};
```

### Mission Result

```ts
type MissionResult = {
  taskId: string;
  status:
    | "queued"
    | "evaluating"
    | "awaiting_approval"
    | "authorized"
    | "executing"
    | "completed"
    | "failed"
    | "blocked";
};
```

### Approval Response

```ts
type ApprovalResponseInput = {
  taskId: string;
  decision: "approve" | "reject";
};
```

## World To React Contracts

### World Interaction Event

```ts
type WorldInteractionEvent = {
  entityId: string;
  entityType: "shop" | "mission" | "approval_point" | "activity_feed" | "system_zone";
  action: "hover" | "select" | "activate";
};
```

### World Selection View Model

```ts
type WorldSelectionViewModel = {
  entityId: string;
  title: string;
  subtitle: string;
  panelKey: string;
  status?: string;
  metadata?: Record<string, string | number | boolean>;
};
```

## Backend To Right Panel Contracts

### Context Panel Payload

```ts
type ContextPanelPayload =
  | {
      kind: "overview";
      greeting: string;
      suggestedMission?: string;
      recentSummary: string;
    }
  | {
      kind: "shop";
      entityId: string;
      shopId: string;
      title: string;
      isVerified: boolean;
      summary: string;
      featuredProducts: Array<{
        productId: string;
        name: string;
        price: number;
      }>;
    }
  | {
      kind: "mission";
      entityId: string;
      title: string;
      description: string;
      recommendedActionLabel: string;
    }
  | {
      kind: "approval";
      taskId: string;
      title: string;
      explanation: string;
      amount?: number;
      expiresAt?: number;
    }
  | {
      kind: "activity";
      taskId?: string;
      items: Array<{
        id: string;
        title: string;
        detail: string;
        createdAt: number;
      }>;
    };
```

## AI Decision Contract

```ts
type AgentDecision = {
  selectedProductId: string | null;
  selectedShopId: string | null;
  explanation: string;
  confidence: number;
  requiresApproval: boolean;
  policyNotes: string[];
};
```

## Logging Contract

```ts
type ActivityEvent = {
  eventType:
    | "mission_created"
    | "catalog_compared"
    | "approval_requested"
    | "approval_granted"
    | "approval_rejected"
    | "execution_started"
    | "execution_completed"
    | "execution_failed";
  title: string;
  detail: string;
  metadata?: Record<string, string | number | boolean>;
};
```

## Contract Rules

1. The world only emits stable ids and types.
2. The right panel never reads raw Phaser internals.
3. The AI must return structured decision data.
4. Logs must remain append-only.
5. Approval state must be reconstructible from data, not inferred from UI.
