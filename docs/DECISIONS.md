# Cal-Kie Decision Log

## 2026-11-19 — MongoDB-only application architecture

- Context: The maintainer explicitly confirmed that Cal-Kie must use MongoDB only.
- Decision: MongoDB Atlas is the sole database. Use the existing hulksar database and its users and auth_sessions collections. Store workout plans in a dedicated workout_plans collection.
- Consequence: No external database/auth provider or SQL migration dependency. All user-owned API operations must scope queries by authenticated userId. Database credentials remain server-side.

## 2026-11-19 — MongoDB authentication compatibility

- Context: The existing MongoDB account records use 32-character hex salts and 128-character hex hashes.
- Decision: Reuse the established Node.js scrypt format, timing-safe comparison, SHA-256 session-token hashes and HttpOnly cookie sessions.
- Consequence: Existing MongoDB users remain compatible; do not rewrite password records or session records.

## 2026-11-19 — Local workout cache

- Context: Workout editing should remain usable when a network or database connection is unavailable.
- Decision: Keep a browser-local copy while MongoDB remains the signed-in cloud source of truth.
- Consequence: Failed cloud sync must not discard the local plan.

## 2026-11-19 — One-commit release batches

- Context: Each push to main triggers a Vercel build.
- Decision: Complete implementation, docs and available verification before one comprehensive commit/push. A corrective push is allowed only if the resulting deployment fails.
- Consequence: Never force-push or overwrite unrelated work.

## Existing product decisions

- Keep Astro + TypeScript and avoid framework migration for the MVP.
- Keep AI provider credentials server-side.
- Generate seven-day plans that respect user preferences and recovery.
- Fetch remote exercise GIFs only on demand; do not persist media.
- Keep the MVP focused on workout planning, editing, regeneration and persistence.

## 2026-11-27 — Firecrawl-first exercise GIF discovery

- Context: ExerciseDB fuzzy search and provider throttling caused incorrect or missing exercise demonstrations.
- Decision: Use Firecrawl image search first for direct GIF assets, require strict exercise-token coverage in the result title, and fall back to ExerciseDB when Firecrawl has no usable result or is unavailable. Randomly choose among equally relevant results.
- Consequence: Source attribution and source-page links are shown when available. Third-party media remains remote and temporary search metadata is cached in memory only. Attribution is not a licence; each source's reuse and hotlink terms must be reviewed.
