# Documentation Index

This folder is the operating system for the build.

The main goal is to remove dead ends before implementation starts. Each doc answers a different planning question so we can move from landing page to auth to dashboard to world without rework.

## Read In This Order

1. `docs/product/vision.md`
2. `docs/product/prd.md`
3. `docs/product/roadmap.md`
4. `docs/design/landing-page.md`
5. `docs/design/dashboard-layout.md`
6. `docs/design/game-world.md`
7. `docs/engineering/architecture.md`
8. `docs/engineering/auth0-plan.md`
9. `docs/engineering/frontend-architecture.md`
10. `docs/engineering/backend-and-data.md`
11. `docs/engineering/api-contracts.md`
12. `docs/engineering/implementation-checklist.md`

## Folder Structure

- `docs/product`: product vision, requirements, roadmap, demo story
- `docs/design`: UX, visual system, landing page, dashboard, game world
- `docs/engineering`: architecture, data model, auth, frontend, backend, testing, delivery

## Three Non-Negotiables

1. Do not build the world before auth and shell routing are settled.
2. Do not let Phaser own business logic. It should publish interactions, not become the app.
3. Do not wire real execution directly into UI clicks. All actions go through an approval and audit path.

## Decision Log

These are the foundation decisions baked into the docs:

- We will use a single Next.js app for both marketing and product surfaces.
- The dashboard will use a three-pane layout from day one.
- The world will be data-driven so we can iterate scenes without engine rewrites.
- The right panel is a first-class surface, not an afterthought.
- Real auth and permissioning are part of MVP, not polish.
