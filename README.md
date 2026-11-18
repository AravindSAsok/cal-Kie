# Cal-Kie

**Your week. Your kind of strong.** Cal-Kie is a personalised workout planner built from the TrackCake application foundation. It focuses on AI-generated weekly training schedules, editable workout sessions and on-demand exercise demonstrations.

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
- Apply all unapplied TrackCake and Cal-Kie migrations to the shared Supabase project in one coordinated migration run. TrackCake migrations must not be applied twice; use the migration history to determine which ones are already applied.
- Both applications must continue to use the same Supabase URL and anon/publishable key. User data is protected by table-specific Row Level Security policies.

### Apply the Cal-Kie migration

After the app is reviewed, run `supabase/migrations/202611180001_calkie_workout_plans.sql` in the existing TrackCake Supabase project (or apply it through the Supabase migration workflow). Do not run it against a new project. Enable Anonymous Sign-ins in Supabase Auth if Cal-Kie should save plans for guest sessions.

## Exercise demonstrations and licensing

Exercise references are queried on demand from [ExerciseDB](https://oss.exercisedb.dev/docs). The application receives exercise names and remote GIF URLs, then displays the remote GIF directly. It does not download, transform, upload or persist the media. ExerciseDB's free API is described as suitable for personal projects and non-commercial prototypes, requires visible attribution, and restricts commercial/SaaS use without a paid plan. The interface credits ExerciseDB. **Before commercial or monetised use, obtain the appropriate ExerciseDB licence or replace the provider with a source whose licence permits that use.** Availability and rate limits are controlled by the external provider.

## Technology

- Astro 5 + TypeScript
- Supabase Auth + PostgreSQL + Row Level Security
- OpenRouter, Groq or Gemini (server-side only)
- ExerciseDB runtime exercise search and GIF URLs
- Vercel deployment

## Local development

Requirements: Node.js 22 and npm.

```bash
npm install
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
