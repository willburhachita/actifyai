# Implementation Checklist

## Rule Of Execution

Finish each block before starting the next unless there is parallel work that does not create rework.

## Block 1: Foundation

- Initialize Next.js app with TypeScript
- Add Tailwind CSS
- Add base fonts and design tokens
- Set up route groups for marketing and app surfaces
- Add Convex baseline structure
- Add auth library and session scaffolding

Stop rule:

Do not start building the world until the app shell route strategy is stable.

## Block 2: Landing Page

- Build hero section
- Build product story sections
- Build dashboard preview section
- Wire CTA to login entry
- Add responsive behavior

Stop rule:

Do not overdesign subpages before `/` clearly explains the product.

## Block 3: Auth

- Implement Auth0 login and logout
- Add callback handling
- Protect `/app`
- Surface session info in the shell
- Add unauthenticated redirect behavior

Stop rule:

Do not build interactive dashboard features on an unprotected route.

## Block 4: Dashboard Shell

- Build left navigation rail
- Build center viewport container
- Build right context panel
- Add placeholder states for all panes
- Add shared app layout for `/app`

Stop rule:

Do not embed Phaser until the shell works with static placeholder content.

## Block 5: World MVP

- Mount Phaser in the center pane
- Render first scene
- Add three to five clickable entities
- Emit selection events to React
- Update right panel from entity selections

Stop rule:

Do not start AI mission work until world-to-panel interaction is reliable.

## Block 6: Agent Mission

- Create mission actions in backend
- Seed shops and products
- Implement decision orchestration
- Add approval state and right-panel approval UI
- Add activity log rendering

Stop rule:

Do not polish animation before one mission completes end to end.

## Block 7: Polish And Demo Hardening

- Add motion and glow details
- Refine copy
- Add portrait rotate prompt
- Add skeleton and error states
- Rehearse demo path
- Prepare backup mocked execution mode

## Definition Of Ready For Coding

We are ready to code when:

- the team agrees on the stack
- the dashboard shell is specified
- the first mission flow is defined
- the auth boundary is agreed
- the world scope is capped
