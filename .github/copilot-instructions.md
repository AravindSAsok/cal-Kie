# Cal-Kie — Copilot instructions

The canonical, mandatory guide for all agents is [`AGENTS.md`](../AGENTS.md).
Read it before suggesting or applying changes. The essentials:

## Architecture

- Astro 7 + TypeScript, `output: "server"`, Vercel adapter by default; the
  standalone Node adapter is selected only when `CALKIE_HOST=render`.
- MongoDB Atlas is the **only** database (`hulksar`, `MONGODB_URI` server-side).
  No SQL, no second auth or database provider, no destructive migrations.
- Sessions are MongoDB-backed opaque tokens hashed with SHA-256 and delivered in
  an HttpOnly, SameSite=Lax cookie. Passwords are scrypt with a random salt.
  Every user-owned query must include the authenticated `userId`.
- AI providers (OpenRouter, Groq, Gemini) are called server-side only.
- ExerciseDB media is fetched on demand, cached in memory for at most 55 minutes
  and never persisted. User-supplied demos live in `exercise_gifs`, owner-scoped.

## Frontend

- One stylesheet: `src/styles/app.css`. Do not add page-level `<style>` blocks.
- Shared chrome: `src/components/AppChrome.astro`; pass the correct `active` key.
- Instagram-inspired visual language (hairline borders, gradient avatar rings,
  blue primary action, bottom tab bar on mobile, left rail on desktop). Visual
  only — never add likes, follows, comments, DMs, feeds of other users or
  analytics.
- Light and dark themes both come from `prefers-color-scheme` on the CSS tokens.
- Page scripts bind to specific element IDs (home, builder, timer, account).
  Check “Interface contracts — do not break” in `AGENTS.md` before renaming.

## Verification

```bash
npm install --no-audit --no-fund --package-lock=false  # npm ci currently fails on lockfile drift
npm run check
npm run build
```

Report only checks that actually ran. Never claim a database, deploy or push
succeeded without evidence.
