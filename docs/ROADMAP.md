# Cal-Kie Roadmap

This roadmap tracks the MVP first. Do not expand scope until the current milestone is verified.

## Phase 0 — Project baseline and agent continuity
- [x] Confirm repository, default branch and current source head.
- [x] Inspect README, agent guide, package manifest, key UI/API/store files and migration SQL.
- [x] Add canonical agent instructions and durable project status/handoff documentation.
- [ ] Reconcile all existing documentation against live deployment and database evidence.

## Phase 1 — Core planner experience
- [x] Astro application and Cal-Kie branding exist.
- [x] Planner inputs for duration, exercise count, days, goal, level, equipment and focus exist.
- [x] Seven-day AI plan endpoint exists.
- [ ] Verify exact seven-day output and requested active-day/exercise counts using real providers.
- [ ] Verify recovery-day balance, duration estimates and malformed-provider-response handling.

## Phase 2 — Workout editing and regeneration
- [x] Day/week regeneration and inline editing are documented in the existing agent guide and commit history.
- [ ] Verify every edit control in browser.
- [ ] Verify day regeneration preserves other days and respects user edits.
- [ ] Verify full-week regeneration behavior and loading/error states.

## Phase 3 — Exercise demonstrations
- [x] Exercise lookup endpoint exists and filters returned GIF URLs to the ExerciseDB media host.
- [ ] Verify live search, empty/error states and attribution in browser.
- [ ] Confirm GIFs are not downloaded or persisted.
- [ ] Reconfirm provider terms before any commercial use.

## Phase 4 — Persistence and account flows
- [x] Local-storage persistence code exists.
- [x] Supabase `workout_plans` store and migration SQL exist.
- [x] Supabase account UI/flows are present in repository history.
- [ ] Verify shared project's actual migration history before any SQL execution.
- [ ] Verify RLS isolation with two test users and guest-auth behavior.
- [ ] Verify sign-up, sign-in, sign-out, password reset and recovery redirect on deployed origin.

## Phase 5 — MVP release verification
- [ ] Run `npm run check`.
- [ ] Run `npm run build`.
- [ ] Test all core workflows in desktop and mobile browsers.
- [ ] Verify production environment variables and deployed application.
- [ ] Fix only release-blocking issues; avoid unrelated feature work.
- [ ] Record evidence and mark MVP verification complete only after all required checks pass.

## Phase 6 — Production readiness (after MVP)
- [ ] Review privacy, data retention, account deletion and user-data export expectations.
- [ ] Confirm AI provider rate limits/cost controls and failure handling.
- [ ] Confirm exercise-media licensing for intended distribution/commercial model.
- [ ] Add basic operational monitoring and backup/recovery procedures only when needed.
- [ ] Obtain explicit product approval before payments or additional feature scope.
