# Cal-Kie Work Log

Git commits are the authoritative record of exact source changes.

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
