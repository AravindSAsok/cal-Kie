# Cal-Kie Work Log

Git commits are the authoritative record of exact source changes.

## 2026-11-27 — Fix: exercise demo GIFs not loading

- Cause 1 — name matching: the routine and builder scripts required an exact normalised name match on ExerciseDB results, but the provider's search is fuzzy and ranked. None of the 48 routine exercise names matched exactly ("Dumbbell chest press" returns "dumbbell bench press"), so almost every lookup ended in "No matching demo found."
- Cause 2 — rate limiting: the free provider throttles bursts with Cloudflare `error code: 1102`, sometimes as plain text instead of JSON. `/api/exercises` treated that as a hard failure and returned 502, which the UI showed as "GIF search is unavailable."
- Fix (matching): new `bestMatch` / `bestExerciseMatch` compare singularised word sets, require every word of the requested exercise to appear in the candidate so a demo is never swapped for an unrelated movement, read `chest` as `bench`, and prefer dumbbell/bodyweight candidates over barbell/cable/machine ones.
- Fix (provider): `/api/exercises` retries up to 3 times with backoff, treats `success:false` and non-JSON throttling bodies as retryable, and returns up to 12 candidates so the best match is in range.
- Verified: live `/api/exercises` returned HTTP 200 with candidate lists for Push-ups, Lateral raises and Goblet squat; the matcher resolved 14 of 15 representative routine names against those real candidate lists (face pulls have no provider equivalent and now fail honestly instead of showing an unrelated GIF). `npm run check` 0 errors/0 warnings/0 hints, `npm run build` success. No rendered browser check was performed.

## 2026-11-27 — Style-only guarantees restored

- Restored `src/pages/api/estimate.ts`, `src/pages/api/food-image.ts`, `src/pages/api/provider-status.ts` and `src/lib/nutrition-research.ts`, which the redesign had deleted. They are unreferenced legacy routes, but deleting them still changed the deployed API surface.
- `src/scripts/account.ts` no longer redirects to `/signin` after a successful log-out (it reloads the page, as before) and no longer replaces the sign-in/sign-up card for signed-in visitors. Both were behaviour changes introduced by the redesign; account logic now matches `f08623c`.
- Removed the now-unused `[data-auth-page]` hook from `/signin` and `/signup` and corrected the docs that described it.
- The interface work itself remains styling and markup only: `src/styles/app.css`, `src/components/AppChrome.astro`, the page templates, and the selectors those templates expose. `src/scripts/workouts.ts`, `src/scripts/timer.ts`, `src/scripts/two-week-routine.ts`, `src/scripts/auth-page.ts`, `src/lib/*` and every API handler are byte-identical to `f08623c`. The one removed script is `src/scripts/navigation.ts`, because the burger drawer it drove no longer exists in the markup — the tab bar replaces that navigation.
- Verified: `npm run check` (0 errors, 0 warnings, 0 hints), `npm run build` (success), `git diff --stat f08623c -- src/scripts src/lib src/pages/api` shows only the restored files and `account.ts`. No browser click-through performed.

## 2026-11-27 — Fix: home routine feed rendered empty

- `src/pages/index.astro` had lost `import "../scripts/two-week-routine"` during the redesign. `#routine-content` is populated only by that script, so the home page showed no workouts at all. The hardcoded two-week dumbbell routine, its form cues and the custom-demo controls were never deleted — only the import was missing.
- Restored the import and recorded the dependency in the `AGENTS.md` interface contracts so a future redesign cannot drop it silently.
- Verified: `npm run check` (0 errors, 0 warnings, 0 hints), `npm run build` (success), and the built home-page chunk `index.astro_astro_type_script_index_0_lang.*.js` now contains the routine data. Dev server returned HTTP 200 for `/` with `#two-week-routine`, `#routine-week`, `#routine-day` and `#routine-content` present. No browser click-through or screenshot pass was performed.

## 2026-11-27 — Instagram-inspired interface, cleanup and agent docs

- Replaced the dark green theme with one Instagram-inspired design system in `src/styles/app.css`: hairline borders, 8–14px cards, gradient avatar/story rings, blue primary actions, system type with a script wordmark, and automatic light/dark tokens.
- Added `src/components/AppChrome.astro`: desktop left rail, mobile top bar, fixed bottom tab bar, skip link, accessible active states. Every standard page now shares it.
- Home is now a profile header plus seven day "stories" that drive the two-week routine, which renders as a single-column post feed with numbered form cues.
- Workout Builder is a create screen: an Instagram-style preference card and the editable week as feed cards, with the same generation/persistence behaviour.
- Timer, sign-in and sign-up rebuilt on the same system. Signed-in visitors to `/signin` or `/signup` see their session and a log-out action instead of an empty form.
- `src/scripts/account.ts` rewritten to mount an avatar-based account module into `[data-account-slot]` and to keep sign-out honest.
- Removed unused TrackCake leftovers: `api/estimate.ts`, `api/food-image.ts`, `api/provider-status.ts`, `lib/nutrition-research.ts`, the unused 2,748-line `styles/global.css`, and the burger-drawer script.
- Renamed the Android Java source directory to `com/aravindsasok/calkie` to match its declared package.
- Added `CLAUDE.md` and `.github/copilot-instructions.md` pointing at `AGENTS.md`; expanded `AGENTS.md` with the repository snapshot, expanded source map, DOM contracts, interface rules, environment notes and a UI definition of done.
- Verified: `npm run check` (0 errors, 0 warnings, 0 hints), `npm run build` (success), dev server returned HTTP 200 for `/`, `/workout-builder`, `/timer`, `/signin` and `/signup` with the expected IDs and chrome markup present. No browser click-through or visual screenshot pass was performed. (Correction: this batch dropped the home page's routine-script import; see the fix entry above.)

## 2026-11-25 — Dumbbell-only routine and timer

- Replaced the hardcoded band-based Pallof press with Dumbbell plank drag and movement-specific instructions.
- Removed the bands-and-dumbbells option from workout generation; default home equipment is dumbbells and bodyweight.
- Updated the AI workout prompt to avoid band exercises and prefer dumbbell/bodyweight alternatives.
- Added Timer links to the top bar and navigation drawer on Home and Workout Builder.
- Added `/timer` with countdown presets, stopwatch/lap tracking, configurable interval rounds/work/rest and optional sound.
- Kept the timer client-side with no account, API or database dependency.
- Source-level routine/cue validation passed; type-check/build/browser checks remain pending after deployment.

## 2026-11-25 — User-owned exercise demos

- Added per-exercise controls to paste a public HTTPS image/GIF URL or upload GIF, PNG, JPG or WEBP (4 MB maximum).
- Added MongoDB persistence in exercise_gifs, one custom demo per authenticated user and normalized exercise name.
- Uploaded file bytes are stored as BSON binary and served only through an authenticated, owner-checked API.
- Custom demos take precedence over ExerciseDB for their owner; removing a custom demo restores provider lookup.
- Kept ExerciseDB media temporary and separate; no provider GIFs or API-derived data are permanently stored.
- Expanded AGENTS.md with mandatory custom-media security, storage, validation, testing and release rules.
- Type-check/build and live MongoDB behavior require post-push verification; Vercel Production MONGODB_URI is documented as missing.

## 2026-11-25 — Dedicated workout builder screen

- Moved the existing AI workout preference form and seven-day editable plan calendar from the home page to /workout-builder.
- Added a right-side burger navigation drawer on both screens with Home and Generate Workout links.
- Added a direct Generate my workout call-to-action on the home screen.
- Kept the existing workout script, element IDs, API routes, local cache, MongoDB persistence and exercise demo behavior unchanged.
- No database, AI provider or authentication changes.


## 2026-11-19 — MongoDB-only migration

- Replaced the workout persistence client with same-origin MongoDB-backed API calls while retaining the local browser cache.
- Added the MongoDB connection module and reused the established scrypt/session-cookie account contract.
- Added signup, login, logout and current-session API routes.
- Added per-user workout-plan GET/PUT/DELETE persistence with unique user/week and latest-plan indexes.
- Updated account UI for MongoDB authentication and display-name signup.
- Removed legacy database SDK references, unused copied application modules and old SQL migration files.
- Existing MongoDB collections and account hash formats were inspected read-only; no database documents were modified.
- Configured MONGODB_DB_NAME=hulksar in Cal-Kie Vercel Production. MONGODB_URI remains to be configured.
- Clean install succeeded on Node 22.23.4; npm audit reported 0 vulnerabilities.
- Astro check reported 0 errors, 0 warnings and 0 hints; production build succeeded.
- Local homepage returned HTTP 200; auth/me returned user:null without a cookie; signup correctly returned HTTP 503 without MONGODB_URI; workout load correctly returned HTTP 401 without a session.

## Earlier MVP implementation

- Astro-based Cal-Kie planner and branding.
- AI workout-plan endpoint and OpenRouter/Groq/Gemini provider support.
- ExerciseDB on-demand exercise lookup and remote GIF display.
- Local workout-plan persistence.
- Dependency hardening, Node 22 runtime pin and one-commit release workflow.

For detailed code history, inspect https://github.com/AravindSAsok/cal-Kie/commits/main.

## 2026-11-19 — Sequential exercise GIF preloading

- Workout GIFs now preload one at a time in workout order after a plan renders.
- Exercise lookup requests and image decoding are shared with button clicks, avoiding duplicate requests; a ready GIF can display immediately.
- GIFs remain remote and are not downloaded or persisted; ExerciseDB attribution remains visible.
