# Repository Layout Plan

## Goal

Keep the repo easy to navigate while separating marketing, shell, game, and orchestration concerns.

## Proposed Structure

```txt
app/
  (marketing)/
    page.tsx
  (app)/
    app/
      layout.tsx
      page.tsx
      world/
        page.tsx
      activity/
        page.tsx
      settings/
        page.tsx
components/
  marketing/
  shell/
  panels/
  missions/
  activity/
  auth/
game/
  core/
  config/
  scenes/
  systems/
  assets/
lib/
  auth/
  stores/
  adapters/
  policies/
  types/
convex/
docs/
agents/
public/
```

## Directory Responsibilities

### `app/`

Route-level composition only.

### `components/`

Reusable React UI grouped by feature.

### `game/`

All Phaser-specific code, scene config, systems, and assets.

### `lib/`

Shared logic, adapters, types, stores, and policy helpers.

### `convex/`

Schema, queries, mutations, actions, and seed helpers.

### `docs/`

Product, design, engineering, and delivery plans.

### `agents/`

Focused briefs for AI or human contributors.

## Naming Rules

- Use feature names over generic names
- Use stable nouns for world entities
- Keep adapters clearly labeled as adapters
- Keep server-facing types close to backend logic and shared UI view models close to the frontend

## Dead-End Avoidance

Do not place:

- Phaser code inside generic UI component folders
- auth provider code directly in visual components
- business logic inside route files
