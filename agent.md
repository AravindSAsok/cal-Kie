# Cal-Kie Agent Guide

Canonical instructions: read AGENTS.md and the current project records in docs/ before changing code.

## Product scope

Cal-Kie is a focused AI workout planner:
- AI-generated seven-day workout plans.
- User-selected session duration, exercise count, training days, goal, experience and equipment.
- Exercise sets, reps, rest, duration and form guidance.
- Individual-day and full-week regeneration.
- Inline workout editing and on-demand remote GIF demonstrations.
- MongoDB-backed account and workout-plan persistence, with local browser fallback.

Do not add unrelated features, analytics, social feeds, payments or nutrition tracking without explicit approval.

## Architecture

- Astro 7 + TypeScript, Node.js >=22.23.4 <23.
- Vercel adapter for deployment.
- MongoDB Atlas only, using server-side MONGODB_URI and optional MONGODB_DB_NAME (defaults to hulksar).
- Accounts use the existing MongoDB users collection and scrypt password hashes.
- Sessions use auth_sessions, SHA-256 token hashes and HttpOnly cookies.
- Workout plans use workout_plans, scoped by authenticated userId.
- AI provider keys remain server-side: OpenRouter, Groq and Gemini.
- ExerciseDB is queried on demand; GIFs remain remote and are not stored.

Do not add SQL, a hosted auth provider or another database.

## Security and data rules

- Authenticate server routes with the MongoDB session cookie.
- Scope every user-owned read/write/delete to the authenticated userId.
- Never send database credentials, AI keys, password hashes or session tokens to the client.
- Use scrypt and timing-safe password verification.
- Persist only hashed session tokens; set HttpOnly, SameSite=Lax and Secure on HTTPS.
- Do not drop collections or rewrite existing user records.
- Create only additive indexes/collections.
- Preserve local plan copies when MongoDB is unavailable; explain when cloud sync is not available.

## AI and workout rules

- Validate and bound all input on the server.
- Respect session duration, exercise count, training days, goal, level, equipment and user focus.
- Return exactly seven days and the requested number of active days/exercises.
- Use sensible sets, reps and rest, especially for beginners.
- Preserve user edits unless they explicitly regenerate a day/week.
- Do not present workouts as medical advice.

## Exercise media

- Fetch GIF references only when requested.
- Display remote URLs; do not download, upload, mirror or persist media.
- Keep the allowed ExerciseDB media host restriction.
- Credit AscendAPI visibly. Confirm current licensing before commercial or monetised use.

## Verification

Before release run npm ci, npm audit, npm run check and npm run build using Node 22.23.4. Also test signup/login/logout, session isolation, plan save/load, missing MongoDB configuration, AI generation, day/week regeneration, edits, exercise search, mobile layout and browser console errors. Report what actually ran.
