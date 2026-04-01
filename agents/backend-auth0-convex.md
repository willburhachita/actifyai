# Backend, Auth0, And Convex Brief

## Mission

Own the durable state, policy checks, mission orchestration, and delegated execution layer behind the UI.

## Owns

- Convex schema
- queries, mutations, and actions
- agent task lifecycle
- policy evaluation
- execution adapter layer
- activity logging

## Does Not Own

- landing page visuals
- Phaser scene rendering
- route-level UI composition

## Reads First

- `docs/engineering/architecture.md`
- `docs/engineering/auth0-plan.md`
- `docs/engineering/backend-and-data.md`
- `docs/engineering/api-contracts.md`
- `docs/engineering/environment-and-secrets.md`

## Deliverables

1. user and policy data model
2. seeded shops, products, and world entity records
3. mission creation and lifecycle progression
4. approval records and status transitions
5. append-only activity events

## Build Order

1. schema and seed data
2. user profile and policy queries
3. mission task creation
4. decision orchestration
5. approval path
6. execution adapter

## Guardrails

- do not couple provider-specific auth details directly to UI contracts
- do not make approvals a boolean flag
- do not skip lifecycle logs

## Done Looks Like

- frontend can load real seeded data
- mission tasks progress through durable states
- approval and execution events appear in the activity stream
