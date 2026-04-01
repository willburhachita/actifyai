# Product Roadmap

## Guiding Rule

We build the product in vertical slices, not disconnected layers.

That means every phase should leave us with something demoable, even if simplified.

## Phase 0: Foundation

### Goal

Set the stack, repository shape, and environment strategy.

### Output

- Next.js app initialized
- Tailwind configured
- Auth0 dependency selected
- Convex project structure defined
- Phaser integration spike confirmed

### Exit Criteria

- We know the exact app shell and route strategy.
- We know how Phaser mounts inside React without SSR issues.

## Phase 1: Landing Page

### Goal

Ship a homepage that sells the concept before the product is complete.

### Output

- Strong hero section
- Product story
- Security narrative
- Dashboard preview art or mock
- Sign-in CTA

### Exit Criteria

- A first-time visitor understands the idea in one screen.

## Phase 2: Authentication

### Goal

Create a real identity boundary between public and app surfaces.

### Output

- Auth0 login
- Callback handling
- Protected `/app`
- Session-aware top-level layout

### Exit Criteria

- Logged-out users cannot access dashboard routes.
- Logged-in users can enter `/app` without broken states.

## Phase 3: Dashboard Shell

### Goal

Establish the permanent product layout.

### Output

- Left navigation rail
- Center viewport container
- Right contextual panel
- Skeleton loading states

### Exit Criteria

- The shell works before the game is embedded.

## Phase 4: World MVP

### Goal

Make the center pane interactive.

### Output

- One world scene
- Three to five clickable entities
- Selection bridge between Phaser and React
- Right panel state updates

### Exit Criteria

- A user can explore and understand what each point in the world represents.

## Phase 5: Agent Mission

### Goal

Show real delegated action.

### Output

- Mission trigger
- Agent task lifecycle
- Approval UI
- Action result
- Activity timeline

### Exit Criteria

- Demo runs end to end with no manual database edits.

## Phase 6: Polish

### Goal

Make the experience feel intentional and judge-ready.

### Output

- Motion and transitions
- Microcopy refinement
- Demo script
- Fallbacks and error states

### Exit Criteria

- Team can demo from a cold start with confidence.

## Suggested 10-Day Split

### Days 1-2

Foundation, landing page, auth wiring

### Days 3-4

Dashboard shell and design system

### Days 5-6

World scene and interaction bridge

### Days 7-8

Agent workflow, Convex state, approvals

### Days 9-10

Polish, QA, demo rehearsal, submission assets
