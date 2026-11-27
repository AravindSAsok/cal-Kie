# Cal-Kie Roadmap

Keep the MVP focused. Do not expand scope until the MongoDB-only release is verified.

## Phase 1 — Core planner
- [x] Seven-day AI workout plan generation.
- [x] Duration, exercise count, training days, goal, level and equipment preferences.
- [x] Day/week regeneration and inline editing.
- [x] ExerciseDB on-demand lookup and remote GIF attribution.

## Phase 2 — MongoDB accounts
- [x] MongoDB connection module.
- [x] Compatible scrypt password hashing and verification.
- [x] Hashed opaque session tokens and HttpOnly cookie.
- [x] Signup, login, logout and current-session endpoints.
- [ ] Runtime test with two separate users.
- [ ] Configure and test password reset email delivery.

## Phase 3 — MongoDB workout persistence
- [x] Per-user, per-week collection model.
- [x] Unique user/week and latest-plan indexes.
- [x] Authenticated GET/PUT/DELETE endpoints.
- [x] Local cache retained when the user is offline or signed out.
- [ ] Verify cloud save/load on the deployed origin.
- [ ] Verify user A cannot read or modify user B's plan.

## Phase 4 — Release verification
- [x] Clean install using Node 22.23.4.
- [x] npm audit reports 0 vulnerabilities.
- [x] Astro check: 0 errors, 0 warnings, 0 hints.
- [x] Production build succeeds.
- [x] Local homepage, current-session and unauthenticated API smoke tests.
- [ ] Configure MONGODB_URI in Vercel Production.
- [ ] Signup/login/logout and workout cloud-save smoke tests.
- [ ] Two-user plan isolation test.
- [ ] Production deployment READY and AI/ExerciseDB smoke tests.
- [ ] Mobile layout and browser console check.

## Phase 5 — Later, only if needed
- [ ] Configure transactional email and implement secure password recovery.
- [ ] Privacy, data export and account deletion requirements.
- [ ] Provider cost/rate controls.
- [ ] Exercise-media licensing for the intended distribution model.

## Exercise media improvement — 2026-11-19
- [x] Sequentially preload remote ExerciseDB GIFs in workout order.
- [x] Reuse the preload request when a user clicks View GIF.
- [ ] Verify build and browser behavior after deployment.


## Phase 6 — Dumbbell routine and timer
- [x] Replace band-based movement in the hardcoded two-week routine with a dumbbell alternative.
- [x] Remove the resistance-band option from workout generation and guide AI toward dumbbell/bodyweight choices.
- [x] Add top-bar Timer navigation from Home and Workout Builder.
- [x] Add countdown, stopwatch with laps, and configurable interval timer.
- [ ] Verify type-check/build and browser behavior after deployment.

## Phase 7 — Firecrawl exercise GIF discovery

- [x] Add Firecrawl image search as the preferred GIF discovery provider.
- [x] Require exact exercise-token coverage and direct HTTPS GIF URLs.
- [x] Keep ExerciseDB as a fallback when Firecrawl is unavailable or has no matching result.
- [x] Randomly select among equally relevant matches and show source attribution links.
- [x] Keep third-party media remote with bounded temporary caches only.
- [ ] Run type-check and production build.
- [ ] Verify routine and builder GIF rendering on mobile and desktop, in light and dark themes.
- [ ] Verify Vercel deployment and Firecrawl API behavior with/without an API key.
- [ ] Review source-specific reuse licences and hotlink policies before commercial distribution.
