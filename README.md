# PrayFit Trivia

A daily 5-question trivia app (React Native / Expo) pairing health, fitness,
nutrition, science, and food trivia with Bible verse clues. The verse isn't
decorative — it's the mechanism the player uses to land on the correct
answer, either through a direct word-echo or a clear thematic connection.
Full product docs: [`docs/`](./docs).

## Status

**Phase 2 core loop scaffolded:** daily 5, Discernment Mode (verse-picking),
streak tracking, and results screen, running on the 40-question seed batch
with everything stored locally on-device. No backend yet — that's next.

## Stack

- **Frontend:** React Native via [Expo](https://expo.dev) (Expo Router,
  TypeScript)
- **Backend (planned, not yet wired up):** [Supabase](https://supabase.com)
  — Postgres + Auth + Row Level Security for accounts, streaks, and Bible
  progress, plus a real question bank table to replace the local seed file
- **State:** [Zustand](https://github.com/pmndrs/zustand) for the live quiz
  session; `AsyncStorage` for on-device streak persistence
- **Push notifications (planned):** Expo's push notification service

## Getting started

```bash
npm install
npx expo start        # then press 'w' for web, or scan the QR code with Expo Go
```

## Project structure

```
src/
  app/                 Screens (Expo Router file-based routing)
    index.tsx          Home — status, streak, entry point into the daily 5
    quiz/index.tsx      Daily 5 flow: question + Discernment Mode + scoring
    quiz/results.tsx    Score summary, streak update, verses touched/read
  components/
    quiz/               Answer options, verse candidate cards, progress dots
    themed-text.tsx, themed-view.tsx   Shared light/dark-mode primitives
  lib/
    quizEngine.ts        Picks the daily 5 + builds Discernment Mode verse candidates
    streak.ts             Streak math + weekly "streak freeze" grace mechanic
    scoring.ts             Points: base answer + Discernment bonus
    random.ts               Seeded RNG so "today's 5" is the same all day, every device
    supabase.ts             Backend client — stubbed, not wired up yet
  store/quizSession.ts   Zustand store driving the live 5-question session
  types/                  Question/verse/quiz TypeScript types matching the locked content schema
  data/seed/questions.json   The 40-question seed batch

docs/                    Product concept doc, product spec, and the locked
                         content-generation prompt — the source of truth
                         for the content rule, screens, and scoring math
```

## How the core loop works

1. **Daily 5:** one question per category (Fitness, Nutrition, Health,
   Science, Food), deterministically picked from the seed bank based on the
   calendar date — same 5 questions all day, different tomorrow.
2. **Discernment Mode:** each question shows 2–4 verse candidates. Only one
   is the real clue per the locked content rule; the rest are distractor
   verses pulled from other questions in the bank. The player picks the
   answer *and* the verse they think is the valid clue before locking in.
3. **Scoring:** 10 points for a correct answer, +5 discernment bonus for
   correctly identifying the clue verse — no speed component, by design.
4. **Streak:** +1 for completing all 5 (correctness doesn't matter — showing
   up is the habit), with one free "streak freeze" per week so a single
   missed day doesn't erase progress.
5. **Context Bonus:** "Read the full chapter" opens the passage in-browser
   and marks that verse as "Read" rather than just "Touched" — this is the
   on-ramp into the future Bible Progress Tracker.

## Not built yet

- Supabase wiring (accounts, cross-device sync, the real 200+ question bank)
- Bible Progress Tracker (66-book map) and Category Mastery badges
- Onboarding, notifications, reflection prompts, share moments
