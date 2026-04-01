# Product Requirements Document

## Product Name

Actify AI World

## Objective

Build a secure, game-like commerce dashboard where AI agents perform user-authorized actions inside a navigable world.

## Goals

1. Deliver a polished landing page that clearly explains delegated AI commerce.
2. Implement real login and protected dashboard access with Auth0.
3. Ship a three-pane dashboard with a central playable world.
4. Display context-aware details on the right based on user selection or live agent state.
5. Demonstrate at least one end-to-end agent action with approval and logging.

## Non-Goals

1. Full ecommerce checkout complexity
2. Multiplayer social systems
3. Detailed 3D environments
4. Real blockchain settlement as a hard dependency

## Primary Scenarios

### Scenario A: First-Time Visitor

- User lands on homepage
- User understands the core value in under 20 seconds
- User clicks sign in

### Scenario B: Authenticated User

- User enters dashboard
- User sees left navigation, center world, and right detail panel
- User configures budget and vendor preferences

### Scenario C: Guided Agent Mission

- User clicks a mission
- Agent evaluates available shops and products
- Agent either executes within permissions or requests step-up approval
- Activity and rationale are displayed

## Functional Requirements

## Phase 1: Landing Page

- Public route at `/`
- Hero section with clear value proposition
- Visual preview of the three-pane dashboard
- Security and trust messaging
- Strong primary CTA to sign in

## Phase 2: Auth

- Auth0 login and logout
- Protected route for `/app`
- User session available to dashboard shell
- Graceful loading and unauthenticated redirects

## Phase 3: Dashboard Shell

- Left rail for navigation and agent controls
- Center viewport for world canvas
- Right panel for contextual details
- Reusable app shell that survives route changes inside the app area

## Phase 4: World Interaction

- Render a navigable game-like map in the center pane
- Clickable entities for shops, vault points, missions, and activity markers
- Selecting any entity updates the right panel
- Optional camera pan or focus transitions for polish

## Phase 5: Agent Flow

- User can start a mission from nav or right panel
- Backend creates an agent task
- Agent compares eligible options
- Approval step appears for high-risk action
- Action result is logged and reflected in UI

## Content Requirements

- Landing page copy must emphasize trust, delegated action, and visibility
- Dashboard copy must avoid generic admin wording
- Agent logs must be human-readable

## Experience Requirements

- Premium, technical visual style
- The world should feel alive, not static
- The right panel must always have a meaningful state
- Portrait mobile should gracefully fall back rather than break

## Success Metrics For MVP

- User can complete login and reach dashboard reliably
- User can click at least three world objects and get distinct right-panel states
- User can complete one agent mission end to end
- All mission steps are visible in an activity log

## Acceptance Criteria

The MVP is ready when:

1. The public landing page exists and matches the visual direction.
2. `/app` is protected and session-aware.
3. The three-pane layout works on desktop and landscape tablet.
4. The center pane renders a world with selectable hotspots.
5. The right pane updates correctly for each hotspot.
6. One end-to-end agent flow can be demonstrated without manual patching.
