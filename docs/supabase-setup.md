# Setting Up Supabase (Accounts + Cross-Device Sync)

The app works completely fine without this — streaks and Bible progress just
live on the one device. This turns on accounts and syncing across devices.
About 10 minutes, no code required.

## What you're about to unlock

- Sign up / sign in (email + password)
- Streak and Bible progress sync automatically across every device someone
  signs into
- If someone plays a while before signing up, their local progress is kept
  and merged into their new account — nothing is lost

## What's already built and tested

Everything on the code side is done and pushed. Specifically:

- The full database schema (`supabase/migrations/0001_init.sql`) — tables for
  accounts, streaks, Bible progress, verse history, and daily completions,
  each with row-level security so a user can only ever read or write their
  own data.
- I verified this by actually running it against a real local Postgres
  database and testing as two different simulated users: confirmed a user
  can read/write their own streak but gets blocked from touching another
  user's, that anyone can read the trivia question bank but can't write to
  it, and that the daily-completion table correctly rejects a second
  "completed today" entry. This wasn't just written and assumed correct —
  it's genuinely exercised.
- A seed file (`supabase/seed.sql`) with the 40 launch questions, ready to
  load into the `questions` table.
- The app's sign-in/sign-up screen, a Settings toggle to manage it, and the
  sync logic that pushes local progress up and merges remote progress down.
- I also caught and fixed a real bug along the way: Expo's web build was
  pre-rendering pages on a server, and the Supabase library crashed trying
  to read browser storage that doesn't exist there. Fixed by switching the
  web build to a plain single-page app (`app.json`'s `web.output`), which
  is the right setting for an app like this anyway (it's account-gated and
  interactive, not a content site that benefits from pre-rendered pages).

**The one thing I can't do myself:** actually create a Supabase project.
That needs your account/billing, and I don't have browser access to
supabase.com from this environment. The steps below are exactly what's left.

## Step 1: Create the project

1. Go to [supabase.com](https://supabase.com) and sign up (free tier is
   plenty for launch).
2. Create a new project. Pick any name/region; note the database password
   it asks you to set (you likely won't need it again, but save it
   somewhere safe anyway).
3. Wait a minute or two for the project to finish provisioning.

## Step 2: Run the schema

In your new project's dashboard, open **SQL Editor** (left sidebar).

1. Open `supabase/migrations/0001_init.sql` from this repo, copy its full
   contents, paste into a new SQL Editor query, and click **Run**.
2. Repeat with `supabase/seed.sql` to load the 40 launch questions.

(If you're comfortable with the command line instead: `npx supabase login`,
`npx supabase link --project-ref <your-project-ref>`, then
`npx supabase db push` and `psql <connection-string> -f supabase/seed.sql`
do the same thing.)

## Step 3: Get your API keys

In the dashboard: **Settings → API**. You need two values:

- **Project URL** — looks like `https://abcdefgh.supabase.co`
- **anon / public key** — a long string starting with `eyJ...`

(Not the `service_role` key — that one must never go in the app or get
committed to git; it bypasses all the security rules we just tested.)

## Step 4: Set the environment variables

Copy `.env.example` to a new file named `.env` in the project root, and fill
in the two values from Step 3:

```
EXPO_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

`.env` is already git-ignored, so this stays out of version control.

## Step 5: Restart and verify

Restart the dev server (`npx expo start`). From here:

- Settings should now show an **Account** section
- Sign up with a real email — Supabase emails a confirmation link by
  default; click it, then sign in
- In the Supabase dashboard's **Table Editor**, you should see a row appear
  in `profiles`, and after finishing a daily 5, rows in `user_streaks` and
  `user_bible_progress`

## Good to know

- **Nothing breaks if you skip this.** Every part of the app already works
  fully offline; this is additive.
- **Notification preferences stay local-only** (reminder time, on/off) —
  deliberately not synced, since they're arguably a per-device thing (e.g.
  different time zones).
- **The question bank is still bundled with the app**, not yet served from
  Supabase — the `questions` table is seeded and ready, but the app doesn't
  read from it yet. Wiring that up is a reasonable next step once you're
  ready to update content without shipping a new app build, but it's a
  separate, smaller task from accounts/sync.
- **Merge policy**, in plain terms: if someone played on a device before
  ever signing up, that progress is preserved — first sign-in uploads it.
  If they sign into an *existing* account on a new device, their real
  account progress takes over on that device. Bible progress specifically
  always merges losslessly both ways (once a chapter's touched, it stays
  touched, so combining two devices' progress can't erase anything).
