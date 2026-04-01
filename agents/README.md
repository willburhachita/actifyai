# Agent Briefs

These files define focused contributor roles for building Actify AI without overlap or dead ends.

Each brief is written so a teammate or AI assistant can pick up one area, know its boundaries, and ship useful work without derailing the main architecture.

## Available Roles

- `agents/product-strategist.md`
- `agents/frontend-landing-auth.md`
- `agents/dashboard-game-builder.md`
- `agents/backend-auth0-convex.md`
- `agents/qa-demo-operator.md`

## How To Use These Briefs

1. Start with the product strategist when scope or messaging drifts.
2. Start implementation with the frontend landing and auth brief.
3. Move to the dashboard and world brief once auth and shell routes are stable.
4. Run backend orchestration in parallel once the shell contracts are agreed.
5. Keep QA and demo work active throughout, not only at the end.

## Shared Rules For Every Role

1. Protect the landing-to-login-to-dashboard path above all else.
2. Avoid adding architecture that is larger than the hackathon requires.
3. Prefer a stable mock path over a broken live integration.
4. Leave logs, notes, and contracts clearer than you found them.
