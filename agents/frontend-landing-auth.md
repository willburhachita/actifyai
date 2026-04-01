# Frontend Landing And Auth Brief

## Mission

Build the public landing experience and real auth boundary that the rest of the product depends on.

## Owns

- landing page route
- marketing components
- auth entry and logout
- protected app routing
- authenticated shell bootstrap

## Does Not Own

- Phaser scene logic
- Convex business logic
- AI orchestration
- approval workflow internals

## Reads First

- `docs/design/landing-page.md`
- `docs/design/design-system.md`
- `docs/engineering/auth0-plan.md`
- `docs/engineering/frontend-architecture.md`
- `docs/engineering/implementation-checklist.md`

## Deliverables

1. Public landing page at `/`
2. Auth0 login and logout wiring
3. Protected `/app` route shell
4. Stable loading and unauthenticated states

## Build Order

1. app routing structure
2. design tokens and global styles
3. landing page sections
4. auth wiring
5. protected shell frame

## Guardrails

- do not start world implementation until the shell is protected and stable
- keep provider-specific auth details inside auth helpers
- do not hardcode fake session data in final flows

## Done Looks Like

- user can land, click CTA, sign in, and arrive at `/app`
- logout returns the user cleanly to public space
- shell can render even before the game exists
