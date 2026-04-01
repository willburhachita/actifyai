# Backend And Data Plan

## Backend Objective

Support a realtime, explainable agent flow without overbuilding infrastructure.

## Recommended Backend

Convex for:

- user profile storage
- policy and mission state
- shop and product catalog
- activity stream
- approval objects
- agent task lifecycle

## Core Tables

### `users`

- `auth0Id`
- `email`
- `displayName`
- `avatarUrl`
- `createdAt`

### `agentProfiles`

- `userId`
- `name`
- `maxBudget`
- `approvalThreshold`
- `verifiedOnly`
- `allowedActions`
- `createdAt`
- `updatedAt`

### `shops`

- `slug`
- `name`
- `isVerified`
- `summary`
- `zoneId`

### `products`

- `shopId`
- `name`
- `price`
- `currency`
- `category`
- `isAvailable`
- `metadata`

### `worldEntities`

- `entityId`
- `entityType`
- `label`
- `panelKey`
- `shopId`
- `sceneId`
- `position`
- `metadata`

### `agentTasks`

- `userId`
- `type`
- `status`
- `input`
- `decision`
- `requiresApproval`
- `selectedResourceId`
- `createdAt`
- `updatedAt`

### `approvals`

- `taskId`
- `userId`
- `status`
- `reason`
- `expiresAt`

### `activityEvents`

- `userId`
- `taskId`
- `eventType`
- `title`
- `detail`
- `metadata`
- `createdAt`

### `orders`

- `taskId`
- `userId`
- `shopId`
- `productId`
- `status`
- `amount`
- `executionReference`

## Core Backend Functions

### Queries

- get current user profile
- get dashboard summary
- get world entities for active scene
- get shop detail by entity id
- list recent activity

### Mutations

- upsert user profile
- update agent policy
- create mission task
- submit approval response
- seed demo data

### Actions

- orchestrate mission evaluation
- request delegated execution
- call AI reasoning service
- execute external purchase adapter

## Agent Task Lifecycle

Suggested states:

- `queued`
- `evaluating`
- `awaiting_approval`
- `authorized`
- `executing`
- `completed`
- `failed`
- `blocked`

## Reasoning Contract

The AI should return structured output, not prose-only output.

Required fields:

- selected product or `none`
- explanation
- confidence
- policy notes
- whether approval is required

## Activity Strategy

Every material state change becomes an activity event.

Examples:

- `mission_created`
- `catalog_compared`
- `approval_requested`
- `approval_granted`
- `execution_started`
- `execution_completed`
- `execution_failed`

## Demo Seed Data

Start with:

- one scene
- three shops
- six to nine products
- one default mission
- one default user policy

## Dead-End Avoidance

1. Store world entity references separately from shop data.
2. Keep AI decisions and execution state in separate fields.
3. Make activity events append-only.
4. Treat approvals as first-class records, not booleans.

## Definition Of Done

- the frontend can load a stable seeded scene
- the backend can create and progress a mission
- the activity log reflects the real task lifecycle
