# Phase 3 — Exercise Demonstrations

## Scope
Search for exercise demonstrations only when requested and display remote ExerciseDB GIFs.

## Implementation evidence
- src/pages/api/exercises.ts queries ExerciseDB at runtime.
- Returned GIF URLs are filtered to https://static.exercisedb.dev/media/.
- Search-result metadata is cached in bounded server memory and page memory for 55 minutes only.
- Successful search responses use private browser caching for no more than one hour; refresh requests bypass the app cache.
- The browser displays remote GIF URLs and visible ExerciseDB by AscendAPI attribution; GIF binaries are never downloaded or persisted.
- Choosing an alternative updates the current page/session only; no MongoDB or browser-storage write occurs.
- The previous MongoDB `exercise_media` metadata cache and POST persistence endpoint have been removed.

## Status
**Live endpoint and browser display verified. Commercial licensing remains a release constraint.**

## Acceptance checks
- [x] Valid exercise search works locally and in production (HTTP 200).
- [x] Invalid short search returns HTTP 400.
- [x] GIF URL is restricted to the approved ExerciseDB media host.
- [x] GIF renders remotely in the browser.
- [x] AscendAPI attribution is visible for ExerciseDB V1.
- [x] No GIF files or API-derived exercise metadata are persistently stored by Cal-Kie.
- [x] Server and page caches expire within 55 minutes; browser HTTP cache is capped at one hour.
- [x] Alternative selection is session-only and does not write to MongoDB or browser storage.
- [ ] Confirm current licence permits the intended distribution/commercial use.

## Evidence log
2026-11-19: local and production searches for push up returned valid ExerciseDB results. Browser loaded a remote GIF from the allowed host and displayed ExerciseDB by AscendAPI attribution. Official free V1 terms allow non-commercial use only and require AscendAPI credit; commercial/SaaS/monetised use requires a paid RapidAPI plan.

## Sequential preload update — 2026-11-19

- `src/scripts/workouts.ts` queues unique exercise GIF lookups in workout order after a plan renders.
- It waits for each remote image to decode before starting the next lookup.
- View GIF reuses the same in-flight lookup/cache, avoiding duplicate requests.
- GIFs remain remote and are not downloaded or persisted.
- Automated build and browser verification are pending.


## Cache compliance update — 2026-11-25

The free ExerciseDB API's temporary-cache restriction is handled by short-lived, non-persistent caches only. Server cache entries expire after 55 minutes and are bounded to 200 searches. The browser's page-memory cache also expires after 55 minutes, while API search responses are privately cacheable for at most one hour. The application does not store the GIF binary, search metadata, or replacement choice in MongoDB, localStorage, IndexedDB, Cache Storage, or a service worker. The GIF itself continues to load directly from the provider's media host.

## Firecrawl image-search update — 2026-11-27

- Scope now includes Firecrawl image search as the preferred GIF discovery source, with ExerciseDB fallback.
- Firecrawl search uses POST https://api.firecrawl.dev/v2/search with sources: ["images"], a GIF-focused query and a bounded result count.
- The API accepts only direct HTTPS .gif URLs and requires every normalised requested exercise-name token to appear in the image result title. The UI randomly selects among equally relevant candidates.
- Source attribution and source-page links are displayed where available. ExerciseDB by AscendAPI attribution remains visible for fallback results.
- FIRECRAWL_API_KEY is optional for higher limits and is server-side only.
- Server cache remains bounded to 200 queries and 55 minutes; the browser page cache is temporary. GIF bytes are not downloaded, proxied or persisted.
- Live Firecrawl image-search tool test returned direct GIF URLs and source pages for dumbbell lateral raise. The app endpoint, type-check, build, browser display and production deployment have not yet been verified.
- Image search does not grant copyright or hotlink permission. Confirm each selected source's licence before commercial distribution.
