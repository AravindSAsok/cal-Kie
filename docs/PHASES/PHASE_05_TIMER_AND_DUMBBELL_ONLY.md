# Phase 5 — Dumbbell-only routine and timer

## Goal
Keep the hardcoded two-week routine usable with dumbbells/bodyweight and provide a standalone timer screen for workouts and everyday timing.

## Implementation
- Replaced the only band-named routine movement, Pallof press, with Dumbbell plank drag.
- Added three movement-specific cues for the replacement and retained the cue-coverage guard.
- Removed the bands-and-dumbbells choice from the workout builder; the default home-equipment option is dumbbells and bodyweight.
- Added an AI prompt constraint against band-based exercises, preferring dumbbell/bodyweight alternatives.
- Added a Timer shortcut in the top bar and navigation drawer on Home and Workout Builder.
- Added `/timer` with countdown, stopwatch/laps and work/rest interval modes.
- Countdown includes editable minutes/seconds, quick presets, start/pause/reset and optional finish sound.
- Stopwatch includes start/pause/reset and lap/split recording.
- Interval mode includes configurable rounds/work/rest, common presets, phase changes, progress and reset.
- Timing uses monotonic deadlines so background-tab throttling does not accumulate drift. The timer is client-only and requires no account, API or database.

## Source validation
- Parsed the hardcoded 14-day routine JSON.
- Confirmed no band-named exercise remains in the routine.
- Confirmed every hardcoded exercise name has an entry in the exercise-specific cue map.
- `npm run check`, `npm run build` and browser verification were not run as part of the GitHub-only edit; verify after deployment.

## Acceptance checks
- [ ] Home and Workout Builder show a Timer shortcut in the top bar.
- [ ] Timer opens at `/timer` and the Home link returns to `/`.
- [ ] Countdown presets, custom duration, pause/resume, reset and completion sound work.
- [ ] Stopwatch start/pause/reset and lap splits work.
- [ ] Interval presets and custom rounds/work/rest settings work, including final-round completion.
- [ ] Timers remain accurate after switching browser tabs.
- [ ] Timer layout is usable on mobile.
- [ ] AI workout generation avoids resistance-band exercises.
- [ ] No band-dependent exercise appears in the hardcoded 14-day routine.
- [ ] `npm run check` and `npm run build` pass.
