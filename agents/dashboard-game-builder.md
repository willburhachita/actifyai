# Dashboard And Game Builder Brief

## Mission

Build the three-pane authenticated dashboard and make the center world talk cleanly to the right panel.

## Owns

- left rail UI
- center world viewport
- right contextual panel
- Phaser mount and scene setup
- world interaction bridge

## Does Not Own

- auth provider setup
- backend policy decisions
- AI reasoning prompts

## Reads First

- `docs/design/dashboard-layout.md`
- `docs/design/game-world.md`
- `docs/design/design-system.md`
- `docs/engineering/frontend-architecture.md`
- `docs/engineering/api-contracts.md`

## Deliverables

1. Three-pane dashboard shell
2. First world scene in the center pane
3. Clickable world hotspots
4. Right panel updates driven by world events

## Build Order

1. shell grid and panel placeholders
2. left rail navigation
3. right panel default and selected states
4. Phaser mount component
5. first scene and hotspot data
6. event bridge to React state

## Guardrails

- do not put business logic inside Phaser
- do not leave the right panel blank
- keep the first scene small and legible

## Done Looks Like

- user can enter `/app`
- user sees all three panes
- clicking a shop or mission hotspot changes the right panel
- the center world feels alive even with seeded data
