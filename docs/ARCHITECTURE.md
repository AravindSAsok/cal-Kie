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

ExerciseDB is queried when a demonstration or alternative is requested. Search results are held only in bounded server-process memory and the active browser page for less than one hour; API responses use private browser caching with a one-hour maximum. ExerciseDB GIF binaries are never downloaded, proxied, or persisted by Cal-Kie. The browser displays the provider's remote GIF URL and retains visible attribution. Choosing an alternative changes the current page/session selection only; it is not saved to MongoDB or browser storage.

## Environment

- MONGODB_URI — required for accounts and cloud workout persistence.
- MONGODB_DB_NAME — optional, defaults to hulksar.
- OPENROUTER_API_KEY, GROQ_API_KEY, GEMINI_API_KEY — optional AI providers.
- Provider model variables are optional.

Never use public prefixes for secrets.

## Exercise media cache compliance — 2026-11-25

- Removed the MongoDB `exercise_media` collection read/write path.
- Server search-result cache is in-memory only, bounded to 200 queries, and expires after 55 minutes.
- Browser page cache also expires after 55 minutes; it is not written to localStorage, IndexedDB, Cache Storage, or a service worker.
- Successful search responses allow private browser caching for at most one hour; refresh requests bypass the in-app cache.
- Alternative GIF selection applies to the current page/session only. No API-derived media or metadata is persistently stored.
- Actual GIF bytes continue to load from the provider's remote media host; Cal-Kie does not proxy or persist them.

## Sequential exercise media preload — 2026-11-19

Exercise GIFs are queued after a workout renders and processed one at a time in day/exercise order. Each remote image is decoded before the next lookup starts. A View GIF click reuses the same in-flight lookup/cache. Media remains remote and is not downloaded or stored; visible AscendAPI attribution is retained.

## Firecrawl image discovery — 2026-11-27

- /api/exercises calls Firecrawl v2 Search with the images source and a GIF-focused query. It accepts only direct HTTPS .gif image URLs and requires every normalised exercise-name token to appear in the image result title.
- Firecrawl search failure or no acceptable match falls back to the existing ExerciseDB search. ExerciseDB's allowed media host remains enforced.
- Server result cache is bounded to 200 queries and 55 minutes. Browser page caches remain temporary; GIF bytes are loaded directly by the browser and are never proxied or persisted.
- UI matching randomly chooses among equally relevant candidates and displays provider/source links where available.
- FIRECRAWL_API_KEY is optional, server-side only, and must never be exposed to browser code.
- Search results are third-party assets: source links do not grant reuse rights. Verify each asset's licence and hotlink terms before commercial use.
