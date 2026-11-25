# Phase 4 — User-owned exercise demonstrations

## Goal
Allow a signed-in Cal-Kie user to supply a missing exercise demonstration by pasting a public HTTPS image/GIF URL or uploading an image/GIF file, then reuse it for that user's matching exercise.

## Implementation
- API: `src/pages/api/exercise-gifs.ts`.
- UI: custom URL/upload controls beside each exercise in `src/scripts/two-week-routine.ts`.
- Persistence: MongoDB `exercise_gifs`, one record per authenticated user and normalized exercise name.
- URL records store only the user's HTTPS URL and metadata.
- Uploaded GIF/PNG/JPEG/WEBP bytes are stored as BSON binary in MongoDB; maximum upload is 4 MB.
- Reads, writes, replacement, file delivery and deletion are scoped to the authenticated user ID.
- Uploaded files are delivered through the owner-checked API, not a public static folder.
- A user's custom demo takes precedence over ExerciseDB. Removing it restores ExerciseDB lookup.
- ExerciseDB media remains separate, temporary, provider-hosted and never persisted.

## Security and validation
- Existing MongoDB-backed HttpOnly session required.
- HTTPS URL only; reject credentials, localhost/local hosts, IP literals and ExerciseDB domains.
- Pasted URLs are never fetched by the server; the browser loads the supplied URL.
- Upload MIME type and file signature must both match GIF, PNG, JPEG or WEBP.
- Reject SVG and all other file types.
- Authenticated API responses use no-store; uploaded responses include nosniff.
- Each user can access only their own custom demos.

## Acceptance checks
- [ ] Signed-in user can save a public HTTPS image/GIF URL.
- [ ] Signed-in user can upload a valid GIF/image up to 4 MB.
- [ ] URL and upload demos persist and load after refresh for the same account.
- [ ] Custom demo overrides ExerciseDB only for its owner.
- [ ] Replace URL with file and file with URL without stale binary/URL fields.
- [ ] Remove custom demo and verify ExerciseDB fallback.
- [ ] Unauthenticated access is rejected.
- [ ] Two-user isolation verified for list, read, replace and delete.
- [ ] Invalid URL, ExerciseDB URL, SVG, spoofed MIME and oversized file are rejected.
- [ ] npm run check and npm run build pass.
- [ ] Production MongoDB connectivity verified.

## Environment blocker
Project handoff records say the Cal-Kie Vercel Production environment is missing `MONGODB_URI`. Until the authorized Atlas URI is configured in Vercel's secure environment settings and the app is redeployed, production custom-demo persistence cannot succeed.

## Licensing boundary
ExerciseDB V1 media and API-derived metadata must never be permanently stored. User-supplied content is a distinct, user-directed feature; never copy an ExerciseDB GIF into the custom collection.
