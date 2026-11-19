# Cal-Kie Roadmap

Keep the MVP focused. Do not expand scope until the current release gate is cleared.

## Phase 0 — Project baseline and continuity
- [x] Confirm repository, default branch and source head.
- [x] Add canonical agent instructions and durable project status/handoff documentation.
- [x] Verify the shared Supabase project and migration history during the MVP pass.
- [x] Define a one-commit/one-push release workflow.

## Phase 1 — Core planner
- [x] Planner inputs and seven-day AI endpoint exist.
- [x] Production OpenRouter request returned exactly seven days, 3 requested training days and 2 exercises per active day for a 30-minute beginner bodyweight plan.
- [x] Missing local provider key returns a useful HTTP 503 response.
- [x] Fix local-Monday calculation for positive UTC offsets and make API fallback default to Monday.
- [x] Typecheck and production build pass.
- [ ] Exercise all provider fallback paths (Groq/Gemini) and malformed upstream responses.

## Phase 2 — Editing and regeneration
- [x] Browser-tested editing of name, sets, reps, rest and duration.
- [x] Browser-tested adding/removing exercises and toggling recovery days.
- [x] Browser-tested mocked successful seven-day generation and verified the client sends the correct local Monday.
- [x] Browser-tested failed day and week regeneration; existing week remains intact.
- [ ] Test successful day/week regeneration against a real configured provider through the UI.

## Phase 3 — Exercise demonstrations
- [x] Live ExerciseDB search returns valid results locally and in production.
- [x] Invalid short search returns HTTP 400.
- [x] Browser displays a remote GIF from the allowed ExerciseDB media host with attribution.
- [x] Source and browser checks confirm GIFs are not downloaded or persisted by Cal-Kie.
- [x] Review official free V1 usage restrictions and add required AscendAPI attribution.
- [ ] Obtain a paid RapidAPI plan or alternative licence before any commercial/monetised use.

## Phase 4 — Persistence and authentication
- [x] Browser-tested local save/load across refresh.
- [x] Live shared Supabase migration history contains calkie_workout_plans.
- [x] Live public.workout_plans table exists with RLS enabled.
- [x] Live SELECT/INSERT/UPDATE/DELETE policies scope access to auth.uid() = user_id; UPDATE has a matching WITH CHECK.
- [ ] Test cloud save/load through the app.
- [ ] Test RLS isolation with two separate test users.
- [ ] Test signup, login, logout and password recovery on the deployed origin.
- **Blocker:** Vercel app environment currently lacks PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY. Do not change production environment variables without approval.

## Phase 5 — MVP release verification
- [x] Upgrade vulnerable Astro dependencies and achieve npm audit with 0 vulnerabilities.
- [x] Run npm run check: 0 errors, 0 warnings, 1 existing hint.
- [x] Run npm run build: success.
- [x] Run desktop/mobile browser smoke tests; no page errors or mobile horizontal overflow.
- [x] Verify existing Vercel production deployment status and public homepage/API responses.
- [ ] Push the verified local batch as one comprehensive commit and monitor the resulting deployment.
- [ ] Repeat deployment verification against the new commit.
- **Release status:** partially verified; cloud auth/persistence and cross-user runtime RLS tests remain blocked.

## Phase 6 — Production readiness (after MVP)
- [ ] Review privacy, data retention, account deletion and export expectations.
- [ ] Confirm provider cost/rate controls and all fallback paths.
- [ ] Obtain appropriate exercise-media licensing for the intended distribution model.
- [ ] Add only necessary operational monitoring and recovery procedures.
- [ ] Obtain explicit approval before adding payments or unrelated features.
