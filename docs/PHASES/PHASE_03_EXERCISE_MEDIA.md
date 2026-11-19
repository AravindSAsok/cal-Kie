# Phase 3 — Exercise Demonstrations

## Scope
Search for exercise demonstrations only when requested and display remote ExerciseDB GIFs.

## Implementation evidence
- src/pages/api/exercises.ts queries ExerciseDB at runtime.
- Returned GIF URLs are filtered to https://static.exercisedb.dev/media/.
- Responses use Cache-Control: no-store.
- The browser displays remote GIF URLs and visible ExerciseDB by AscendAPI attribution; no download or media persistence was observed.

## Status
**Live endpoint and browser display verified. Commercial licensing remains a release constraint.**

## Acceptance checks
- [x] Valid exercise search works locally and in production (HTTP 200).
- [x] Invalid short search returns HTTP 400.
- [x] GIF URL is restricted to the approved ExerciseDB media host.
- [x] GIF renders remotely in the browser.
- [x] AscendAPI attribution is visible for ExerciseDB V1.
- [x] No GIF files are downloaded or persisted by Cal-Kie.
- [ ] Confirm current licence permits the intended distribution/commercial use.

## Evidence log
2026-11-19: local and production searches for push up returned valid ExerciseDB results. Browser loaded a remote GIF from the allowed host and displayed ExerciseDB by AscendAPI attribution. Official free V1 terms allow non-commercial use only and require AscendAPI credit; commercial/SaaS/monetised use requires a paid RapidAPI plan.

## Sequential preload update — 2026-11-19

- `src/scripts/workouts.ts` queues unique exercise GIF lookups in workout order after a plan renders.
- It waits for each remote image to decode before starting the next lookup.
- View GIF reuses the same in-flight lookup/cache, avoiding duplicate requests.
- GIFs remain remote and are not downloaded or persisted.
- Automated build and browser verification are pending.
