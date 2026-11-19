# Phase 4 — Persistence and Authentication

## Scope
Browser-local save/load, optional cloud persistence in the shared TrackCake Supabase project, and account flows.

## Implementation evidence
- `src/lib/workout-store.ts` uses local storage key `calkie.workout-plan.v1`.
- Store references `public.workout_plans`, anonymous sign-in and upsert by `user_id,week_start`.
- `supabase/migrations/202611180001_calkie_workout_plans.sql` defines the table, index, RLS policies and updated-at trigger.
- Repository history includes sign-up/login/password-recovery implementation commits.

## Status
**Code and migration SQL present; live database/auth verification required.**

## Critical caution
A prior project session reported the migration applied to the shared TrackCake Supabase project. This has not been rechecked in the current pass. Do not rerun SQL or create a new project until the shared project's migration history and schema are verified.

## Acceptance checks
- [ ] Local save/load works after refresh.
- [ ] Supabase guest save works if anonymous auth is enabled.
- [ ] Authenticated save/load works.
- [ ] RLS prevents user A from reading or changing user B's plans.
- [ ] Sign-up, login and logout work.
- [ ] Password reset email and recovery redirect work on deployed origin.
- [ ] Migration history confirms expected migration state.

## Evidence log
2026-11-19: persistence source and SQL inspected; no live Supabase query or auth test performed.
