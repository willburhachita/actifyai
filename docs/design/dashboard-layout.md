# Dashboard Layout

## Core Frame

The authenticated app is a three-pane command center.

- Left pane: navigation and controls
- Center pane: world viewport
- Right pane: contextual intelligence panel

## Desktop Grid

Recommended layout:

- Left: `280px`
- Center: `minmax(720px, 1fr)`
- Right: `360px`

Recommended CSS strategy:

`grid-template-columns: 280px minmax(720px, 1fr) 360px`

## Pane Responsibilities

### Left Pane

- Product mark and environment switcher
- Primary nav
- Active mission shortcuts
- Budget and policy summary
- User profile and logout

Suggested nav items:

- `World`
- `Missions`
- `Approvals`
- `Activity`
- `Settings`

### Center Pane

- World canvas
- Floating scene controls
- Optional breadcrumb or current zone label
- Connection and activity status overlays

### Right Pane

The right pane changes based on state:

- default overview
- selected shop
- selected product
- active mission
- pending approval
- completed action

## Default Right Panel State

When nothing is selected, show:

- user greeting
- agent readiness
- today's suggested mission
- recent activity summary

## Selected Entity State

When a world entity is selected, the panel should show:

- entity name
- entity type
- summary and trust metadata
- available actions
- linked activity

## Pending Approval State

When step-up confirmation is needed, the right panel becomes a focused approval card:

- action summary
- price or risk indicator
- reason for request
- approve and reject controls

## Motion Rules

- Panel transitions should slide and fade quickly
- Selection changes should feel reactive, not jarring
- The center world should remain stable while the side panels update

## Landscape and Mobile Behavior

### Tablet Landscape

- Keep all three panes if space permits
- Right pane can shrink to `320px`

### Narrow Desktop Or Small Tablet

- Right pane becomes a slide-over drawer
- Left pane remains visible

### Portrait Mobile

- Show a rotate-to-landscape prompt for the world route
- Allow a non-world fallback view for settings and activity

## States We Must Design Explicitly

- loading
- unauthenticated redirect
- empty world selection
- no mission available
- backend unavailable
- approval timeout

## Definition Of Done

- The app shell feels complete before Phaser is embedded
- Every pane has a default state and at least one active state
- No pane is decorative
