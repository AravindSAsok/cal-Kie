# Cal-Kie — Project Status

_Last updated: 2026-11-19 (documentation baseline created from repository inspection)._

## At a glance
- **Product:** Cal-Kie — personalised AI workout-week planner.
- **Repository:** https://github.com/AravindSAsok/cal-Kie
- **Default branch:** `main`
- **Latest source commit inspected:** `a284a17932c3f7753e2070b09568188a26abbdc2` — “Polish Cal-Kie password recovery navigation” (2026-11-18).
- **Project stage:** MVP prototype; implementation is present, but release-level end-to-end verification is incomplete.
- **Hosting target:** Vercel (deployment status not verified in this documentation pass).
- **Database:** shared TrackCake Supabase project, not a separate Cal-Kie project.

## Implemented in the repository
- Astro 5 + TypeScript application and Cal-Kie branded planner UI.
- Seven-day workout generation endpoint with OpenRouter, Groq and Gemini provider support.
- User controls for session length, exercise count, training days, goal, experience, equipment and optional focus instructions.
- Day/week regeneration and editable workout sessions (per existing project guide and recent commits; re-verify behavior during QA).
- On-demand ExerciseDB search returning approved remote GIF URLs; no media persistence is intended.
- Browser local-storage plan persistence and optional Supabase `workout_plans` persistence.
- Supabase sign-up/login/password recovery UI and flow are present in the repository history.
- Vercel deployment configuration and environment-variable example.

## Verification state — do not overstate
| Area | Current evidence | Status |
|---|---|---|
| Source implementation | Relevant files and latest commits inspected | Present; not a complete functional test |
| TypeScript/Astro check | Not run during this documentation pass | Not verified |
| Production build | Not run during this documentation pass | Not verified |
| AI provider calls | Endpoint inspected; no live provider request made | Not verified end-to-end |
| ExerciseDB GIF lookup | Endpoint inspected; no live request made | Not verified end-to-end |
| Local save/load | Store implementation inspected; browser test not run | Not verified end-to-end |
| Supabase save/load and RLS | Client and migration SQL inspected | Code present; live DB/RLS verification required |
| Supabase migration applied | A prior project session reported it applied; no live migration-history query performed in this pass | Reconfirm before relying on it |
| Authentication | Auth UI/commits exist; full signup/login/recovery test not run | Not verified end-to-end |
| Vercel deployment | Configuration exists; deployment URL/status not checked | Not verified |

## Known constraints and risks
1. The README's migration section currently tells a maintainer to apply the migration. This must be reconciled with the reported prior application and verified migration history before anyone runs it.
2. TrackCake and Cal-Kie share one Supabase project. Any database operation can affect both applications; coordinate and inspect migration history first.
3. ExerciseDB free usage is described in the README as personal/prototype only, with attribution and commercial-use restrictions. Confirm current terms before monetisation.
4. No full browser/mobile/accessibility QA has been evidenced in this status pass.
5. Environment keys must be configured in the deployment environment; no secrets are stored in Git.

## Next priority
Run a controlled MVP verification pass: `npm run check`, `npm run build`, then test AI generation, seven-day constraints, edits/regeneration, missing-key behavior, ExerciseDB lookup, local persistence, Supabase persistence/RLS, auth and mobile layout. Update each result with evidence and the commit tested.
