# Phase 1 — Core Planner

## Scope
Branded planner UI, workout preferences and AI-generated seven-day schedule.

## Implementation evidence
- src/pages/index.astro contains planner inputs for session duration, exercise count, training days, goal, experience, equipment and optional focus.
- src/pages/api/workout-plan.ts contains server-side OpenRouter, Groq and Gemini provider support plus structured response validation.
- Production OpenRouter request returned a seven-day plan for a 30-minute beginner/bodyweight request with 3 active training days and 2 exercises per active day.
- Local request without a configured provider key returns HTTP 503 with a useful setup message.
- Client Monday-key timezone bug and server Monday/date fallback were fixed in this batch.

## Status
**Core generation integration tested; provider fallback and full constraints remain partially verified.**

## Acceptance checks
- [x] A configured production AI provider returns a plan.
- [x] Exactly seven days returned.
- [x] Requested number of active training days respected in the observed request.
- [x] Requested exercise count respected in the observed request.
- [x] Duration target respected in the observed request (30 minutes per session).
- [x] Missing provider key produces a useful safe error.
- [x] Typecheck and production build pass.
- [ ] Verify all provider fallback paths (Groq/Gemini).
- [ ] Verify malformed upstream responses and every preference combination.

## Evidence log
2026-11-19: production OpenRouter request returned HTTP 200 with seven days, three active days and two exercises per active day. A mocked local provider transport verified the API defaults to Monday, returns seven consecutive dates, preserves the requested training/exercise counts and rejects an invalid calendar date with HTTP 400. Local no-key request returned HTTP 503. npm run check reported 0 errors/0 warnings/1 existing hint; npm run build succeeded.
