# Cal-Kie — Next Agent Handoff

_Last updated: 2026-11-19._

## Read first
1. `AGENTS.md`
2. `docs/PROJECT_STATUS.md`
3. `docs/ROADMAP.md`
4. `docs/ARCHITECTURE.md`
5. `docs/DECISIONS.md`
6. Existing `agent.md`

## Current state
- Repository: `AravindSAsok/cal-Kie`
- Branch: `main`
- Latest application/source commit inspected before this documentation-only baseline: `a284a17932c3f7753e2070b09568188a26abbdc2`.
- Project is an MVP prototype. Core implementation is present; end-to-end release verification remains incomplete.
- This handoff documentation baseline is being committed separately. Read the current branch head to obtain the latest docs commit before continuing.

## What the previous agent did
- Inspected README, existing agent guide, package manifest, planner page, AI API, exercise API, persistence store and migration SQL.
- Added repository-level agent instructions and durable project memory.
- Did not change application source, Supabase, Vercel or environment variables.
- Did not run tests/build or live integrations.

## Important caution
README currently instructs applying `supabase/migrations/202611180001_calkie_workout_plans.sql`. A prior conversation reported this migration was applied to the shared TrackCake Supabase project, but this agent did not query migration history. **Do not execute the SQL until the actual shared project's migration history and schema are checked.** Never create a second Supabase project.

## Exact next task
Perform the MVP verification pass in this order:
1. Inspect the latest branch head and working tree.
2. Run `npm ci` (or the repository's documented install command) and then `npm run check`.
3. Run `npm run build`.
4. Test planner generation with a configured provider; verify seven days, active training-day count, exercise count, recovery days and duration.
5. Test one-day/full-week regeneration and all inline editing controls.
6. Test missing AI-key behavior and provider errors.
7. Test ExerciseDB search, remote GIF display and no media persistence.
8. Test local save/load.
9. Verify the shared Supabase migration history before any SQL; test cloud save/load and RLS isolation with separate test users.
10. Test sign-up, sign-in, sign-out and password recovery on the deployed origin; inspect mobile layout and keyboard accessibility.
11. Update status, roadmap, changelog, relevant phase docs and this handoff with exact evidence and the resulting commit SHA.

## Completion rule
Do not mark MVP complete or production-ready until required checks have actually passed and the evidence is recorded. If blocked by missing credentials/access, record the blocker and continue with tests that do not require those credentials.
