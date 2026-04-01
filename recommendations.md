# Actify AI - Continuous Improvement & Validation Loop

This document is the living quality loop for the in-dashboard game.

We use it to:

- check what the game currently does well
- identify what still feels fake, stiff, or incomplete
- prioritize the next polish pass
- keep iterating until the world feels real, responsive, and demo-ready

This is not a one-time checklist. It is the operating loop for the game layer.

---

# Core Loop

Repeat this loop until the game feels real and stable:

1. Run the app with `npm run dev`
2. Open `http://localhost:3000/app` or `http://localhost:3000/app/world`
3. Play the game for 2-5 minutes
4. Try movement, collisions, interaction, missions, and right-panel updates
5. Log friction, bugs, fake-feeling behavior, or visual gaps below
6. Fix the highest-value issues first
7. Repeat

Rule:

- Polish and responsiveness come before adding extra features

---

# Current Baseline

Checked against the current implementation in this repo.

## Working Systems

- Phaser world mounted inside the existing dashboard center pane
- Tile-based terrain using actual local assets
- Player sprite rendered from local assets
- Movement with `WASD` and arrow keys
- Basic collision against shop stalls
- Nearby interaction prompt with `E`
- Shop and zone interaction events update the right panel
- Mission launcher already connected to the agent flow
- Demo fallback works when Shopify data is unavailable

## Current Asset Set

Public assets currently in use:

- `public/assets/characters/player.jpg`
- `public/assets/shops/shop1.jpg`
- `public/assets/shops/shop2.jpg`
- `public/assets/tiles/grass.jpg`
- `public/assets/tiles/road.jpg`

## What Still Feels Prototype-Level

- Player has no directional facing or walk animation
- Camera is static
- Interaction feedback is functional but still light
- World is readable but not yet rich or alive
- Collision works but is still simple/manual
- No sound layer
- No decorative props or environmental animation
- Agent activity is visible in UI, but not yet dramatized inside the world itself

---

# Improvement Pass Board

Use these statuses:

- `[ ]` not started
- `[-]` in progress
- `[x]` done
- `[!]` blocked or needs assets

---

# 1. Player Feel

Priority: Critical

## Current State

- `[x]` movement exists
- `[x]` player sprite exists
- `[-]` directional facing
- `[x]` idle vs moving state
- `[x]` movement easing
- `[ ]` footstep cadence or movement feedback

## Problems To Watch

- movement feels robotic
- no strong feedback when direction changes
- player appears to slide instead of walk

## Recommended Next Actions

- add last-facing-direction state
- swap sprite or frame based on movement direction
- add a tiny bob or scale pulse while moving
- add acceleration/deceleration instead of purely immediate velocity

## Definition Of Done

- moving the character feels intentional, not like dragging an icon

---

# 2. Collision System

Priority: Critical

## Current State

- `[x]` stall collision exists
- `[x]` player is clamped to district bounds
- `[ ]` smoother collision resolution
- `[ ]` tuned body size per object
- `[ ]` environmental obstacles beyond stalls

## Problems To Watch

- clipping at corners
- getting stuck on stall edges
- collisions feeling too rectangular

## Recommended Next Actions

- shrink player collision body slightly more
- shrink shop blocking bodies to better match art footprint
- test diagonal movement into corners repeatedly
- consider Phaser physics bodies if manual resolution keeps feeling stiff

## Definition Of Done

- collisions feel fair and predictable, not sticky

---

# 3. Camera System

Priority: High

## Current State

- `[ ]` camera follow
- `[ ]` camera smoothing
- `[ ]` deadzone

## Problems To Watch

- current view feels static
- world does not yet feel like a traversable place

## Recommended Next Actions

- enlarge the world slightly
- enable camera follow on the player
- add light lerp/smoothing
- keep UI readable and avoid motion sickness

## Definition Of Done

- the camera helps movement feel alive without making the dashboard chaotic

---

# 4. Interaction Feedback

Priority: Very High

## Current State

- `[x]` nearby prompt exists
- `[x]` click interaction exists
- `[x]` selected hotspot gets highlighted
- `[x]` stronger nearby glow
- `[x]` floating interaction icon above entities
- `[ ]` better differentiation between shop, mission, vault, and beacon

## Problems To Watch

- users may not instantly know what can be interacted with
- different hotspot types can still feel visually similar

## Recommended Next Actions

- add hover pulse to nearby hotspot
- add `E` badge above interactable targets when close
- add stronger type-specific visuals:
  - shop = stall glow
  - mission = cyan terminal pulse
  - approval = amber vault shimmer
  - activity = green signal flicker

## Definition Of Done

- the player always knows where to go and what to do next

---

# 5. Agent Feedback System

Priority: Very High

## Current State

- `[x]` activity trail exists in UI
- `[x]` mission states exist
- `[x]` in-world feedback while agent is thinking
- `[-]` staged step-by-step mission presentation
- `[x]` visible mission effect in the center pane

## Problems To Watch

- the agent may still feel too invisible unless the user watches the side panel closely

## Recommended Next Actions

- show short world-state overlays:
  - `Scanning vendors...`
  - `Comparing products...`
  - `Approval required`
  - `Execution completed`
- animate a beacon pulse or mission terminal flash during active missions
- add a temporary path line or signal beam to the selected shop

## Definition Of Done

- the player can understand what the agent is doing without only reading logs

---

# 6. World Depth

Priority: High

## Current State

- `[x]` navigable district exists
- `[x]` shops and special zones exist
- `[ ]` props
- `[ ]` layered scenery
- `[ ]` environmental storytelling
- `[ ]` ambient motion

## Problems To Watch

- the district feels sparse
- terrain is readable but not yet memorable

## Recommended Next Actions

- add a small set of low-cost props:
  - crates
  - signs
  - barrels
  - trees or shrubs
  - light posts
- add subtle animated glows or scan lines
- create small sub-areas so the player feels spatial progression

## Definition Of Done

- the world feels like a place, not just a functional interaction diagram

---

# 7. Sound Design

Priority: High impact, low effort

## Current State

- `[ ]` movement audio
- `[ ]` interaction audio
- `[ ]` mission success/failure audio
- `[ ]` UI click sounds

## Recommended Next Actions

- add soft footstep loop or triggered step sounds
- add subtle interaction chime
- add approval warning sound
- add success confirmation tone

## Definition Of Done

- sound adds feedback without becoming noisy or gimmicky

---

# 8. Boundaries And Map Limits

Priority: Medium

## Current State

- `[x]` player clamp exists
- `[ ]` visible world edges
- `[ ]` environmental barriers

## Problems To Watch

- invisible clamping can feel strange

## Recommended Next Actions

- add fence, wall, or terrain edges
- visually explain the district perimeter
- make boundaries feel intentional, not arbitrary

## Definition Of Done

- the player understands where the playable area begins and ends

---

# 9. Performance And Stability

Priority: Medium

## Current State

- `[x]` TypeScript passes
- `[ ]` repeated gameplay QA loops logged
- `[ ]` performance check under longer play sessions
- `[ ]` console-clean verification per pass

## Problems To Watch

- dropped frames after repeated interactions
- duplicated listeners
- excessive rerenders between Phaser and React

## Recommended Next Actions

- watch console every loop
- test repeated mission launches
- test repeated route switching between `world`, `activity`, and `settings`
- verify Phaser teardown/remount is clean

## Definition Of Done

- no noticeable lag and no accumulating runtime issues

---

# 10. Testing Checklist

Run this every loop:

- [ ] movement feels smooth
- [ ] no clipping through shops
- [ ] nearby prompt appears at the right time
- [ ] pressing `E` triggers the correct interaction
- [ ] clicking hotspots still works
- [ ] right panel updates correctly
- [ ] mission launch works
- [ ] approval state works
- [ ] completed mission state is readable
- [ ] no console errors
- [ ] no broken assets

---

# Advanced Pass

Do not start this until core feel is solid.

## Candidate Upgrades

- [ ] NPC walkers
- [ ] day/night or color-shift overlay
- [ ] mini-map
- [ ] player spawn animation
- [ ] in-world agent drone or courier effect
- [ ] inventory or cart preview

---

# Current Recommendation Order

Work these in order:

1. directional player feel
2. stronger nearby interaction feedback
3. world-space agent mission feedback
4. visible map boundaries
5. decorative props and depth
6. sound design
7. camera follow pass

---

# Working Notes

Use this section as the rolling log after each pass.

## Pass 1 - 2026-03-28

Completed:

- moved real local assets into `public/assets`
- replaced abstract hotspot-only center pane with a movement-based playable district
- added keyboard movement
- added shop collision
- added `E` interaction prompt and trigger

Observations:

- the game now reads as a real playable slice
- biggest remaining gap is player feel and richer interaction feedback

Next focus:

- directional facing
- hotspot proximity glow
- stronger in-world mission feedback

## Pass 2 - 2026-03-28

Completed:

- added eased movement instead of immediate hard-stop movement
- added idle and movement feedback with bob, scale pulse, and lean
- added left/right facing behavior with sprite flip
- added stronger proximity feedback with pulsing glows
- added floating `E` interaction badges above nearby hotspots
- added in-world mission banner feedback
- added mission beam feedback between the mission terminal and the selected shop

Observations:

- movement feels less stiff and more intentional
- interactable objects are much easier to identify while moving around
- the mission flow is now readable from the center pane, not only the side UI

Next focus:

- improve facing for up/down movement or add richer directional assets
- tune collision edges and diagonal corner behavior
- add environmental props and visible map boundaries

---

# Definition Of Done

The game is ready when:

- movement feels natural
- interactions are obvious
- the world feels alive
- the agent feels visible and understandable
- there are no major bugs during repeated play loops

---

# Final Rule

Do not chase more features until:

- movement feels good
- interaction is clear
- the world reads cleanly
- the current loop is stable

Believability first. Features second.
