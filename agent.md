# Cal-Kie Agent Guide

Read this file before changing Cal-Kie. Keep the first prototype simple, safe and usable.

## Product scope

Cal-Kie is a personalised workout planner derived from the TrackCake codebase. Its current MVP is limited to:
- AI-generated seven-day workout plans.
- User-defined session duration and exercise count.
- Goal, experience, training-day and equipment preferences.
- Exercise sets, reps, rest and duration.
- Editing exercises and regenerating a day or week.
- On-demand remote exercise GIF demonstrations.
- Local plan saving and optional Supabase saving.

Do not add complicated features, analytics, social feeds, payments, nutrition tracking or extra abstractions unless explicitly requested.

## Shared database contract — critical

TrackCake and Cal-Kie use the **same Supabase project and PostgreSQL database**.
- Do not create a separate Supabase project for Cal-Kie.
- TrackCake is already complete. Do not unnecessarily change its UI, tables, policies or behavior.
- Cal-Kie schema additions must be additive and use Cal-Kie-specific table names, starting with `workout_plans`.
- Do not edit existing TrackCake migrations. Treat applied migration history as immutable.
- New migrations must be backward-compatible and committed under `supabase/migrations/`.
- Apply unapplied TrackCake and Cal-Kie migrations together to the one shared database, checking migration history first to avoid reapplying existing TrackCake migrations.
- Keep Row Level Security enabled. Every workout plan row must be scoped to `auth.uid() = user_id`.
- Never use a service-role key in browser code.

## Technology and structure

- Astro 5 + TypeScript.
- Vercel adapter is the production adapter.
- Supabase JS, Auth, PostgreSQL and RLS for cloud persistence.
- AI provider keys are server-only: OpenRouter, Groq and Gemini.
- Main page: `src/pages/index.astro`.
- Workout UI interactions: `src/scripts/workouts.ts`.
- Workout persistence: `src/lib/workout-store.ts`.
- AI generation endpoint: `src/pages/api/workout-plan.ts`.
- Exercise reference endpoint: `src/pages/api/exercises.ts`.
- Styles: `src/styles/calkie.css`.
- Database migrations: `supabase/migrations/`.

## AI and workout rules

- Validate and bound all input on the server.
- Keep provider credentials server-side; never return secrets or log full prompts.
- Respect duration, exercise count, training days, goal, level, equipment and user instructions.
- Generate exactly seven days, with the requested number of active training days and exercises per active day.
- Include recovery days where appropriate; do not recommend hard training of the same muscle group on consecutive days.
- Use conservative, sensible sets/reps/rest, especially for beginners.
- Never present AI-generated routines as medical advice.
- Keep user edits intact unless the user explicitly regenerates the relevant day/week.

## Exercise media rules

- Fetch exercise GIF references only when the user asks to view a demonstration.
- Display remote GIF URLs directly; do not download, upload, copy into `public/`, or save media URLs into the workout plan or Supabase.
- Use no-store responses for exercise search and allow only the known ExerciseDB media host.
- Show ExerciseDB attribution.
- ExerciseDB's free endpoint is for non-commercial/personal prototype use. Do not enable commercial use without a suitable licence or a different provider.

## Development rules

1. Read the existing code before editing.
2. Make the smallest change that meets the request.
3. Preserve copied TrackCake backend functionality unless Cal-Kie explicitly replaces its visible product surface.
4. Avoid unnecessary dependencies, helpers and architecture layers.
5. Use accessible labels, keyboard-operable controls, visible focus states and responsive layouts.
6. Never commit secrets, local environment files or user data.
7. Do not run destructive database changes or weaken RLS.

## Verification

Before release:
- Run `npm run check`.
- Run `npm run build`.
- Test the planner with a configured AI key.
- Test seven-day output, duration, exercise count and recovery days.
- Test day regeneration and all inline edits.
- Test missing AI key handling.
- Test GIF search and confirm media is not persisted.
- Test local save and Supabase save under RLS.
- Check mobile layout and keyboard interaction.

Report exactly which checks ran. Never claim a build, test, push or deployment succeeded without observing the result.
