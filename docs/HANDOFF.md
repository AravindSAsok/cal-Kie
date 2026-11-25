# Cal-Kie — Next Agent Handoff

_Last updated: 2026-11-25 after dedicated workout-builder UI update._

## Repository
- Repository: AravindSAsok/cal-Kie
- Branch: main
- Production URL: https://cal-kie.vercel.app/
- Stack: Astro 7 + TypeScript; MongoDB Atlas only.

## Latest UI change
- The home page now focuses on the hero and existing two-week training routine.
- The existing AI workout preferences form and editable seven-day plan calendar live at /workout-builder.
- A right-side burger menu appears on both pages and links to Home and Generate Workout.
- Home also has a direct Generate my workout link.
- src/scripts/workouts.ts remains the existing workout interaction implementation. Its DOM IDs and API behavior were retained.
- New navigation behavior lives in src/scripts/navigation.ts.

## Files changed in this release
- src/pages/index.astro
- src/pages/workout-builder.astro (new)
- src/scripts/navigation.ts (new)
- src/styles/calkie.css
- docs/PROJECT_STATUS.md
- docs/CHANGELOG.md
- docs/HANDOFF.md

## Verification still required
No local checkout or local build was used, in accordance with the user's GitHub-only instruction. Inspect GitHub Actions and Vercel status after the single main-branch commit. Browser smoke-test desktop/mobile navigation, workout generation, editing, day/week regeneration and save/load. Do not claim these checks passed until observed.

## Existing production configuration caveat
The earlier handoff recorded that Cal-Kie Production had MONGODB_DB_NAME=hulksar but no configured MONGODB_URI. Recheck Vercel's current environment before cloud authentication or persistence testing. Never expose or commit secrets.

## Guardrails
- MongoDB Atlas is the only database.
- Keep provider credentials server-side.
- Do not modify account, API, database, or exercise GIF behavior for this UI task.
- Avoid unrelated features and multiple release pushes.
