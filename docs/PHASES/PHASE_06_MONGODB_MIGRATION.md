# Phase 6 — MongoDB-only architecture migration

## Objective

Remove the legacy database/auth integration and make MongoDB Atlas the only persistence and account backend.

## Evidence and implementation

- Existing Atlas database hulksar was inspected read-only.
- Existing users records have 32-character hex salts and 128-character hex hashes; these match the Node.js scrypt account implementation.
- Existing auth_sessions documents use SHA-256 token hashes, userId and expiry timestamps.
- Added MongoDB connection, auth routes and per-user workout-plan persistence.
- No MongoDB records were modified during this source migration.
- Removed legacy database SDK references, unused copied application modules and old SQL migration files.
- Cal-Kie Vercel Production has MONGODB_DB_NAME=hulksar; MONGODB_URI is still missing.

## Local verification

- [x] Clean npm ci using Node 22.23.4.
- [x] npm audit: 0 vulnerabilities.
- [x] npm run check: 0 errors, 0 warnings, 0 hints.
- [x] npm run build succeeds.
- [x] Local homepage HTTP 200.
- [x] Current-session endpoint returns user:null without a session.
- [x] Signup returns expected HTTP 503 when MongoDB URI is absent.
- [x] Workout load returns HTTP 401 without a session.

## Exit criteria

- [x] MongoDB connection and auth code added.
- [x] Workout plan API uses MongoDB and authenticated user scoping.
- [x] Browser persistence uses the MongoDB API with local fallback.
- [x] Legacy database SDK and migration files removed.
- [ ] MONGODB_URI configured in Cal-Kie Production.
- [ ] Production signup/login and plan save/load tested.
- [ ] Two-user isolation verified.
- [ ] One commit pushed to main and deployment verified.
