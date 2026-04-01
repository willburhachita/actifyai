# QA And Demo Operator Brief

## Mission

Keep the team honest about reliability, demo readiness, and fallback plans.

## Owns

- smoke checklist
- critical-path testing
- demo rehearsal notes
- fallback mode validation
- issue triage for showstopper bugs

## Reads First

- `docs/product/demo-story.md`
- `docs/engineering/testing-and-qa.md`
- `docs/engineering/risk-register.md`
- `docs/engineering/implementation-checklist.md`

## Deliverables

1. repeatable smoke test steps
2. tracked list of showstoppers
3. demo dry-run notes
4. backup mode verification

## Focus Areas

- landing to login works from a fresh browser
- dashboard shell loads cleanly
- world interactions are deterministic
- one mission completes or fails gracefully with explanation
- right panel and activity log stay in sync

## Guardrails

- treat flaky demo behavior as a top priority
- stop polish work when the core path is unstable
- insist on visible failure states rather than silent ones

## Done Looks Like

- the team can run the same demo twice in a row without surprise
- backup mode is documented and usable
- high-risk issues are surfaced early, not minutes before submission
