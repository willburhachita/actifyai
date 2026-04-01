# Environment And Secrets Plan

## Principle

Secrets are configured once and consumed through typed helpers. No secret should be referenced ad hoc across the codebase.

## Expected Environment Variables

### Frontend And App Shell

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_CONVEX_URL`

### Auth

- `AUTH0_DOMAIN`
- `AUTH0_CLIENT_ID`
- `AUTH0_CLIENT_SECRET`
- `AUTH0_SECRET`
- `AUTH0_BASE_URL`

### AI And Orchestration

- `OPENAI_API_KEY`

### Backend And Execution

- `CONVEX_DEPLOYMENT`
- `AUTH0_TOKEN_VAULT_AUDIENCE`
- `AUTH0_TOKEN_VAULT_CLIENT_ID`
- `AUTH0_TOKEN_VAULT_CLIENT_SECRET`

## Local Development Rules

1. Keep a committed `.env.example`
2. Never hardcode fallback secrets
3. Validate env vars at startup
4. Expose only safe public variables to the client

## Demo Strategy

- Use a stable demo tenant and demo user accounts
- Seed the same shops and products before each demo
- Keep mock execution toggles server-side only

## Failure Strategy

If a required secret is missing:

- block the affected feature clearly
- show an operational message
- do not fail silently
