# Cal-Kie Agent Instructions

This file is the required entry point for every human or AI agent working in this repository.

## Start here — every session
1. Read this file.
2. Read `docs/PROJECT_STATUS.md`, `docs/HANDOFF.md`, `docs/ROADMAP.md`, `docs/ARCHITECTURE.md` and `docs/DECISIONS.md`.
3. Inspect the current branch, latest commit and relevant source files. Documentation is a guide, not proof that the code or deployment still matches it.
4. Check `docs/CHANGELOG.md` and the relevant phase record before repeating work.

## Runtime version
- Use Node.js >=22.23.4 and <23. The repository .nvmrc pins 22.23.4; use the committed package-lock.json with npm ci.

## Product scope
Cal-Kie is a simple, personal AI workout-week planner built on the Astro application foundation. Keep the prototype focused. Do not add payments, social features, analytics, nutrition tracking, complex abstractions or unrelated features unless explicitly requested.

## Critical architecture and safety rules
- TrackCake and Cal-Kie intentionally share the same Supabase project and PostgreSQL database. Do not create another project or alter TrackCake behavior without explicit approval.
- Cal-Kie database changes must be additive, backward-compatible and namespaced. Do not edit historical/applied migrations.
- Check the shared project's migration history before applying migrations. Never claim a migration is applied based only on the presence of its SQL file.
- Keep RLS enabled. Workout rows must be scoped to the authenticated user's `auth.uid()`.
- Never expose service-role credentials or AI provider keys to browser code. Never commit real `.env` files, secrets, tokens or user data.
- ExerciseDB GIFs are fetched on demand and displayed remotely. Do not download, upload, persist or mirror the media. Credit AscendAPI visibly for ExerciseDB V1 and respect its usage restrictions; obtain a suitable paid licence before commercial/SaaS/monetised use.
- Preserve existing TrackCake functionality and shared database contracts.

## Development workflow
1. Define the smallest task and acceptance criteria before editing.
2. Read the exact files being changed and their callers.
3. Make focused, incremental changes. Avoid unrelated refactors.
4. Run relevant checks. For a release candidate, run `npm run check` and `npm run build`.
5. Record only checks actually run and their observed outcomes.
6. After each meaningful task/phase, update `docs/PROJECT_STATUS.md`, `docs/ROADMAP.md`, `docs/CHANGELOG.md`, the relevant `docs/PHASES/` record and `docs/HANDOFF.md`.
7. Include the resulting commit SHA when known. Do not claim a push, deployment, database operation or end-to-end test succeeded unless verified.

## Git batching and release rules
- For a multi-phase verification/release task, work directly on `main`; do not create a feature branch or pull request.
- Complete implementation, documentation and all available verification before committing. Do not create intermediate phase commits or pushes.
- Review the full diff and exclude `.env`, credentials, generated secrets and unrelated files. Create one comprehensive commit and push once to `origin/main` after final checks.
- Never force-push or overwrite unrelated work. If remote `main` advances, fetch and safely reconcile before pushing.
- After the single push, monitor the Vercel deployment. If it fails, fix the cause, rerun checks and build, then make one corrective commit/push and monitor again.

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
