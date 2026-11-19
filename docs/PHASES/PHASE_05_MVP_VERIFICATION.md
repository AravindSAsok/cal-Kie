# Phase 5 — MVP verification

## Current status

Verification is pending after the MongoDB-only migration.

## Required checks

- npm ci using Node 22.23.4.
- npm audit.
- npm run check.
- npm run build.
- Signup/login/logout and current-session checks with MongoDB configured.
- Save/load a workout plan across browser sessions.
- Confirm user A cannot read, update or delete user B's workout plan.
- Generate and edit a week; regenerate one day and the full week.
- ExerciseDB search and remote GIF display.
- Mobile layout and browser console.

## Deployment dependency

The Cal-Kie Vercel Production environment must contain MONGODB_URI and MONGODB_DB_NAME=hulksar. The source migration alone does not prove production database connectivity.
