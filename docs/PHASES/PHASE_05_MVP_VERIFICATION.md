# Phase 5 — MVP Verification and Release Gate

## Status
**Partially verified.** Local implementation, production AI/ExerciseDB, local persistence and the shared Supabase schema/policies have evidence. App-level Supabase auth/cloud persistence and cross-user runtime RLS remain blocked by missing app environment variables.

## Static and dependency verification
- Node.js: v22.23.4.
- Astro: 7.4.13.
- @astrojs/vercel: 11.0.22.
- @astrojs/node: 11.1.14.
- path-to-regexp override: 6.3.0 under @vercel/routing-utils.
- npm ci --package-lock=true: success; 370 packages installed, 371 audited, 0 vulnerabilities.
- npm audit: 0 vulnerabilities.
- npm run check: 0 errors, 0 warnings, 1 existing hint (currentMeal unused in src/scripts/app.ts).
- npm run build: success.

## Functional verification evidence
- Production OpenRouter request: HTTP 200; seven days; 3 active training days; 2 exercises per active day; 30-minute beginner/bodyweight plan.
- Mocked local provider transport: API defaulted to Monday 2026-11-16, returned seven consecutive date keys through 2026-11-22, preserved 3 training days and 2 exercises per active day, and rejected 2026-02-30 with HTTP 400.
- Local missing-provider configuration: HTTP 503 with a useful setup message.
- ExerciseDB: valid search HTTP 200 locally and in production; invalid one-character search HTTP 400.
- Browser smoke: localStorage save/load across refresh; edit exercise name/sets/reps/rest/duration; add/remove exercise; toggle rest day and back; mocked full-week generation; local Monday request verified; failed day/week regeneration preserves the previous week; remote GIF loaded from the allowed host; ExerciseDB attribution visible; mobile viewport has no horizontal overflow; no browser page errors.
- Timezone bug fixed: previous toISOString().slice(0,10) returned the previous calendar date for local midnight in Asia/Kolkata. Client now formats local date components; server date generation uses UTC calendar arithmetic and Monday default.
- Existing Vercel deployment for remote commit f0db4f3: READY. https://cal-kie.vercel.app/ returned HTTP 200; production ExerciseDB API returned HTTP 200.

## Shared Supabase verification (read-only)
- Live migration history includes version 20261118113435, name calkie_workout_plans.
- public.workout_plans exists; RLS is enabled.
- SELECT policy: auth.uid() = user_id.
- INSERT policy: WITH CHECK auth.uid() = user_id.
- UPDATE policy: both USING and WITH CHECK bind auth.uid() = user_id.
- DELETE policy: auth.uid() = user_id.
- workout_plans_set_updated_at trigger and calkie_workout_set_updated_at() function exist.
- No migration or SQL was executed in this verification pass.

## Blocked / not tested
- Vercel environment currently has OPENROUTER_API_KEY but lacks PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY.
- App-level cloud save/load, guest auth, signup/login/logout, password recovery and two-user RLS isolation are therefore not tested.
- Groq and Gemini fallback were not tested.
- Official ExerciseDB V1 terms were reviewed: free use is non-commercial only and requires AscendAPI attribution; commercial/SaaS/monetised use requires a paid RapidAPI plan.

## Release gate
Do not mark Cal-Kie production-ready yet. Finish app Supabase configuration with user approval, test auth/cloud save and two-user RLS, and verify the new deployment after the final single push.
