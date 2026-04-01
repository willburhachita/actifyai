# Frontend Architecture

## App Goal

Use one coherent frontend architecture for marketing, auth, dashboard, and world interactions.

## Planned Route Tree

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
```

## Planned Source Structure

```txt
components/
  marketing/
  shell/
  panels/
  missions/
  activity/
  auth/
game/
  core/
  scenes/
  entities/
  config/
lib/
  auth/
  stores/
  adapters/
  utils/
convex/
public/
```

## Shell Composition

### `AppShell`

Owns the top-level grid layout and persistent UI structure.

### `LeftRail`

Owns navigation, policy summary, mission launchers, and account controls.

### `WorldViewport`

Owns the Phaser mount point, loading state, and event bridge wiring.

### `ContextPanel`

Owns detail rendering for the selected entity, mission state, approval state, and activity detail.

## State Strategy

Keep state split by responsibility:

- server-backed domain state from Convex
- local UI shell state for selection and panel mode
- ephemeral world state inside Phaser scene logic

Suggested local store slices:

- `selectedEntity`
- `activeMissionId`
- `panelMode`
- `connectionStatus`

## Phaser Integration Pattern

1. Dynamically import the world renderer on the client only
2. Mount Phaser inside a dedicated component
3. Emit typed events from Phaser to React
4. Let React decide how the rest of the app responds

Avoid:

- reading DOM state directly from Phaser
- letting Phaser fetch business data on its own
- letting React rerender the canvas unnecessarily

## Suggested Event Contract

```ts
type WorldInteractionEvent = {
  entityId: string;
  entityType: "shop" | "mission" | "approval_point" | "activity_feed" | "system_zone";
  action: "hover" | "select" | "activate";
};
```

## Rendering Plan

### Landing

Pure React and CSS.

### Dashboard Shell

React layout first, with placeholder center content.

### World

Phaser mounts only after the shell is stable.

### Right Panel

Driven by a typed panel registry keyed by entity or task state.

## Performance Notes

- keep the canvas isolated from frequent state churn
- preload only the assets needed for the current scene
- use static seeded data while building the first scene

## Dead-End Avoidance

1. Build the shell before the world.
2. Build the event bridge before backend orchestration.
3. Use a panel registry instead of branching everywhere.
4. Keep route protection outside visual components.

## Definition Of Done

- landing page and dashboard share one app foundation
- auth survives route changes
- world can publish selection events
- right panel updates predictably
