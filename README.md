# Actify AI

Actify AI is a game-like agent commerce experience where a user enters a world, gives an AI agent clear permissions, and watches that agent browse, decide, and act securely on the user's behalf.

This repository is currently a docs-first build plan so we can move fast without painting ourselves into a corner.

## What We Are Building First

We are intentionally building in this order:

1. Landing page
2. Auth0 authentication
3. Protected dashboard shell
4. Three-pane dashboard layout
5. Game world embedded in the center pane
6. Agent decisions, approvals, and activity logging

That order keeps us from creating flashy UI that has to be rewritten once auth, state, and real interactions arrive.

## Experience Summary

- Left pane: navigation, user profile, agent controls, mission shortcuts
- Center pane: the playable world and live agent activity
- Right pane: context-aware detail panel based on what the user clicks or what the agent is doing

## Proposed Stack

- Frontend app: Next.js with App Router and TypeScript
- Styling: Tailwind CSS plus a small design token layer
- Game viewport: Phaser embedded inside React
- Auth: Auth0 with a Token Vault integration layer
- Backend and realtime data: Convex
- AI orchestration: OpenAI API behind a backend action layer

## Documentation Map

Start with `docs/README.md`.

Core docs:

- `docs/product/vision.md`
- `docs/product/prd.md`
- `docs/product/roadmap.md`
- `docs/design/landing-page.md`
- `docs/design/dashboard-layout.md`
- `docs/design/game-world.md`
- `docs/engineering/architecture.md`
- `docs/engineering/auth0-plan.md`
- `docs/engineering/frontend-architecture.md`
- `docs/engineering/backend-and-data.md`
- `docs/engineering/implementation-checklist.md`

Agent briefs:

- `agents/README.md`
- `agents/product-strategist.md`
- `agents/frontend-landing-auth.md`
- `agents/dashboard-game-builder.md`
- `agents/backend-auth0-convex.md`
- `agents/qa-demo-operator.md`

## North Star

The product should feel like this:

- A premium, technical, game-like interface
- A real auth and permission story that judges can trust
- A visible AI decision loop with strong observability
- A demo that works even if external integrations are partially mocked

## Build Principle

Every system we add should satisfy one of these rules:

- It directly supports the hackathon demo
- It reduces implementation risk later
- It makes the core agent-action story easier to understand

If it does not do one of those, it waits.
