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
- Search ExerciseDB on demand and display remote GIFs with visible attribution.

## Architecture

- Frontend: Astro 7 + TypeScript.
- Database: MongoDB Atlas only. The application uses the MONGODB_URI server-side environment variable and defaults MONGODB_DB_NAME to hulksar.
- Authentication: MongoDB-backed accounts using scrypt password hashes, hashed opaque session tokens and HttpOnly cookies.
- AI: OpenRouter, Groq and Gemini API keys are server-side only.
- Exercise media: remote ExerciseDB GIF URLs; no media download or persistence.
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

## ExerciseDB licensing

Exercise references are queried on demand from https://oss.exercisedb.dev/docs. The browser displays remote GIFs directly and credits ExerciseDB by AscendAPI. The free V1 terms are for personal and other non-commercial use; commercial, SaaS or monetised use requires the appropriate paid licence. Verify the current provider terms before commercial use.

Cal-Kie provides general fitness suggestions, not medical advice. Adapt workouts to your ability and stop if you experience pain.

Repository: https://github.com/AravindSAsok/cal-Kie
Production: https://cal-kie.vercel.app/
