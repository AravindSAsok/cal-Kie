# Cal-Kie

**Your week. Your kind of strong.** Cal-Kie is a focused AI workout-week planner built with Astro and TypeScript. It generates editable Monday-to-Sunday plans and retrieves exercise demonstrations only when requested.

## Project continuity

Read AGENTS.md before making changes. Current status, roadmap, architecture, decisions and next steps live in docs/.

## MVP features

- Generate a seven-day workout plan using OpenRouter, Groq or Gemini.
- Configure session duration, exercise count, training days, goal, experience and equipment.
- Review sets, reps, rest, duration and form instructions.
- Regenerate the full week or an individual day.
- Edit exercises, add/remove movements and change recovery days.
- Create an account, log in and log out.
- Save workout plans to MongoDB Atlas for the signed-in user; retain a local browser copy for offline continuity.
- Search Firecrawl image results for exercise GIFs, with strict title matching and ExerciseDB fallback.
- Randomly choose among equally relevant GIF candidates and show source attribution links where available.

## Architecture

- Frontend: Astro 7 + TypeScript.
- Database: MongoDB Atlas only. The application uses the MONGODB_URI server-side environment variable and defaults MONGODB_DB_NAME to hulksar.
- Authentication: MongoDB-backed accounts using scrypt password hashes, hashed opaque session tokens and HttpOnly cookies.
- AI: OpenRouter, Groq and Gemini API keys are server-side only.
- Exercise media: Firecrawl image search first, ExerciseDB fallback; remote GIF URLs only, with bounded in-memory/page caches and no media download or persistent media storage.
- Hosting: Vercel.

MongoDB Atlas is the only database/auth persistence backend in this application.

## Local development

Requirements: Node.js 22.23.4 or newer within Node 22, and npm.

~~~bash
npm ci
cp .env.example .env
npm run dev
~~~

Open http://localhost:4321.

Set MONGODB_URI and MONGODB_DB_NAME in .env for account and cloud workout persistence. Without MongoDB, the planner can still be used and workout plans remain in browser storage; account endpoints return a clear service-unavailable response. Add at least one AI provider key to enable generation.

## Environment variables

~~~dotenv
MONGODB_URI=
MONGODB_DB_NAME=hulksar
OPENROUTER_API_KEY=
OPENROUTER_MODEL=
GROQ_API_KEY=
GROQ_MODEL=
GEMINI_API_KEY=
GEMINI_MODEL=
FIRECRAWL_API_KEY=
~~~

Never use a public prefix for database or AI credentials. Never commit .env, connection strings, credentials, tokens or user data.

## MongoDB collections

- users: account identity and scrypt password credentials.
- auth_sessions: SHA-256 hashes of opaque session tokens and expiry dates.
- workout_plans: one saved plan per user and week, protected by userId filters.

The first authenticated request creates the required indexes. The app does not run destructive migrations or drop collections.

## Verification

~~~bash
npm run check
npm run build
npm audit
~~~

## Exercise media sources and licensing

Cal-Kie queries Firecrawl's image search endpoint (`https://api.firecrawl.dev/v2/search`) for direct GIF assets, then falls back to ExerciseDB when no relevant GIF is found. Set `FIRECRAWL_API_KEY` server-side for higher Firecrawl limits; never expose it in browser code. The endpoint keeps search metadata only in a bounded 55-minute server-memory cache and the browser loads remote GIFs directly. It does not download or persist third-party GIF binaries.

Image search results are third-party content. Source links and attribution are displayed where available, but attribution alone does not grant reuse rights. Confirm each image's licence and the source site's hotlinking terms before commercial distribution. ExerciseDB's free V1 terms are non-commercial; commercial, SaaS or monetised use requires the appropriate paid licence. See https://oss.exercisedb.dev/docs.

Cal-Kie provides general fitness suggestions, not medical advice. Adapt workouts to your ability and stop if you experience pain.

Repository: https://github.com/AravindSAsok/cal-Kie
Production: https://cal-kie.vercel.app/
