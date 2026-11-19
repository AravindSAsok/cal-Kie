# Cal-Kie Work Log

Git commits remain the authoritative record of exact code changes.

## 2026-11-19 — MVP verification and release hardening
- Upgraded Astro to 7.4.13, @astrojs/vercel to 11.0.22 and @astrojs/node to 11.1.14 after npm audit found 11 vulnerabilities in the previous dependency tree.
- Added a path-to-regexp 6.3.0 override for @vercel/routing-utils; npm audit now reports 0 vulnerabilities.
- Added package-lock.json and .nvmrc (22.23.4); constrained the Node engine to >=22.23.4 <23.
- Fixed the timezone-sensitive Monday date key in the browser and made server week-date fallback Monday-based with UTC calendar arithmetic. A mocked provider test verified seven consecutive dates and rejection of invalid dates.
- Verified clean npm ci (370 packages installed, 371 audited, 0 vulnerabilities), npm audit (0 vulnerabilities), npm run check (0 errors, 0 warnings, 1 existing hint) and npm run build (success).
- Browser smoke passed local save/reload, inline editing, add/remove, rest-day toggling, mocked week generation, failed day/week regeneration preservation, remote GIF rendering/attribution and mobile no-overflow.
- Production OpenRouter generation returned a valid seven-day plan with 3 active days and 2 exercises per active day.
- ExerciseDB live search passed locally and in production; invalid search returned HTTP 400. Official free V1 terms were reviewed; the UI now credits AscendAPI as required and documentation records non-commercial-only use.
- Read-only Supabase inspection verified the applied calkie_workout_plans migration, public.workout_plans, RLS ownership policies and updated_at trigger. No SQL was executed.
- Existing Vercel deployment for remote commit f0db4f3 was READY; public homepage and production ExerciseDB API returned HTTP 200.
- App-level Supabase auth/cloud persistence remains blocked because Vercel does not list PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY. Groq/Gemini fallback and two-user RLS runtime testing remain outstanding.
- All available local checks and the final secret/diff review are complete; the batch is consolidated into one comprehensive commit on main for a single push.

## 2026-11-19 — Project continuity baseline
- Inspected repository metadata and default branch (main).
- Added canonical AGENTS.md and project docs for status, roadmap, architecture, decisions, phase records and handoff.
- The initial docs-only baseline did not modify application source, database or deployment.

## Earlier implementation milestones (repository history / existing documentation)
- Astro-based Cal-Kie planner and branding.
- AI workout-plan endpoint and provider configuration.
- ExerciseDB on-demand exercise lookup.
- Local and Supabase workout-plan persistence.
- Supabase sign-up/login/password-recovery work.

For detailed code history, inspect GitHub commits: https://github.com/AravindSAsok/cal-Kie/commits/main
