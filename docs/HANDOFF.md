# Cal-Kie — Next Agent Handoff

_Last updated: 2026-11-19 after local MongoDB-only migration checks._

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
