# Phase 4 — Persistence and Authentication

## Scope
Browser-local save/load, optional cloud persistence in the shared TrackCake Supabase project, and account flows.

## Implementation evidence
- src/lib/workout-store.ts uses localStorage key calkie.workout-plan.v1.
- Store references public.workout_plans, anonymous sign-in and upsert by user_id,week_start.
- Migration SQL defines the workout_plans table, RLS policies and updated-at trigger.
- Live Supabase migration history includes version 20261118113435, name calkie_workout_plans.
- Live public.workout_plans exists with RLS enabled.
- SELECT, INSERT, UPDATE and DELETE policies scope rows to auth.uid() = user_id; UPDATE includes WITH CHECK.
- The workout_plans_set_updated_at trigger exists.

## Status
**Local persistence and live database policy definitions verified. App-level cloud save/auth and two-user RLS runtime tests are blocked.**

## Critical shared-database rule
TrackCake and Cal-Kie intentionally share one Supabase project and PostgreSQL database. The live migration was already applied. Do not rerun SQL, create another project or modify TrackCake schema/policies.

## Acceptance checks
- [x] Local save/load works across browser refresh.
- [x] Shared project's migration history confirms the Cal-Kie migration is applied.
- [x] workout_plans table exists and RLS is enabled.
- [x] Ownership policies are present and use auth.uid().
- [ ] Test Supabase guest save/load through the app.
- [ ] Test authenticated cloud save/load.
- [ ] Test RLS isolation with two separate users.
- [ ] Test signup, login, logout and password recovery on deployed origin.

## Blocker
Vercel app environment does not list PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY. The account trigger is disabled and cloud/auth flows cannot run. Do not change production environment variables without explicit user approval.

## Evidence log
2026-11-19: browser local save/reload passed. Read-only Supabase inspection confirmed migration, table, RLS policies and updated_at trigger. No SQL was executed and no user data was changed.
