# Cal-Kie — Project Status

_Last updated: 2026-11-25 after dumbbell-only routine and timer screen update._

## At a glance

- Product: Cal-Kie — personalised AI workout-week planner.
- Repository: https://github.com/AravindSAsok/cal-Kie
- Branch: main
- Local clone: D:/AI-Projects/cal-Kie
- Architecture: MongoDB Atlas only; database name hulksar.
- Hosting: Vercel project cal-kie, production URL https://cal-kie.vercel.app/.
- Current phase: MongoDB-only source migration implemented and locally verified; production database connectivity remains pending.

## Implemented

- Astro 7 + TypeScript planner UI and seven-day AI generation endpoint.
- OpenRouter, Groq and Gemini server-side provider support.
- Session length, exercise count, training days, goal, level and equipment preferences.
- Day/week regeneration and inline editing.
- ExerciseDB on-demand lookup, remote GIF display and attribution.
- User-owned exercise demos: paste HTTPS image/GIF URL or upload GIF/PNG/JPG/WEBP (up to 4 MB), saved per account in MongoDB and preferred over ExerciseDB.
- MongoDB connection module using MONGODB_URI and MONGODB_DB_NAME (defaults to hulksar).
- Compatible scrypt password hashing and hashed opaque session cookie authentication.
- MongoDB-backed signup, login, logout and current-session endpoints.
- Per-user workout-plan GET/PUT/DELETE endpoints and indexes.
- Local browser plan cache with MongoDB cloud persistence for signed-in users.
- Legacy database SDK, unused copied application modules and old SQL migration files removed.

## Verification evidence

| Check | Result |
|---|---|
| Runtime | Node.js v22.23.4 |
| Clean install | npm ci --package-lock=true succeeded; 369 packages audited |
| Dependency audit | npm audit: 0 vulnerabilities |
| Astro/TypeScript | npm run check: 0 errors, 0 warnings, 0 hints |
| Production build | npm run build succeeded with Astro 7.4.13 and Vercel adapter 11.0.22 |
| Local homepage | HTTP 200; account and workout UI markers present |
| Current-session API | HTTP 200 with user:null when no session cookie is present |
| Signup without MongoDB URI | HTTP 503, expected because local MONGODB_URI is not configured |
| Workout load without session | HTTP 401, expected |
| MongoDB schema inspection | Existing users/auth_sessions formats and indexes verified read-only; no records modified |
| Production MongoDB auth/save | Not yet tested; Cal-Kie production MONGODB_URI is missing |
| Production deployment | Not yet pushed/deployed for this migration |

## Latest UI update — 2026-11-25

- Added a right-side burger navigation drawer on home and workout-builder screens.
- Moved the existing AI workout preferences form and seven-day editable plan calendar to /workout-builder without changing workout APIs or persistence behavior.
- Home retains the two-week training routine and links to the dedicated builder.
- No local checkout/build was used; verify GitHub Actions and Vercel deployment before claiming release checks passed.

## Known blockers

- Cal-Kie Vercel Production now has MONGODB_DB_NAME=hulksar, but MONGODB_URI is not configured. Account and cloud-save endpoints will return service unavailable until the existing authorised Atlas URI is added through Vercel's secure environment settings.
- Password reset email delivery is not configured for the MongoDB account flow. The UI reports this limitation rather than claiming an email was sent.
- Groq/Gemini fallback requires configured provider keys for live testing.
- ExerciseDB V1 free terms are non-commercial; obtain the appropriate licence before commercial/monetised use.

## Next priority

Review the full diff and confirm no secrets or unrelated files are staged. Commit once on main and push once. Monitor Vercel. Then add the authorised MONGODB_URI to Cal-Kie Production and verify signup/login, workout save/load and two-user isolation. Never expose or commit the URI.

## Latest UI improvement — 2026-11-19

Sequential ExerciseDB GIF preloading is implemented in `src/scripts/workouts.ts`: unique exercises are queued in workout order, each image is decoded before the next lookup, and View GIF shares the same request. GIFs remain remote and are not persisted. Build and browser verification are pending.


## User-owned exercise demos — 2026-11-25

- Added a per-exercise custom demo control to the two-week routine.
- Signed-in users can save a public HTTPS image/GIF URL or upload GIF/PNG/JPG/WEBP up to 4 MB.
- Custom media is stored in MongoDB collection exercise_gifs, scoped to userId and normalized exercise name. Uploaded bytes are BSON binary; pasted links store only the URL.
- Custom demos override ExerciseDB only for their owner. Removing a custom demo restores ExerciseDB lookup.
- ExerciseDB API-derived media remains temporary and is never copied into persistent storage.
- Production persistence depends on configuring the currently missing MONGODB_URI in Vercel.
- Build/type-check and live database behavior must be verified after the one-push release; do not mark acceptance checks complete without evidence.


## Dumbbell-only routine and timer — 2026-11-25

- Replaced the only band-named movement in the hardcoded 14-day routine (Pallof press) with Dumbbell plank drag and added specific form cues.
- Removed the bands-and-dumbbells equipment choice from Workout Builder; the default home-equipment option is now dumbbells and bodyweight.
- Tightened the AI workout prompt to avoid resistance-band prescriptions and prefer dumbbell/bodyweight alternatives.
- Added a Timer shortcut to the top bar and navigation drawer on Home and Workout Builder.
- Added `/timer` with countdown presets, stopwatch laps, and configurable work/rest interval rounds. Timer runs client-side, requires no sign-in or database, and uses deadline-based updates plus optional completion sounds.
- Source-level validation passed for all 14 hardcoded routine days: no band-named exercise remains and every exercise has matching form cues. Type-check/build and browser behavior are pending post-push verification.
