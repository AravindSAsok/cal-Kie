# Phase 2 — Workout Editing and Regeneration

## Scope
Edit exercises and regenerate an individual day or the full week without unexpectedly losing user changes.

## Implementation evidence
- src/scripts/workouts.ts handles inline edits, adding/removing exercises, rest-day toggling, individual-day regeneration and full-week regeneration.
- Browser smoke test ran against the local app using a seven-day fixture.

## Status
**Browser smoke passed for editing and safe failure behavior. Successful real-provider UI regeneration remains untested.**

## Acceptance checks
- [x] Edit exercise name.
- [x] Edit sets, reps, rest periods and duration.
- [x] Add and remove an exercise.
- [x] Convert a day to recovery and back.
- [x] Mocked successful full-week generation renders seven days and sends the correct local Monday.
- [x] Failed individual-day regeneration preserves all seven days.
- [x] Failed full-week regeneration preserves the previous plan.
- [x] Mobile layout has no horizontal overflow.
- [ ] Verify successful day/week regeneration through the UI with a real provider.
- [ ] Perform full keyboard-only accessibility review.

## Evidence log
2026-11-19: Playwright smoke passed editing, add/remove, rest-day toggling, mocked week generation and failed day/week regeneration preservation. No browser page exceptions.
