# Phase 2 — Workout Editing and Regeneration

## Scope
Edit exercises and regenerate an individual day or the full week without unexpectedly losing user changes.

## Implementation evidence
Existing `agent.md` describes day/week regeneration and editing sets, reps, rest, duration, adding/removing exercises and changing days to recovery. Git history includes a commit titled “Restore complete inline workout editing controls”.

## Status
**Reported implemented; browser acceptance tests pending.**

## Acceptance checks
- [ ] Edit sets, reps, rest and duration.
- [ ] Add/remove exercise.
- [ ] Convert a day to recovery and back where supported.
- [ ] Regenerate one day without changing other days.
- [ ] Regenerate week and confirm expected overwrite behavior.
- [ ] Loading, errors and disabled states work.
- [ ] Mobile interaction is usable.

## Evidence log
2026-11-19: source guide and commit history inspected; browser tests not run.
