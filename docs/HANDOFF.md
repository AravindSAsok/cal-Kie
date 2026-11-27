# Cal-Kie — Next Agent Handoff

_Last updated: 2026-11-25 after dedicated workout-builder UI update._

## Latest UI change — 2026-11-25

- Home focuses on the hero and existing two-week training routine.
- The existing AI workout preferences form and editable seven-day plan calendar live at /workout-builder.
- A right-side burger menu appears on both pages and links to Home and Generate Workout.
- Home also has a direct Generate my workout link.
- Existing workout interaction logic, element IDs, API routes and persistence were retained.
- New navigation behavior lives in src/scripts/navigation.ts.
- No local checkout or build was used; inspect GitHub Actions and Vercel after the main commit.

## Read first

1. AGENTS.md
2. docs/PROJECT_STATUS.md
3. docs/ROADMAP.md
4. docs/ARCHITECTURE.md
5. docs/DECISIONS.md
6. agent.md

## Repository

- Repository: AravindSAsok/cal-Kie
- Branch: main
- Local path: D:/AI-Projects/cal-Kie
- Parent/base commit: 0cd0dcf902b14626251ab3bf533fd84d5384a615.
- Latest release commit: use git rev-parse HEAD; verify it matches origin/main after push.
- This migration is released as one comprehensive commit on main. Do not force-push.

## Migration implemented locally

- MongoDB connection module: src/lib/mongodb.ts.
- Existing scrypt + session cookie contract reused in src/lib/auth.ts.
- Signup/login/logout/me endpoints added under src/pages/api/auth/.
- Workout persistence client now uses same-origin API requests and local fallback.
- Workout plan GET/PUT/DELETE handlers added to src/pages/api/workout-plan.ts.
- Account UI now talks to MongoDB-backed endpoints and collects a name for signup.
- MongoDB collection name: workout_plans; DB default: hulksar.
- Legacy database SDK, copied unused modules, old SQL migration files and outdated documentation removed.
- No database records were modified during this source migration.

## MongoDB evidence

The connected Atlas cluster HulksarCluster in project Project 0 has database hulksar. Read-only inspection found collections users, auth_sessions, food_entries, assistant_messages, daily_tasks, daily_task_logs, tracker_settings, app_metadata and migration_state. The existing users records use 32-character hex salts and 128-character hex hashes, matching the scrypt implementation reused from ProjectHulksar. Existing unique email and session indexes were observed. No records were changed.

## Verified locally

- Node.js v22.23.4.
- npm install --package-lock-only completed.
- npm ci --package-lock=true succeeded; 369 packages audited.
- npm audit: 0 vulnerabilities.
- npm run check: 0 errors, 0 warnings, 0 hints.
- npm run build: success.
- Local homepage: HTTP 200; account and workout UI markers present.
- /api/auth/me without a cookie: HTTP 200 with user:null.
- /api/auth/signup without MONGODB_URI: HTTP 503 (expected).
- /api/workout-plan without a session: HTTP 401 (expected).

## Production blocker

Cal-Kie Vercel Production has MONGODB_DB_NAME=hulksar, but MONGODB_URI is not configured. The other Vercel project projecthulksar has a MongoDB variable, but the secret value was not exposed by the environment API and must not be guessed or copied from a public source. Add the authorised Atlas URI to Cal-Kie's Production environment through Vercel's secure environment settings, then redeploy. Never commit the URI.

Password recovery email delivery is not configured; UI reports this limitation.

## Required next actions

1. Review git diff, ensure no secrets or unrelated files.
2. Confirm remote main has not advanced.
3. Commit once and push once to origin/main.
4. Monitor Vercel and verify deployment READY.
5. Add MONGODB_URI to Cal-Kie Production.
6. Test signup/login/logout, workout save/load and two-user isolation against the deployed app.

Do not claim cloud authentication/persistence passed until deployed MongoDB connectivity and two-user isolation have been tested.

## Latest focused UI improvement — 2026-11-19

- `src/scripts/workouts.ts` queues unique exercise GIF lookups in workout order after rendering a plan. It waits for each remote image to decode before moving to the next. View GIF shares the same in-flight lookup and displays the preloaded remote URL. No GIF media is downloaded or persisted.
- Run `npm run check` and `npm run build`, then verify in a browser after deployment.


## User-owned exercise demos — 2026-11-25

- New API: `src/pages/api/exercise-gifs.ts` (GET list/file, POST URL/upload, DELETE by exercise).
- New UI: custom demo controls beside every two-week routine exercise in `src/scripts/two-week-routine.ts`.
- MongoDB collection: `exercise_gifs`; unique per `userId + exerciseKey`.
- Pasted HTTPS image/GIF URLs store URL metadata only; user uploads store BSON binary (GIF/PNG/JPEG/WEBP, max 4 MB).
- Every operation is authenticated and owner-scoped. Custom demos take precedence over ExerciseDB for that account.
- ExerciseDB media remains temporary/provider-hosted; never persist provider media.
- Required verification: type-check/build, signed-in URL and file save, refresh persistence, delete/fallback, invalid upload/URL rejection, and two-user isolation.
- Production blocker remains: Vercel Production MONGODB_URI is documented as missing. Configure it securely before expecting production saves to work.
- Current work is not build-tested or production-verified until checks are actually run.


## Dumbbell-only routine and timer — 2026-11-25

- Replaced Week 2 Friday's band-based Pallof press with Dumbbell plank drag and movement-specific form cues. The cue-coverage guard remains active.
- Workout Builder no longer offers a bands-and-dumbbells choice. Default home equipment is dumbbells and bodyweight; the AI prompt avoids resistance-band exercises.
- Home and Workout Builder top bars and navigation drawers link to `/timer`.
- `/timer` is a standalone client-side tool: countdown with editable duration/presets, stopwatch with lap splits, and configurable work/rest intervals with rounds and presets. Optional sound; no account/API/database required.
- Changed files include the routine, builder, AI prompt, home, new timer page/script, AGENTS.md and project docs.
- Source-level routine validation passed. No local install, type-check, production build or browser test was run as part of the GitHub-only edit; check Vercel after the single push.
- Existing production MongoDB blocker remains: account/custom-demo persistence requires the authorized `MONGODB_URI`; timer functionality does not depend on MongoDB.

## Instagram-inspired interface — 2026-11-27

- Read `AGENTS.md` sections "Interface contracts — do not break" and "Interface system" before editing any page.
- Styling lives only in `src/styles/app.css`; every page renders `src/components/AppChrome.astro` with `active="home" | "builder" | "timer"`.
- Home: profile header → day stories (`[data-story-day]` drives `#routine-day`) → routine feed rendered by `src/scripts/two-week-routine.ts`.
- Builder and timer keep every original element ID; only the surrounding design changed.
- `src/scripts/account.ts` mounts into `[data-account-slot]`. Account logic is unchanged from before the redesign: `/api/auth/me`, links or e-mail plus Log out, `location.reload()` after logout.
- Deleted as dead code: `api/estimate.ts`, `api/food-image.ts`, `api/provider-status.ts`, `lib/nutrition-research.ts`, `styles/global.css`, `scripts/navigation.ts`.
- Checks run: `npm run check` and `npm run build` both pass; all five pages return HTTP 200 from the dev server. No visual/browser review was done, so treat the look as unverified until someone opens it at 375px and ≥1280px in light and dark.
- Next: visual review, then dependency/lockfile repair (`npm ci` fails on `ajv` drift), then the standing `MONGODB_URI` production blocker.

## Firecrawl GIF search update — 2026-11-27

- Latest implementation commits are on main; verify current HEAD before further work.
- /api/exercises calls Firecrawl v2 image search first and falls back to ExerciseDB if the request fails or no strict title-matched direct GIF URL is returned.
- The API requires HTTPS direct GIF URLs and all normalised exercise-name tokens in the image title. The two UI scripts randomly select among equally ranked candidates and display source attribution/link when available.
- FIRECRAWL_API_KEY is optional, configured only as a server environment variable for higher limits. It is documented in .env.example and README.
- Third-party GIFs are still loaded directly from their source hosts. No media binaries or provider metadata are persisted; server/page caches are temporary.
- Checks not yet run: npm run check, npm run build, 375px/desktop browser review, light/dark review, console check, and deployed Firecrawl endpoint smoke test.
- Deployment is not yet verified. Confirm Vercel deployment status and add FIRECRAWL_API_KEY to Vercel only if a higher Firecrawl rate limit is needed.
- Licensing blocker: image search source attribution does not grant reuse permission. Review each source's licence and hotlink terms before commercial distribution.

## Production verification update — 2026-11-27

- Latest code commit: 23df5be09dbe254305350c287e38a8bed75a9bf1 (external GIF/source URL validation).
- Production deployment: READY — https://cal-kie.vercel.app/ (Vercel deployment dpl_2yzc8i2GmwKqW7SnHL46zH2UWn4j).
- Vercel npm run build completed successfully.
- Smoke tests passed: Home and /workout-builder return HTTP 200; API queries for dumbbell lateral raise, push-ups and face pulls return HTTP 200 and Firecrawl results; short invalid query returns HTTP 400.
- Firecrawl worked without FIRECRAWL_API_KEY in this test; add a server-side key only if needed for higher limits.
- Still pending: npm run check, visual browser testing at mobile/desktop sizes and light/dark themes, image load checks across providers, and licence/hotlink review for each source. Do not claim full visual QA or commercial media clearance.
