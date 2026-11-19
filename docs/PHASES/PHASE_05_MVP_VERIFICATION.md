# Phase 5 — MVP Verification and Release Gate

## Scope
Prove the implemented MVP works across build, AI generation, editing, exercise lookup, persistence, auth and responsive UI before declaring it ready.

## Current status
**Not yet executed.** This phase is the next engineering task after the documentation baseline.

## Required checks
- [ ] Install dependencies using the lockfile-compatible command.
- [ ] Run `npm run check` and record exact output.
- [ ] Run `npm run build` and record exact output.
- [ ] Test AI generation with a configured provider and validate seven-day structure, training-day count, exercise count and duration.
- [ ] Test missing-key and upstream-provider error behavior.
- [ ] Test individual-day regeneration, full-week regeneration and inline editing.
- [ ] Test ExerciseDB search, remote GIF rendering, attribution and non-persistence.
- [ ] Test local save/load across refresh.
- [ ] Verify shared Supabase migration history before any SQL; test cloud save/load and RLS isolation.
- [ ] Test signup, login, logout and password recovery on the deployed origin.
- [ ] Inspect mobile layout, keyboard navigation and focus states.
- [ ] Update status, roadmap, changelog and handoff with observed results.

## Evidence log
2026-11-19: Not run in this documentation-only session. No build, browser, provider, database or deployment checks were executed.
