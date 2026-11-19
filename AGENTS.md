# Cal-Kie Agent Instructions

This file is the required entry point for every human or AI agent working in this repository.

## Start here — every session
1. Read this file.
2. Read `docs/PROJECT_STATUS.md`, `docs/HANDOFF.md`, `docs/ROADMAP.md`, `docs/ARCHITECTURE.md` and `docs/DECISIONS.md`.
3. Inspect the current branch, latest commit and relevant source files. Documentation is a guide, not proof that the code or deployment still matches it.
4. Check `docs/CHANGELOG.md` and the relevant phase record before repeating work.

## Product scope
Cal-Kie is a simple, personal AI workout-week planner built on the Astro application foundation. Keep the prototype focused. Do not add payments, social features, analytics, nutrition tracking, complex abstractions or unrelated features unless explicitly requested.

## Critical architecture and safety rules
- TrackCake and Cal-Kie intentionally share the same Supabase project and PostgreSQL database. Do not create another project or alter TrackCake behavior without explicit approval.
- Cal-Kie database changes must be additive, backward-compatible and namespaced. Do not edit historical/applied migrations.
- Check the shared project's migration history before applying migrations. Never claim a migration is applied based only on the presence of its SQL file.
- Keep RLS enabled. Workout rows must be scoped to the authenticated user's `auth.uid()`.
- Never expose service-role credentials or AI provider keys to browser code. Never commit real `.env` files, secrets, tokens or user data.
- ExerciseDB GIFs are fetched on demand and displayed remotely. Do not download, upload, persist or mirror the media. Keep attribution visible and respect provider licensing; confirm a suitable licence before commercial use.
- Preserve existing TrackCake functionality and shared database contracts.

## Development workflow
1. Define the smallest task and acceptance criteria before editing.
2. Read the exact files being changed and their callers.
3. Make focused, incremental changes. Avoid unrelated refactors.
4. Run relevant checks. For a release candidate, run `npm run check` and `npm run build`.
5. Record only checks actually run and their observed outcomes.
6. After each meaningful task/phase, update `docs/PROJECT_STATUS.md`, `docs/ROADMAP.md`, `docs/CHANGELOG.md`, the relevant `docs/PHASES/` record and `docs/HANDOFF.md`.
7. Include the resulting commit SHA when known. Do not claim a push, deployment, database operation or end-to-end test succeeded unless verified.

## Current source map
- Main UI: `src/pages/index.astro`
- Workout interactions: `src/scripts/workouts.ts`
- Workout persistence: `src/lib/workout-store.ts`
- AI generation endpoint: `src/pages/api/workout-plan.ts`
- Exercise lookup endpoint: `src/pages/api/exercises.ts`
- Main styles: `src/styles/calkie.css`
- Supabase migrations: `supabase/migrations/`
- Existing detailed project guide: `agent.md` (retain and consult; this file is the canonical session entry point)

## Required handoff format
The handoff must state: current phase, latest verified commit, what changed, checks and results, known blockers/unknowns, exact next task, relevant files and any approvals needed. Distinguish implemented, tested, deployed and production-ready states.
