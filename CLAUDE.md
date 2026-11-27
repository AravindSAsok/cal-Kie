# Cal-Kie — Claude Code guide

`AGENTS.md` is the canonical, mandatory instruction file for every agent in this
repository. Read it in full before changing anything; this file only adds the
tool-specific entry point.

@AGENTS.md

## Quick orientation

- **Stack:** Astro 7 + TypeScript, Vercel adapter (Node adapter only when
  `CALKIE_HOST=render`), Node 22.23.4, MongoDB Atlas as the only datastore.
- **Pages:** `/` (profile header, day stories, two-week routine feed),
  `/workout-builder` (AI preferences + editable week), `/timer`, `/signin`,
  `/signup`.
- **Styles:** a single stylesheet, `src/styles/app.css`. No page-level `<style>`
  blocks. Instagram-inspired visual language, light and dark via
  `prefers-color-scheme`.
- **Chrome:** `src/components/AppChrome.astro` (left rail on desktop, top bar +
  bottom tab bar on mobile). Pass `active="home" | "builder" | "timer"`.
- **Scripts bind to IDs.** See “Interface contracts — do not break” in
  `AGENTS.md` before editing any page markup.

## Commands

```bash
npm install --no-audit --no-fund --package-lock=false   # lockfile is currently out of sync; npm ci fails
npm run check      # astro check (types + templates)
npm run build      # production build
npm run dev        # local dev server on http://localhost:4321
```

Never commit `.env`, connection strings, provider keys or user data. Never add a
second database or auth provider. Do not add social features, payments,
analytics or nutrition tracking — the Instagram styling is a look, not a product
pivot.
