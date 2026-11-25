# Cal-Kie — Project Status

_Last updated: 2026-11-25 after workout-builder navigation update._

## At a glance
- Product: Cal-Kie — personalised AI workout-week planner.
- Repository: https://github.com/AravindSAsok/cal-Kie
- Branch: main
- Architecture: Astro 7 + TypeScript; MongoDB Atlas only.
- Hosting: Vercel project cal-kie, production URL https://cal-kie.vercel.app/.
- Current phase: Existing workout generator moved to a dedicated screen; release verification pending.

## Implemented
- Astro 7 + TypeScript planner UI and seven-day AI generation endpoint.
- OpenRouter, Groq and Gemini server-side provider support.
- Session length, exercise count, training days, goal, level and equipment preferences.
- Day/week regeneration and inline editing.
- ExerciseDB on-demand lookup, remote GIF display and attribution.
- MongoDB-backed accounts and per-user workout persistence source code.
- Local browser plan cache with MongoDB cloud persistence for signed-in users.
- Right-side burger navigation drawer on home and workout-builder screens.
- Dedicated /workout-builder route containing the existing preference form, AI generation flow, editable seven-day calendar, save and regeneration controls.
- Home screen retains the existing two-week routine and links to the dedicated workout builder.

## Verification and release status
- Source changes are prepared as one atomic GitHub commit on main.
- No local checkout or local build was used, per the user's GitHub-only instruction.
- GitHub Actions/Vercel checks and production deployment status must be inspected after the commit is pushed.
- Production MongoDB connectivity remains dependent on the existing Vercel MONGODB_URI configuration; do not infer cloud persistence readiness from this UI change.

## Known blockers
- The prior project handoff recorded that Cal-Kie Production did not have MONGODB_URI configured. Recheck Vercel before treating account/cloud save as production-ready.
- ExerciseDB V1 free terms are non-commercial; obtain the appropriate licence before commercial/monetised use.

## Next priority
Verify the single release commit and deployment. Smoke-test /, /workout-builder, menu open/close on mobile and desktop, AI generation, edit/regenerate, and save/load without changing existing API or database behavior.
