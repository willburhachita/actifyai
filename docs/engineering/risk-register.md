# Risk Register

| Risk | Why It Hurts | Mitigation | Owner Area |
| --- | --- | --- | --- |
| Auth0 integration takes longer than expected | Blocks dashboard access and core hackathon story | Build login first, isolate provider details behind an adapter, keep mock execution separate | Auth and platform |
| Token Vault details change or are unclear | Could force late rewrites if embedded directly in UI | Use a backend delegated-execution interface and validate provider specifics just before implementation | Backend auth |
| Phaser and React fight over state | Causes brittle UI and hard-to-debug interactions | Keep Phaser as renderer and event emitter only | Frontend |
| World scope balloons into a real game | Burns time with low demo return | Limit scene to one district, three shops, and one mission loop | Product and design |
| Right panel becomes inconsistent | Weakens the core user understanding | Use typed panel payloads and default states for every mode | Frontend |
| External execution fails during demo | Breaks confidence in the product | Keep a mock connector path with identical UI states and logs | Backend |
| Asset creation takes too long | Slows world delivery | Use stylized simple geometry and UI-first atmosphere | Design |
| Mobile layout becomes distracting | Consumes time away from desktop demo | Optimize for desktop and landscape tablet first, use rotate prompt in portrait | Design and frontend |
| AI output is too free-form | Makes execution unsafe and hard to parse | Require structured output with schema validation | Backend AI |
| Activity logs are incomplete | Hurts trust story with judges | Make events append-only and log every lifecycle transition | Backend |

## Top Three Risks To Watch Daily

1. Auth not working end to end
2. World not connected to the right panel cleanly
3. Mission flow not producing stable logs

## Escalation Rule

If any top-three risk is unresolved after a work session, stop adding polish and fix the broken path first.
