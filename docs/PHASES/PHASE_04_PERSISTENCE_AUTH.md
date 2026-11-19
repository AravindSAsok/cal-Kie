# Phase 4 — MongoDB persistence and authentication

## Scope

MongoDB Atlas is the only database. The existing hulksar database contains users and auth_sessions collections. Cal-Kie uses the same account record format and stores workout plans in its own workout_plans collection.

## Implemented

- MongoClient singleton using server-only MONGODB_URI.
- MONGODB_DB_NAME defaults to hulksar.
- Scrypt password hashing with random salt and timing-safe verification.
- Opaque random session tokens; only SHA-256 hashes are stored.
- HttpOnly, SameSite=Lax session cookie; Secure on HTTPS.
- Signup, login, logout and current-session endpoints.
- Authenticated workout-plan GET/PUT/DELETE endpoints.
- Unique userId + weekStart index and latest-plan index.
- Local browser cache remains available for offline use and signed-out planning.

## Not yet verified

- Production Cal-Kie MongoDB connection.
- Signup/login/logout against the deployed Cal-Kie origin.
- Two-user isolation for workout plans.
- Password recovery email delivery (not configured).

## Safety

Do not drop collections or modify existing user documents. Every workout plan operation must filter by the authenticated userId. Keep the connection URI server-side and out of Git.
