# Testing And QA Strategy

## Goal

Protect the demo path first, then broaden coverage.

## Test Layers

### 1. Unit Tests

Cover:

- policy evaluation
- panel state mapping
- mission status helpers
- AI response parsing

### 2. Integration Tests

Cover:

- auth guard behavior
- dashboard shell loading with session
- mission creation and status updates
- approval submit flow

### 3. End-To-End Tests

Cover:

- landing to login redirect
- authenticated dashboard entry
- world entity selection
- right panel updates
- one mission end to end

## Critical User Journeys

### Journey A

- open `/`
- click CTA
- redirect to login

### Journey B

- return authenticated
- render dashboard shell
- confirm all three panes load

### Journey C

- click verified shop in world
- right panel shows shop details

### Journey D

- start mission
- task enters evaluating state
- approval is requested or execution completes
- activity updates in UI

## Manual QA Checklist

- landing page matches design direction
- login and logout work from a clean session
- world loads without layout shift
- right panel never shows blank content
- landscape prompt appears correctly on portrait mobile
- slow network does not collapse the shell

## Demo Smoke Suite

Before every live demo:

1. Verify env vars and auth config
2. Seed demo data
3. Login once in a fresh session
4. Complete one mission
5. Confirm activity log entries appear in order

## Observability

Track:

- auth errors
- world mount failures
- mission orchestration failures
- approval timeouts
- execution connector failures

## Definition Of Done

- one automated happy path exists
- one automated approval path exists
- manual smoke checklist is documented and repeatable
