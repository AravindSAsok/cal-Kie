# Cal-Kie Architecture

## Runtime

- Astro 7 + TypeScript.
- Vercel Node runtime, Node 22.
- Browser UI calls same-origin Astro API routes.
- Secrets remain in server environment variables.

## Data store

MongoDB Atlas is the only database. The default database name is hulksar; override with MONGODB_DB_NAME. The URI is read only from server-side MONGODB_URI.

A cached MongoClient promise is reused across warm serverless invocations. The app creates indexes idempotently and never runs destructive migrations.

### Collections

| Collection | Purpose | Ownership |
|---|---|---|
| users | Account id, name, email, scrypt salt/hash, timestamps | Unique email |
| auth_sessions | SHA-256 token hash, userId, createdAt, expiresAt | One user's sessions |
| workout_plans | weekStart, title, plan_data, updatedAt, userId | Every query scoped to userId |

Indexes:
- users.email unique.
- auth_sessions.tokenHash unique; expiresAt TTL; userId lookup.
- workout_plans(userId, weekStart) unique; workout_plans(userId, updatedAt) for latest plan.

## Authentication

- Signup validates name/email/password and stores a scrypt password hash with a random salt.
- Login verifies the hash using timing-safe comparison.
- Session tokens are random opaque values. Only SHA-256 hashes are stored in MongoDB.
- The browser receives an HttpOnly, SameSite=Lax cookie, Secure on HTTPS.
- Logout deletes the matching session record and expires the cookie.
- API routes resolve the session and then scope every user-owned operation to the authenticated user's id.
- Password recovery email delivery is not yet configured; the UI reports this limitation rather than pretending to send email.

## Workout plan persistence

- The browser retains a local copy for offline continuity.
- Signed-in users load/save the latest plan through /api/workout-plan.
- The MongoDB record is unique per userId + weekStart.
- AI generation remains a separate POST operation; saving an edited plan uses PUT.
- A failed cloud save leaves the local copy intact and reports the sync error.

## AI providers

OpenRouter, Groq and Gemini are called server-side. Provider keys are never exposed to browser code. The generation endpoint validates preferences, enforces seven days, requested active days and requested exercise count, and bounds generated fields.

## Exercise media

ExerciseDB is queried only when a demonstration is requested. Remote GIF URLs are displayed directly; media is not downloaded or stored. Visible attribution is required and licensing must be checked before commercial use.

## Environment

- MONGODB_URI — required for accounts and cloud workout persistence.
- MONGODB_DB_NAME — optional, defaults to hulksar.
- OPENROUTER_API_KEY, GROQ_API_KEY, GEMINI_API_KEY — optional AI providers.
- Provider model variables are optional.

Never use public prefixes for secrets.
