# Cal-Kie Work Log

Git commits are the authoritative record of exact source changes.

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
