# Auth0 And Delegated Authorization Plan

## Objective

Make identity and permissioning foundational, not bolted on.

## Assumption Boundary

This plan is intentionally provider-aware but adapter-driven.

That means:

- we design for Auth0 login and delegated authorization now
- we isolate Token Vault specifics behind an adapter
- we validate any provider-specific endpoint or claim details against current hackathon docs during implementation

This prevents auth details from becoming a hard-coded dead end.

## Auth Strategy

### Public Surface

- landing page at `/`
- no session required

### Protected Surface

- `/app` and children require login
- unauthenticated users are redirected to Auth0

## Session Requirements

Session should expose:

- user id
- display name
- avatar if available
- email if appropriate
- coarse app roles

The session should not expose raw delegated execution secrets to the browser.

## Suggested App Flow

1. User clicks `Enter The World`
2. User is redirected to Auth0
3. Callback returns to the app shell
4. App loads the dashboard with user and policy context
5. Mission attempts route through a backend authorization layer

## Delegated Action Strategy

We should create a dedicated interface in the backend:

```ts
type DelegatedExecutionRequest = {
  userId: string;
  actionType: "browse" | "compare" | "purchase";
  resourceId: string;
  amount?: number;
  metadata?: Record<string, string | number | boolean>;
};
```

This request goes through:

1. policy validation
2. approval checks
3. Auth0 Token Vault adapter
4. execution connector

## Policy Model

At minimum, support:

- maximum spend amount
- verified shops only
- allowed action types
- approval threshold

## Step-Up Approval

Step-up confirmation should trigger when:

- spend exceeds a threshold
- shop is unverified
- mission changes the user's standing policy

Approval should appear in the right panel and optionally as a centered modal for emphasis.

## Security Principles

1. No raw execution credentials in the client
2. Short-lived delegated authorization boundary
3. Every request mapped to a user and task id
4. Every execution attempt logged
5. Rejections logged too

## Engineering Plan

### Stage 1

Implement login and protected routes.

### Stage 2

Persist user profile and policy in Convex.

### Stage 3

Add a backend adapter interface for delegated execution.

### Stage 4

Wire step-up approval states into the UI.

### Stage 5

Swap mock adapter pieces with live provider details where available.

## Failure Handling

If delegated execution is temporarily unavailable:

- the UI should still show the mission and decision flow
- the action should fail into a visible `blocked` or `simulation-only` state
- activity logs should explain what happened

## Definition Of Done

- login works
- logout works
- protected routes are protected
- session state is stable in the dashboard
- one mission can pass through a policy boundary and produce an approval or an execution path
