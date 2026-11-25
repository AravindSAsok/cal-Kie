# Cal-Kie Agent Instructions

This is the mandatory entry point for every human or AI agent working in this repository.

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

- Work directly on main for user-authorised release batches.
- Complete implementation, docs and available verification before committing.
- Do not create intermediate commits or pushes during a release batch.
- Review the full diff and exclude .env, credentials, user data, generated files and unrelated changes.
- Create one comprehensive commit and push once to origin/main.
- Never force-push or overwrite unrelated work. Reconcile if remote main advances.
- Monitor the Vercel deployment after pushing. If it fails, fix locally and make at most one corrective commit/push.

## Source map

- Main UI: src/pages/index.astro
- Account UI: src/scripts/account.ts
- Workout interactions: src/scripts/workouts.ts
- MongoDB connection: src/lib/mongodb.ts
- MongoDB authentication: src/lib/auth.ts
- Workout persistence client: src/lib/workout-store.ts
- Account endpoints: src/pages/api/auth/
- Workout generation and persistence: src/pages/api/workout-plan.ts
- Exercise lookup: src/pages/api/exercises.ts
- User-owned exercise demos (URL/upload/read/delete): src/pages/api/exercise-gifs.ts
- Two-week routine custom demo controls: src/scripts/two-week-routine.ts

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
8. UI order: a user's saved custom demo first; otherwise use the existing strict ExerciseDB name match. Never fall back to an unrelated first ExerciseDB result. Removing a custom demo clears the session cache so ExerciseDB lookup can run again.
9. Provide both URL and upload controls beside every two-week routine exercise. Show save/remove errors honestly; never show success until the API confirms the write.
10. Update the phase record, project status, handoff and changelog. Run type-check/build when an environment is available; otherwise explicitly mark them unverified.
11. One user-authorized release batch means one commit and one push to main after reviewing all changed files. Do not push intermediate changes.
