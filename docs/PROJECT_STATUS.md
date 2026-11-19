# Cal-Kie — Project Status

_Last updated: 2026-11-19 after local, browser, production and Supabase verification._

## At a glance
- **Product:** Cal-Kie — personalised AI workout-week planner.
- **Repository:** https://github.com/AravindSAsok/cal-Kie
- **Branch:** main
- **Latest remote commit before this verification batch:** f0db4f3a77ad1b73f8d1983b2db131dcecb956f7 — MVP verification phase documentation.
- **Release batch:** all verification fixes and documentation are consolidated into one commit on main; resolve its exact SHA with git rev-parse HEAD.
- **Current stage:** MVP implementation substantially verified; cloud authentication and cloud persistence remain blocked by missing application Supabase environment variables.
- **Hosting:** Vercel project cal-kie; existing production deployment for the latest remote commit reports READY.
- **Database:** shared TrackCake Supabase project. The Cal-Kie workout-plans migration is present in live migration history; no SQL was executed in this pass.

## Implemented
- Astro 7 + TypeScript planner UI and seven-day workout plan endpoint.
- OpenRouter, Groq and Gemini server-side provider support.
- User preferences for session length, exercise count, training days, goal, experience, equipment and focus.
- Individual-day and full-week regeneration; inline exercise editing, add/remove and recovery-day controls.
- ExerciseDB on-demand lookup with remote GIF URLs and visible attribution.
- Local browser persistence and optional Supabase persistence.
- Supabase sign-up, login, logout and password-recovery UI/logic.
- Vercel deployment configuration.

## Verification evidence

| Area | Observed evidence | Status |
|---|---|---|
| Runtime | Node.js v22.23.4 used; .nvmrc added and package engine constrained to Node 22.23.4+ | Passed |
| Dependency security | Upgraded Astro to 7.4.13, Vercel adapter to 11.0.22, Node adapter to 11.1.14; patched transitive path-to-regexp to 6.3.0 | Passed |
| Dependency audit | npm audit reported 0 vulnerabilities after the upgrade/override | Passed |
| Astro/TypeScript | npm run check: 0 errors, 0 warnings, 1 existing unused-function hint in src/scripts/app.ts (currentMeal) | Passed |
| Production build | npm run build completed successfully with Astro 7.4.13 and Vercel adapter 11.0.22 | Passed |
| AI generation | One production OpenRouter request returned a seven-day plan with 3 active days, 2 exercises per active day and 30-minute sessions; mocked local provider transport verified Monday default and seven consecutive date keys | Integration tested |
| AI fallback | Groq/Gemini are supported in source but were not configured/tested; local environment has no provider key | Not tested |
| Missing AI config | Local endpoint returned HTTP 503 with a clear setup message | Passed |
| ExerciseDB | Valid search returned HTTP 200 locally and in production; invalid one-character query returned HTTP 400 | Passed |
| GIF display | Browser loaded a remote static.exercisedb.dev/media/ GIF and visible ExerciseDB by AscendAPI attribution | Passed |
| Browser workflows | Playwright smoke passed local save/reload, edits, add/remove, rest-day toggle, mocked week generation, failed day/week regeneration preservation, mobile no-overflow and zero page exceptions | Passed |
| Supabase migration | Live migration history includes calkie_workout_plans; public.workout_plans exists and RLS is enabled | Verified |
| Supabase policies | SELECT/INSERT/UPDATE/DELETE policies scope rows to auth.uid() = user_id; UPDATE includes WITH CHECK | Verified at schema/policy level |
| Supabase cloud save and cross-user RLS | Not exercised through the app because its public Supabase URL and anon key are not configured in Vercel | Blocked |
| Authentication | Signup/login/logout/password recovery not exercised; application Supabase variables are absent | Blocked |
| Existing deployment | Vercel deployment for remote commit f0db4f3 is READY; https://cal-kie.vercel.app/ returned HTTP 200; production ExerciseDB endpoint returned HTTP 200 | Verified for existing deployment |

## Bugs fixed in this verification batch
1. **Timezone-sensitive Monday key:** the previous client code converted local midnight to UTC and could return Sunday for users in positive UTC offsets (confirmed for Asia/Kolkata). It now formats the local calendar date directly.
2. **API week-date fallback:** the server now defaults to the current Monday and uses UTC calendar arithmetic for the seven date values; malformed week-start dates are rejected before calling a provider.
3. **Dependency security:** upgraded the Astro stack and pinned the affected transitive path-to-regexp dependency to patched 6.3.0. A committed lockfile now supports repeatable installs.

## Blockers and remaining risks
1. Vercel currently lists OPENROUTER_API_KEY but not PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY. Do not change production environment variables without explicit approval. Until configured, account controls remain disabled and cloud save/auth cannot be tested.
2. No separate test users were created; cross-user RLS was verified from live policy definitions, not by attempting User A/User B requests.
3. Only OpenRouter was exercised live. Groq/Gemini fallback remains unverified.
4. Official ExerciseDB V1 terms allow non-commercial use only and require AscendAPI attribution; commercial/SaaS/monetised use requires a paid RapidAPI plan. Do not claim commercial readiness without it.
5. The existing READY deployment still points to remote commit f0db4f3; the local verification fixes have not yet been pushed/deployed.

## Next priority
Clean install, dependency audit, Astro check, production build and browser smoke are complete. Review the complete diff for secrets/unrelated changes, confirm remote main is unchanged, create one comprehensive commit on main, push once, and monitor the resulting Vercel deployment. If that deployment fails, fix and verify locally before one corrective commit/push.
