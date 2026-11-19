# Cal-Kie Decision Log

Record durable decisions here. New decisions should include date, context, decision and consequences.

## 2026-11-19 — GitHub repository is the project continuity source of truth
- **Context:** Work must survive chat resets and agent changes.
- **Decision:** Keep current status, roadmap, architecture, decisions, changelog, phase evidence and next-step handoff in version-controlled Markdown.
- **Consequence:** Agents must read `AGENTS.md` and the status/handoff docs at session start and update them after meaningful work.

## Existing product/technical decisions (from repository documentation and source)
- **Astro + TypeScript:** retain the existing application foundation; avoid framework migration for the MVP.
- **Shared Supabase:** Cal-Kie and TrackCake use the same Supabase project/database. No separate Cal-Kie project.
- **Additive schema only:** Cal-Kie uses its own feature table(s), starting with `public.workout_plans`; preserve TrackCake tables and applied migration history.
- **RLS ownership:** workout plans are user-owned and protected by `auth.uid() = user_id`.
- **AI secrets:** provider API keys remain server-side.
- **Exercise media:** fetch remote GIFs on demand; do not store or mirror them. Respect attribution/licensing.
- **MVP scope:** workout planning, editing, regeneration, exercise reference and persistence first. No unrelated complexity without explicit approval.

## Change control
Do not silently reverse a decision. Add a dated entry explaining why a change is needed and identify any migration, compatibility or deployment impact.
