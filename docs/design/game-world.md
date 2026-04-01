# Game World Direction

## Experience Goal

We want a world that feels like a premium technical product with game energy, not a full game trying to impersonate a product.

## Visual Inspiration

Use the provided reference as inspiration for:

- strong atmospheric backdrop
- bold UI overlays
- cyan and navy system accents
- clear action prompts
- landscape-first presentation

We should not clone the reference literally. The world should feel like Actify AI's own command district.

## World Format

Recommended approach:

- 2D or 2.5D top-down Phaser scene
- stylized environment layers
- rich UI overlays
- light ambient animation

This gives us speed without losing the "world" feel.

## World Zones

### Spawn Deck

The user's entry point.

Purpose:

- orient the user
- display a short onboarding prompt
- point toward missions and shops

### Verified Market Row

Two or three shop fronts with distinct identities.

Purpose:

- show the browsing space
- represent trusted vendors
- provide clickable entry points for product comparisons

### Compare Terminal

A control station that summarizes options.

Purpose:

- trigger "find best item" missions
- visualize the agent's evaluation step

### Approval Vault

A secure-looking chamber or gate.

Purpose:

- represent delegated authorization
- host approval and step-up interactions

### Activity Beacon

A live signal tower or screen wall.

Purpose:

- reflect the activity log
- show completed and pending actions

## Entity Types

Every interactive world object should conform to a stable type:

- `shop`
- `product_hotspot`
- `mission`
- `approval_point`
- `activity_feed`
- `system_zone`

## Interaction Model

1. User clicks or taps a hotspot in the world
2. Phaser emits an interaction event
3. React app receives the event
4. Right panel renders the correct detail state
5. Optional backend query enriches the panel

The world never directly mutates business data. It is a view layer that publishes intent.

## Camera And Movement

MVP approach:

- no free-roam avatar required
- click-to-focus camera transitions
- subtle hover or pulse effect on interactive entities

Polish approach:

- small avatar or drone cursor
- agent path animation during missions

## Prompting And Overlay Style

- Use compact system prompts above hotspots
- Keep labels readable and high contrast
- Avoid heavy text inside the canvas when the right panel can do the work

## Scene Configuration

The world should be defined by data so we can add or move locations without code rewrites.

Suggested scene config shape:

```ts
type WorldEntity = {
  id: string;
  type: "shop" | "mission" | "approval_point" | "activity_feed" | "system_zone";
  label: string;
  x: number;
  y: number;
  spriteKey: string;
  panelKey: string;
  metadata?: Record<string, string | number | boolean>;
};
```

## World MVP Checklist

- background layer
- three shop hotspots
- one mission terminal
- one approval zone
- one activity zone
- selection highlight
- right-panel syncing

## Definition Of Done

- The scene feels alive even before full agent logic ships
- World clicks map cleanly to UI detail states
- The user can explain the product just by exploring the scene
