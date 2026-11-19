# Cal-Kie Architecture Notes

_Last inspected: 2026-11-19. This is a source-based map, not a claim that every flow has passed runtime tests._

## Product
Cal-Kie is an Astro 7 + TypeScript web app for generating and editing a seven-day workout plan.

## Runtime and deployment
- Astro 7.4.13, TypeScript, Node.js 22.23.4+ (Node 22 only).
- `@astrojs/vercel` 11.0.22 and `@astrojs/node` 11.1.14; `package-lock.json` is committed for reproducible installs.
- `path-to-regexp` is overridden to patched 6.3.0 under `@vercel/routing-utils`.
- Vercel adapter is identified by the existing agent guide and repository README.
- Local development: use Node `22.23.4` from `.nvmrc`, run `npm ci`, copy `.env.example` to `.env`, then `npm run dev` (default Astro port 4321).
- Build/check scripts: `npm run check`, `npm run build`, `npm run preview`.

## Main code paths
| Concern | Path |
|---|---|
| Planner page | `src/pages/index.astro` |
| Workout UI behavior | `src/scripts/workouts.ts` |
| Workout plan persistence | `src/lib/workout-store.ts` |
| AI plan API | `src/pages/api/workout-plan.ts` |
| Exercise search API | `src/pages/api/exercises.ts` |
| Styles | `src/styles/calkie.css` |
| Database migrations | `supabase/migrations/` |

## Calendar date handling
- The client calculates Monday using the local calendar date and formats year/month/day directly; do not convert local midnight through toISOString(), which can shift the date in positive UTC offsets.
- The API defaults to the current Monday and builds seven consecutive date keys using UTC calendar arithmetic.

## AI generation
- Server endpoint: `POST /api/workout-plan`.
- Providers represented in source: OpenRouter, Groq (OpenAI-compatible chat completions) and Gemini.
- Provider credentials are server-side environment variables.
- Config includes duration, exercise count, training days, goal, level, equipment and optional focus.
- Endpoint constructs a structured JSON prompt and validates/normalises returned day/exercise values.
- Verify provider defaults, fallback order, timeouts and response limits in the current source before changing provider behavior.

## Exercise lookup
- Server endpoint: `GET /api/exercises?search=...`.
- Queries ExerciseDB at runtime; response is no-store.
- Returned GIF URL is filtered to `https://static.exercisedb.dev/media/`.
- Media must remain remote and on-demand; do not store GIFs or URLs in plans/database.
- ExerciseDB V1 is provided by AscendAPI; free use is non-commercial only and requires visible AscendAPI attribution. Commercial/SaaS/monetised use requires a paid RapidAPI plan.

## Persistence and identity
- Browser local-storage key in source: `calkie.workout-plan.v1`.
- Supabase table: `public.workout_plans`.
- Store uses the public Supabase URL and anon key; it attempts anonymous sign-in when there is no session, then upserts by `user_id,week_start`.
- Migration SQL enables RLS and defines per-user select/insert/update/delete policies using `auth.uid()`.
- TrackCake and Cal-Kie share one Supabase project/database. Never create a second project or run migrations without checking the shared migration history.
- Authentication UI/flows exist in the repository; inspect current auth implementation before modifying.

## Environment variables
See `.env.example`. Current documented variables:
- `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`
- `GROQ_API_KEY`, `GROQ_MODEL`
- `GEMINI_API_KEY`, `GEMINI_MODEL`
- `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`

Do not add secrets to this document. Do not use a `PUBLIC_` prefix for AI provider keys. Never expose Supabase service-role credentials in client code.
