# Phase 3 — Exercise Demonstrations

## Scope
Search for exercise demonstrations only when requested and display remote ExerciseDB GIFs.

## Implementation evidence
- `src/pages/api/exercises.ts` calls ExerciseDB search at runtime.
- The endpoint filters GIF URLs to `https://static.exercisedb.dev/media/`.
- Responses are configured as no-store.
- README documents attribution and non-commercial restrictions for the free API.

## Status
**Endpoint implemented; live/browser and licensing checks pending.**

## Acceptance checks
- [ ] Search works for valid exercise names.
- [ ] Empty, invalid and upstream-error states are clear.
- [ ] GIF displays from the remote source only.
- [ ] No GIF or GIF URL is downloaded or persisted.
- [ ] ExerciseDB attribution is visible.
- [ ] Current licence permits intended use.

## Evidence log
2026-11-19: endpoint inspected; no live request or licensing review performed.
