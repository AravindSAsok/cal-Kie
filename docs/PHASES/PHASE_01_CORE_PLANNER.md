# Phase 1 — Core Planner

## Scope
Branded planner UI, user workout preferences and AI-generated seven-day schedule.

## Implementation evidence
- `src/pages/index.astro` contains planner inputs for session duration, exercise count, training days, goal, experience, equipment and optional focus.
- `src/pages/api/workout-plan.ts` contains the server-side AI generation endpoint and structured response validation.
- Package manifest identifies Astro 5 + TypeScript.

## Status
**Implemented in source; runtime acceptance tests pending.**

## Acceptance checks
- [ ] AI provider configured and request succeeds.
- [ ] Exactly seven days returned in Monday-to-Sunday order.
- [ ] Requested number of active training days is respected.
- [ ] Each active day has requested exercise count.
- [ ] Recovery days and muscle-group balance are sensible.
- [ ] Duration, goal, level, equipment and focus are respected.
- [ ] Missing/invalid provider response produces a useful safe error.
- [ ] Typecheck and build pass.

## Evidence log
2026-11-19: source files inspected; no runtime tests executed in this pass.
