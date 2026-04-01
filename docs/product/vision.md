# Product Vision

## One-Line Product Thesis

Actify AI turns delegated commerce into a visible, game-like experience where users can trust an AI agent to act on their behalf inside clear permission boundaries.

## The Problem

Most agent demos feel abstract:

- The user types a command
- The AI does something off-screen
- The user gets a result but not a clear sense of control

For this hackathon, that is not enough. We need to show secure delegated action in a way that feels concrete, inspectable, and memorable.

## The Opportunity

A world-based interface gives us three advantages:

1. We make the agent's actions visible.
2. We make permissions legible and intuitive.
3. We stand out from standard dashboard demos.

## Product Pillars

### 1. Authorized Action

The user never loses agency. The agent acts only within the user's defined rules.

### 2. World As Interface

The world is not decoration. It is the spatial representation of shops, offers, approvals, and outcomes.

### 3. Decision Transparency

Every action needs a reason, a status, and an audit trail.

### 4. Demo Reliability

The experience must still land even if a third-party integration is partially mocked.

## Primary User

The primary user is a hackathon judge or demo viewer who wants to understand, within minutes:

- what the product does
- why an agent is useful
- why the user can trust it

The secondary user is a power user who wants to set budgets, approved vendors, and action limits.

## Core Product Loop

1. User lands on a striking homepage.
2. User signs in with Auth0.
3. User enters the dashboard.
4. User sees a world in the center pane.
5. User selects a mission or a shop.
6. The right pane explains what is selected and what the agent can do.
7. The agent evaluates options and requests approval when needed.
8. The action executes and appears in the activity log.

## What Makes This Different

- It looks and feels like a world, not a spreadsheet.
- It treats auth and delegated permissioning as a product feature, not a hidden backend detail.
- It makes the agent observable in real time.

## Non-Goals For MVP

- Massive open world gameplay
- Multiplayer
- Real-time physics
- Complex negotiation systems
- Deep Web3 dependency

## MVP Promise

By demo time, a user should be able to:

- sign in
- enter the world
- pick a mission like "find the best verified deal under my budget"
- watch the agent reason
- approve or reject a sensitive action
- see the action and rationale logged in the UI
