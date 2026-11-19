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
- ExerciseDB GIFs are fetched on demand and displayed remotely. Do not download, upload, persist or mirror media. Credit AscendAPI visibly and respect its licence.

## Development workflow

1. Define the smallest task and acceptance criteria.
2. Read the exact files and callers before editing.
3. Make focused changes; avoid unrelated rewrites.
4. Run npm run check, npm run build and relevant tests.
5. Record only checks actually run and observed results.
6. Update project status, roadmap, changelog, phase evidence and handoff after meaningful work.
7. Never claim a database operation, test, push or deployment succeeded unless verified.

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

## Required handoff

State current phase, latest commit, what changed, checks/results, blockers, exact next task, relevant files and approvals needed. Distinguish implemented, tested, deployed and production-ready.
