# Cal-Kie Decision Log

Record durable decisions here. New decisions should include date, context, decision and consequences.

## 2026-11-19 — GitHub repository is the project continuity source of truth
- **Context:** Work must survive chat resets and agent changes.
- **Decision:** Keep current status, roadmap, architecture, decisions, changelog, phase evidence and next-step handoff in version-controlled Markdown.
- **Consequence:** Agents must read AGENTS.md and the status/handoff docs at session start and update them after meaningful work.

## 2026-11-19 — Batch MVP verification into one release commit
- **Context:** Every push to main triggers a Vercel deployment build; phase-by-phase pushes create unnecessary builds.
- **Decision:** For multi-phase verification/release work, complete all local implementation, documentation and available tests on main, then create one comprehensive commit and one push. A second corrective push is allowed only if the post-push Vercel deployment fails.
- **Consequence:** Update handoff documents during work without intermediate commits; never force-push or overwrite unrelated changes.

## 2026-11-19 — Upgrade Astro stack to patched major versions
- **Context:** npm audit found 11 vulnerabilities in the previous Astro 5 dependency tree, including one critical advisory and multiple high-severity advisories.
- **Decision:** Upgrade to Astro 7.4.13, @astrojs/vercel 11.0.22 and @astrojs/node 11.1.14; use Node 22.23.4+ and a committed package-lock.json. Override @vercel/routing-utils path-to-regexp to patched 6.3.0.
- **Consequence:** The application must run on Node 22.23.4 or newer within Node 22. npm audit returned 0 vulnerabilities and Astro check/build passed after the upgrade.

## Existing product/technical decisions
- **Astro + TypeScript:** retain the existing application foundation; avoid further framework migration for the MVP.
- **Shared Supabase:** Cal-Kie and TrackCake use the same Supabase project/database. No separate Cal-Kie project.
- **Additive schema only:** Cal-Kie uses its own feature table(s), starting with public.workout_plans; preserve TrackCake tables and applied migration history.
- **RLS ownership:** workout plans are user-owned and protected by auth.uid() = user_id.
- **AI secrets:** provider API keys remain server-side.
- **Exercise media:** fetch remote GIFs on demand; do not store or mirror them. Respect attribution/licensing.
- **MVP scope:** workout planning, editing, regeneration, exercise reference and persistence first. No unrelated complexity without explicit approval.

## Change control
Do not silently reverse a decision. Add a dated entry explaining why a change is needed and identify any migration, compatibility or deployment impact.
