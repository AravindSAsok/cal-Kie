# Cal-Kie Agent Instructions

This is the mandatory entry point for every human or AI agent working in this repository.

## Repository at a glance (updated 2026-11-27)

- Repository: github.com/AravindSAsok/cal-Kie · branch `main` · production https://cal-kie.vercel.app/
- Astro 7 + TypeScript. Vercel adapter by default; the standalone Node adapter is used only when `CALKIE_HOST=render` is set at build time. Node 22.23.4.
- Pages: `/` (profile header, day stories, two-week routine feed), `/workout-builder` (AI preferences + editable week), `/timer`, `/signin`, `/signup`.
- API: `/api/auth/*`, `/api/workout-plan` (POST generates, GET/PUT/DELETE persist), `/api/exercises` (provider lookup), `/api/exercise-gifs` (user-owned demos).
- MongoDB collections: `users`, `auth_sessions`, `workout_plans`, `exercise_gifs`. No other datastore, no SQL, no external auth provider.
- Interface: Instagram-inspired visual system (see "Interface system" below). It is a look only — no likes, follows, comments, other users' feeds, DMs or analytics.

## Start every session

1. Read this file.
2. Read docs/PROJECT_STATUS.md, docs/HANDOFF.md, docs/ROADMAP.md, docs/ARCHITECTURE.md and docs/DECISIONS.md.
3. Inspect git status, branch, latest commit and the exact source files involved.
4. Check docs/CHANGELOG.md and the relevant phase record before repeating work.

## Product scope

Cal-Kie is a simple personal AI workout-week planner. Keep the prototype focused. Do not add payments, social features, analytics, nutrition tracking, unrelated product modules or complicated abstractions unless explicitly requested.

## Critical architecture rules

- MongoDB Atlas is the only database. Use the existing MongoDB database hulksar and server-side MONGODB_URI configuration.
- Do not add another database provider, hosted auth provider or SQL migrations.
- Never expose MONGODB_URI, AI provider keys, password hashes, session tokens or reset tokens to browser code.
- Authenticate API requests with the MongoDB-backed HttpOnly session cookie. Every user-owned query and write must include the authenticated userId.
- Passwords use Node.js scrypt with a random salt. Store only passwordSalt and passwordHash; compare hashes with timing-safe comparison.
- Store only SHA-256 hashes of opaque session tokens in auth_sessions; cookies must be HttpOnly, SameSite=Lax and Secure on HTTPS.
- Use additive MongoDB collection/index changes only. Never drop collections or modify/delete user records as part of ordinary app changes.
- Keep a local browser plan copy for offline continuity, but MongoDB is the cloud persistence source of truth for signed-in users.
- ExerciseDB API data and GIFs are provider-owned: fetch on demand, keep only the existing bounded temporary cache (maximum 55 minutes / no more than one hour), display remotely, credit AscendAPI, and NEVER copy ExerciseDB media or metadata into permanent storage.
- Firecrawl image search is the preferred discovery source for third-party exercise GIFs; ExerciseDB remains the fallback. Require every normalised requested exercise token in a result title, return only direct HTTPS GIF URLs, randomise equally relevant candidates, and show the source page link where available. Keep provider results only in bounded temporary memory caches. Never proxy, download or persist third-party GIFs. Attribution does not grant reuse rights; commercial use requires licence review.
- User-supplied exercise demonstrations are separate and may be saved only after authentication. Store one custom demo per authenticated user and normalized exercise name in MongoDB collection exercise_gifs. Every read, replace and delete MUST include the authenticated userId; never expose another user's demo.
- Custom demos support a public HTTPS image/GIF URL or a user-uploaded GIF/PNG/JPG/WEBP file. Never fetch a pasted URL from the server. Reject non-HTTPS URLs, credentials in URLs, localhost, local hostnames, IP-literal hosts and ExerciseDB hosts. Upload limit is 4 MB (to stay below serverless request-body limits); validate MIME type AND file signature. Do not accept SVG, HTML or arbitrary files.
- Store uploaded bytes in MongoDB as BSON binary, not a public uploads folder, external object store, browser storage or ExerciseDB cache. Store only URL metadata for pasted links. Serve uploaded files through the authenticated owner-checked API with nosniff and private no-store headers.
- Custom user media takes precedence over ExerciseDB for that user and exercise. Removing a custom demo restores the normal ExerciseDB lookup fallback. A user can replace their own demo; other accounts remain isolated.
- Custom demo saves require the existing MongoDB-backed HttpOnly session. If MONGODB_URI is absent, show the real sign-in/database error; never claim a save succeeded. Do not add secrets or a second database provider.

## Development workflow

1. Define the smallest task and acceptance criteria.
2. Read the exact files and callers before editing.
3. Make focused changes; avoid unrelated rewrites.
4. For custom exercise media, verify unauthenticated access is rejected; URL saves require public HTTPS; uploads reject over-4-MB files, SVG and MIME/signature mismatches; user A cannot access user B's media; replacing URL/file clears stale fields; deleting a custom demo restores ExerciseDB fallback; and ExerciseDB media is never persisted.
5. Run npm run check, npm run build and relevant tests.
6. Record only checks actually run and observed results.
7. Update project status, roadmap, changelog, phase evidence and handoff after meaningful work.
8. Never claim a database operation, test, push or deployment succeeded unless verified.

## Git and release rules

- Owner standing instruction: always push to `main`. Never leave a local-only commit, and never ask whether to push — push in the same batch as the commit.
- Work directly on main for user-authorised release batches.
- Complete implementation, docs and available verification before committing.
- Do not create intermediate commits or pushes during a release batch.
- Review the full diff and exclude .env, credentials, user data, generated files and unrelated changes.
- Create one comprehensive commit and push once to origin/main.
- Never force-push or overwrite unrelated work. Reconcile if remote main advances.
- Monitor the Vercel deployment after pushing. If it fails, fix locally and make at most one corrective commit/push.

## Source map

### Server and data
- MongoDB connection: src/lib/mongodb.ts
- MongoDB authentication and session: src/lib/auth.ts, src/lib/server-auth.ts
- Account endpoints: src/pages/api/auth/signup.ts, login.ts, logout.ts, me.ts
- Workout generation and persistence: src/pages/api/workout-plan.ts
- Exercise lookup (provider, temporary cache only): src/pages/api/exercises.ts — retries up to 3 times with backoff because the free provider rate-limits bursts (Cloudflare `error code: 1102`, sometimes as plain text rather than JSON).
- User-owned exercise demos (list/read/URL/upload/delete): src/pages/api/exercise-gifs.ts
- Workout persistence client (cloud first, local cache fallback): src/lib/workout-store.ts
- Legacy TrackCake routes kept for compatibility and unreferenced by the Cal-Kie UI: src/pages/api/estimate.ts, src/pages/api/food-image.ts, src/pages/api/provider-status.ts with src/lib/nutrition-research.ts. Do not delete them during a UI change and do not wire them into new work.

### Interface
- Design system — the single stylesheet: src/styles/app.css
- Shared chrome (left rail, top bar, bottom tab bar, skip link): src/components/AppChrome.astro
- Document shell: src/layouts/Layout.astro
- Home: src/pages/index.astro
- Workout builder: src/pages/workout-builder.astro
- Timer screen: src/pages/timer.astro
- Auth screens: src/pages/signin.astro, src/pages/signup.astro
- Account module and signed-in auth-page state: src/scripts/account.ts
- Two-week routine render and custom demo controls: src/scripts/two-week-routine.ts
- AI week render/edit interactions: src/scripts/workouts.ts
- Timer logic: src/scripts/timer.ts

## Interface contracts — do not break

Page scripts query these IDs directly; renaming or removing one silently breaks the UI. Keep them in the markup even if the design changes.

- Home: `#two-week-routine`, `#routine-week`, `#routine-day`, `#routine-content`, plus `[data-story-day]` buttons that write `#routine-day` and dispatch a `change` event. The home `<script>` block must keep `import "../scripts/two-week-routine"` — `#routine-content` is filled entirely by that script, so dropping the import silently leaves the page with no workouts.
- Builder: `#generator-form`, `#duration`, `#exercise-count`, `#training-days`, `#goal`, `#level`, `#equipment`, `#focus`, `#generate-plan`, `#generator-status`, `#save-plan`, `#regenerate-week`, `#week-grid`, `#week-empty`, `#week-title`, `#week-subtitle`, `#summary-days`, `#summary-sessions`, `#summary-minutes`, `#toast`.
- Timer: every `#countdown-*`, `#stopwatch-*`, `#interval-*`, `#lap-*`, `#timer-sound` control, plus `[data-mode]`, `[data-preset]` and `[data-interval-preset]` buttons.
- Chrome: `[data-account-slot]` is where src/scripts/account.ts mounts the account module. Account logic is unchanged from before the redesign: read `/api/auth/me`, render links or e-mail + Log out, and `location.reload()` after a successful `/api/auth/logout`.
- Classes emitted by scripts and styled in app.css: `.day-card`, `.exercise-card`, `.routine-exercise*`, `.gif-*`, `.demo-*`. If you edit a script template, update app.css in the same change.

## Required handoff

State current phase, latest commit, what changed, checks/results, blockers, exact next task, relevant files and approvals needed. Distinguish implemented, tested, deployed and production-ready.


## Custom exercise demo workflow (mandatory)

1. Read this section and inspect the current auth/session contract before changing custom media.
2. Keep provider media and user media strictly separate. ExerciseDB remains on-demand with temporary caching only; custom user media is explicitly user-provided and stored in exercise_gifs.
3. Require the existing MongoDB-backed session for every custom demo list, upload, URL save, file read and delete. Scope every operation to the authenticated userId.
4. Normalize exercise names consistently so each account has at most one saved custom demo per exercise. Replacing a demo must update the existing per-user/per-exercise record and remove stale fields (binary vs URL).
5. For URL input: accept HTTPS only, reject embedded credentials, local/private destinations, IP literals and ExerciseDB hosts. Do not server-fetch the URL. The browser loads the supplied URL directly.
6. For uploads: accept only GIF, PNG, JPEG and WEBP; maximum 4 MB; verify both declared MIME type and magic bytes. Reject SVG and all other content. Keep uploaded bytes in MongoDB BSON binary, never in a public static folder.
7. Serve uploaded bytes from the API only after authenticating and checking both owner userId and record id. Use the stored MIME type, X-Content-Type-Options: nosniff and private no-store caching.
8. UI order: a user's saved custom demo first; otherwise match ExerciseDB names with `bestMatch` (routine) / `bestExerciseMatch` (builder): compare singularised word sets, require every word of the requested exercise to appear in the candidate (`chest` reads as `bench`), and prefer the candidate with the fewest extra words. Never fall back to an unrelated first ExerciseDB result. Removing a custom demo clears the session cache so ExerciseDB lookup can run again.
9. Provide both URL and upload controls beside every two-week routine exercise. Show save/remove errors honestly; never show success until the API confirms the write.
10. Update the phase record, project status, handoff and changelog. Run type-check/build when an environment is available; otherwise explicitly mark them unverified.
11. One user-authorized release batch means one commit and one push to main after reviewing all changed files. Do not push intermediate changes.


## Equipment and timer rules

- The owner's hardcoded routine is dumbbells plus bodyweight only. Do not add resistance-band exercises or band-dependent movements to `src/scripts/two-week-routine.ts`; use a practical dumbbell/bodyweight substitute and write exercise-specific form cues. Keep the routine's cue-coverage guard intact.
- The workout-builder equipment choices must not offer resistance bands. The default home option is dumbbells and bodyweight. AI generation prompts must not prescribe bands; prefer dumbbell or bodyweight alternatives.
- Every standard page must render `src/components/AppChrome.astro` with the correct `active` key (home | builder | timer) so the rail and tab bar highlight the current section.
- The Timer shortcut on Home and Workout Builder must link to `/timer`. Keep the dedicated timer screen self-contained and usable without authentication or database access.
- Timer screen acceptance: countdown supports editable minutes/seconds, quick presets, start/pause/reset and completion sound; stopwatch supports start/pause/reset and lap splits; interval timer supports configurable rounds/work/rest, presets, phase transitions, progress and reset. Use deadline-based timing so background-tab throttling does not accumulate drift. Sound is optional and must not block timer use.
- Keep timer controls accessible, responsive and keyboard-operable. Do not add server APIs, persistence, tracking or account requirements for the timer unless explicitly requested.

## Interface system (Instagram-inspired)

Design intent: a calm, familiar social-app shell around a serious training tool. Instagram informs the *look* only — hairline borders, 8–14px cards, system type with a script wordmark, gradient avatar rings, blue primary actions, a bottom tab bar on mobile and a left rail on desktop. It must never introduce social mechanics: no likes, follows, comments, other users' feeds, DMs, activity notifications or engagement tracking.

Rules:

1. All styling lives in `src/styles/app.css`. Do not add per-page `<style>` blocks or inline layout styles; they drift and duplicate. (`font`/`display` design decisions belong in the stylesheet.)
2. Use the existing tokens: `--bg`, `--bg-elev`, `--bg-soft`, `--line`, `--text`, `--text-soft`, `--muted`, `--blue`, `--grad`, `--radius`, `--radius-lg`. Light and dark are both supported through `prefers-color-scheme` — check both before shipping.
3. Reuse the primitives instead of inventing parallel ones: `.ig-card`, `.aside-card`, `.ig-btn` / `.ig-btn-primary` / `.ig-btn-text`, `.field`, `.story*`, `.timer-*`, `.toast`, `.section-head`, `.eyebrow`.
4. Every interactive control needs a visible `:focus-visible` state, a label (text or `aria-label`), and at least a 44px touch target on mobile. Async state changes announce through `aria-live`.
5. Motion must respect `prefers-reduced-motion`. Never rely on animation to convey state.
6. Phone layout is the reference: one column, fixed bottom tab bar, no horizontal scrolling except the story row. Content padding must clear the tab bar and the iOS safe area.
7. The routine feed and week feed are single-column on purpose. Do not turn them into dense multi-column grids; that breaks the reading rhythm the redesign is built on.
8. Keep copy plain and honest. Status text reports what the API actually returned; never show a success message before the write is confirmed.

## Known environment notes

- `npm ci` currently fails because `package-lock.json` is out of sync with `package.json` (`ajv@6.15.0` vs `ajv@8.20.0`, `json-schema-traverse`). Use `npm install --no-audit --no-fund --package-lock=false` to install locally without rewriting the lockfile. Only regenerate the lockfile as part of an explicit dependency-maintenance task — never to "fix" a build.
- The app builds without `MONGODB_URI`; account and cloud-save endpoints return 503 and the planner falls back to the local browser copy. Never claim cloud persistence works without a configured database.
- Production Vercel currently has `MONGODB_DB_NAME=hulksar` but no `MONGODB_URI`. This is the standing blocker for accounts in production.

## Definition of done for a UI change

1. `npm run check` passes with 0 errors.
2. `npm run build` succeeds.
3. The changed pages were opened at 375px and at ≥1280px, in light and dark, with the console clean.
4. If a script-emitted class changed, app.css was updated in the same change.
5. Docs updated: this file if a rule changed, plus `docs/CHANGELOG.md` and `docs/PROJECT_STATUS.md`.
