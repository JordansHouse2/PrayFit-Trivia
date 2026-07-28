# PrayFit Trivia

A daily 5-question trivia app (React Native / Expo) pairing health, fitness,
nutrition, science, and food trivia with Bible verse clues. The verse isn't
decorative — it's the mechanism the player uses to land on the correct
answer, either through a direct word-echo or a clear thematic connection.
Full product docs: [`docs/`](./docs).

## Status

**Core loop, Bible Progress Tracker, onboarding, notifications, and the
Supabase backend are all built.** The 40-question seed batch is loaded (NIV,
verified verse-by-verse — see `docs/prayfit-trivia-content-engine-prompt.md`
for the locked content rule). Backend is optional and additive: the app is
fully functional local-only, and accounts/cross-device sync switch on
automatically the moment Supabase env vars are set (see
[`docs/supabase-setup.md`](./docs/supabase-setup.md) — that's the one
remaining step, since it needs your Supabase account).

**Not built yet:** Category Mastery badges (on hold — you're deciding
whether you want these once you're in test mode), reflection prompts, share
moments, and serving the question bank from Supabase instead of the bundled
JSON (the table's ready, the client just doesn't read from it yet).

## Stack

- **Frontend:** React Native via [Expo](https://expo.dev) (Expo Router,
  TypeScript). Web output is SPA-only (`app.json`'s `web.output: "single"`)
  — this app is account-gated and interactive, not a content site, so
  there's no benefit to per-route static rendering, and Supabase's browser
  storage access doesn't work under Expo's server-rendering pass anyway.
- **Backend:** [Supabase](https://supabase.com) — Postgres + Auth + Row
  Level Security. Schema in `supabase/migrations/`, tested against a real
  local Postgres with simulated RLS (two fake users, verified cross-user
  isolation, anon read-only access to the question bank, and the
  daily-completion uniqueness constraint) before ever touching a live
  project.
- **State:** [Zustand](https://github.com/pmndrs/zustand) for the live quiz
  session and auth session; `AsyncStorage` for on-device streak/progress,
  which stays the source of truth even when signed in (Supabase sync is
  additive, not a replacement).
- **Notifications:** `expo-notifications`, entirely local/on-device (no
  backend needed for any of the four notification types).
- **Fonts:** Anton (bold condensed display face, matching prayfit.org's
  headline style) via `@expo-google-fonts/anton`.

## Getting started

```bash
npm install
npx expo start        # then press 'w' for web, or scan the QR code with Expo Go
```

Optional — see [`docs/supabase-setup.md`](./docs/supabase-setup.md) to turn
on accounts and cross-device sync.

## Project structure

```
src/
  app/                    Screens (Expo Router file-based routing)
    index.tsx              Home — status, streak, progress preview, donate
    onboarding/             Welcome + notification permission screens
    quiz/index.tsx          Daily 5 flow: question + Discernment Mode + scoring
    quiz/results.tsx        Score summary, streak update, verses touched/read
    progress.tsx             Bible Progress Tracker (66-book map, milestones)
    settings.tsx              Notification prefs + account (sign in/out)
    account.tsx                Sign in / sign up
  components/
    quiz/                    Answer options, verse candidate cards, progress dots
    brand-mark.tsx             Logo, auto light/dark variant
    themed-text.tsx, themed-view.tsx   Shared light/dark-mode primitives
  lib/
    quizEngine.ts             Picks the daily 5 + builds Discernment Mode verse candidates
    streak.ts                  Streak math + weekly "streak freeze" grace mechanic
    bibleProgress.ts            Touched/read chapter tracking (two-tier credit)
    milestones.ts                 Bible Progress milestone definitions
    notifications.ts               Local notification scheduling (all 4 trigger types)
    scoring.ts                      Points: base answer + Discernment bonus
    random.ts                        Seeded RNG so "today's 5" is the same all day
    auth.ts, sync.ts                  Supabase auth actions + push/pull-merge sync
    supabase.ts                        Backend client — null until env vars are set
  store/
    quizSession.ts            Zustand store driving the live 5-question session
    authSession.ts              Zustand store tracking the Supabase auth session
  types/                    Question/verse/quiz/database TypeScript types
  data/
    seed/questions.json       The 40-question seed batch (also in supabase/seed.sql)
    bible-books.ts              Canonical 66-book dataset (real chapter counts, groupings)

supabase/
  migrations/0001_init.sql  Full schema + RLS policies
  seed.sql                   The 40 launch questions, generated from the JSON above

docs/                       Product concept doc, product spec, the locked
                            content-generation prompt, and the Supabase setup
                            guide — the source of truth for the content rule,
                            screens, and scoring math
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
   and marks that verse "Read" instead of just "Touched" in the Bible
   Progress Tracker.
6. **Bible Progress Tracker:** lifetime, book-by-book map across all 66
   books, with milestones (chapter-count thresholds, testament percentages,
   "every book of a group touched").
7. **Notifications** (all local, no backend required): daily reminder,
   evening streak-at-risk nudge with the real streak count, milestone
   celebrations, and a soft 3-day re-engagement nudge.
8. **Accounts** (optional): sign in to sync streak + Bible progress across
   devices. Local play before signing up is preserved and merged in, not
   discarded.
