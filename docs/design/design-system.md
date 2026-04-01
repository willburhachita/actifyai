# Design System

## Brand Personality

Actify AI should feel:

- technical
- authoritative
- fast
- cinematic
- trustworthy

## Typography

Recommended fonts:

- Display: `Oswald`
- UI and body: `Space Grotesk`

Usage:

- large headings use condensed display typography
- panels and controls use clean geometric sans typography

## Color Tokens

```css
:root {
  --bg-deep: #050b1a;
  --bg-panel: #0b1730;
  --bg-panel-strong: #081126;
  --line-panel: rgba(5, 231, 255, 0.28);
  --line-strong: rgba(5, 231, 255, 0.64);
  --accent-cyan: #05e7ff;
  --accent-lime: #8dffb3;
  --accent-amber: #ffbf5f;
  --text-primary: #f5fbff;
  --text-secondary: #a7bfd9;
  --text-muted: #6e86a7;
  --danger: #ff647c;
}
```

## Surface Rules

- Panels use sharp corners
- Buttons use medium rounded corners
- Borders glow lightly instead of using heavy shadows
- Backgrounds should layer gradients and subtle grid textures

## Component Direction

### Navigation Items

- Tall enough to feel touchable
- Active state uses cyan border and fill tint
- Icon plus label layout

### Context Cards

- Strong title
- muted metadata row
- one clear primary action
- optional secondary action

### Buttons

- Primary: cyan fill, deep text
- Secondary: outline with cyan border
- Danger: warm red accent only when needed

### Status Chips

- `ready`
- `watching`
- `approval-needed`
- `executing`
- `completed`
- `blocked`

## Motion Language

- subtle vertical panel reveals
- light glow pulses for active zones
- scanning or sweep effects for technical surfaces
- do not overuse particle effects

## Iconography

- simple line icons
- white by default
- cyan only for active emphasis

## Accessibility Rules

- maintain readable contrast on every panel
- support keyboard navigation in all non-canvas controls
- never rely on color alone for status
- provide alternative text and textual status for world-driven actions

## Copy Tone

- short
- declarative
- operational
- not playful for the sake of playfulness

Good:

- `Mission ready`
- `Approval required`
- `Verified vendor`

Bad:

- `Magic time`
- `Agent is vibing`
- `Epic buy mode`
