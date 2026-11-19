# Cal-Kie

**Your week. Your kind of strong.** Cal-Kie is a personalised workout planner built from the TrackCake application foundation. It focuses on AI-generated weekly training schedules, editable workout sessions and on-demand exercise demonstrations.

## Project continuity — read before development

- Start with [AGENTS.md](./AGENTS.md) for mandatory agent instructions.
- [Current project status](./docs/PROJECT_STATUS.md)
- [Roadmap and phases](./docs/ROADMAP.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Decision log](./docs/DECISIONS.md)
- [Latest handoff / next task](./docs/HANDOFF.md)
- [Changelog](./docs/CHANGELOG.md)

Keep these documents updated after meaningful work. Git history remains the source of truth for exact code changes.

## First MVP

- Generate a Monday-to-Sunday workout plan with AI.
- Choose session length (10–180 minutes), exercises per training day, training days per week, goal, experience level and equipment.
- Receive exercise names, sets, reps, rest periods, duration estimates and form instructions.
- Regenerate the full week or one day.
- Edit sets, reps, rest and duration; remove or add exercises; turn days into recovery days.
- Save the plan locally or to the shared Supabase project when cloud configuration and guest auth are enabled.
- Request an exercise GIF only when needed. Cal-Kie fetches the GIF URL from ExerciseDB at runtime and does not upload or save GIFs to Supabase, the repository or application storage.

AI generation requires at least one server-side provider key: `OPENROUTER_API_KEY`, `GROQ_API_KEY` or `GEMINI_API_KEY`. Add it to Vercel Environment Variables and redeploy. No provider key is committed to this repository.

## Shared TrackCake / Cal-Kie database

**TrackCake and Cal-Kie use the same Supabase project and the same PostgreSQL database.** They are separate applications with different user experiences, not separate database deployments.

- TrackCake's existing tables, policies and applied migration history are preserved.
- Cal-Kie adds its own namespaced feature table(s), starting with `public.workout_plans`.
- Never create a second Supabase project for Cal-Kie unless the maintainer explicitly changes this architecture.
- Never edit or rewrite a TrackCake migration that may already have been applied.
- New Cal-Kie schema changes must be additive, backward-compatible migrations in `supabase/migrations/`.
- Apply migrations only after checking the shared project's migration history and current schema. Do not blindly rerun an existing SQL file.
- Both applications must continue to use the same Supabase URL and anon/publishable key. User data is protected by table-specific Row Level Security policies.

### Cal-Kie workout-plans migration

Migration file: `supabase/migrations/202611180001_calkie_workout_plans.sql`.

The live shared-project migration history was checked on 2026-11-19 and includes version 20261118113435 named calkie_workout_plans; the public.workout_plans table, RLS policies and updated-at trigger were also verified. This does not remove the need to check migration history before future database work. **Do not run this migration blindly and do not create a new Supabase project.** Enable Anonymous Sign-ins only if guest cloud saves are intended.

## Exercise demonstrations and licensing

Exercise references are queried on demand from [ExerciseDB](https://oss.exercisedb.dev/docs). The application receives exercise names and remote GIF URLs, then displays the remote GIF directly. It does not download, transform, upload or persist the media. ExerciseDB V1 is provided by AscendAPI. Its free version allows personal projects, prototypes, educational tools and other non-commercial apps; commercial products, SaaS platforms or monetised use require a paid plan via RapidAPI. Visible attribution to AscendAPI is required. The interface credits ExerciseDB by AscendAPI. See the official [ExerciseDB V1 usage restrictions](https://oss.exercisedb.dev/docs). **Before commercial or monetised use, obtain the appropriate ExerciseDB licence or replace the provider with a source whose licence permits that use.** Availability and rate limits are controlled by the external provider.

## Technology

- Astro 7 + TypeScript
- Supabase Auth + PostgreSQL + Row Level Security
- OpenRouter, Groq or Gemini (server-side only)
- ExerciseDB runtime exercise search and GIF URLs
- Vercel deployment

## Local development

Requirements: Node.js 22.23.4 or newer within Node 22, and npm. `.nvmrc` pins the verified version.

```bash
npm ci
cp .env.example .env
npm run dev
```

Open http://localhost:4321.

Without an AI provider key, the planner UI and local editing work, but AI generation returns a setup message. Without Supabase variables, plans are saved in browser local storage. With Supabase configured, Cal-Kie uses the same project as TrackCake; enable Anonymous Sign-ins for guest cloud saves.

## Environment variables

```dotenv
OPENROUTER_API_KEY=
OPENROUTER_MODEL=
GROQ_API_KEY=
GROQ_MODEL=
GEMINI_API_KEY=
GEMINI_MODEL=
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=
```

AI keys must remain server-side. Never prefix them with `PUBLIC_`, commit a real `.env` file, or expose a Supabase service-role key in browser code.

## Build and verify

```bash
npm run check
npm run build
npm run preview
```

## Repository

- Source: https://github.com/AravindSAsok/cal-Kie
- Base application: https://github.com/AravindSAsok/tracKcake
- Hosting: Vercel

Cal-Kie is an early prototype. Workout suggestions are general information, not medical advice. Adjust exercises to your ability, stop if you experience pain, and seek qualified guidance when needed.
