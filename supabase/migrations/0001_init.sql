-- PrayFit Trivia — initial schema.
-- Safe to run via `supabase db push`, the Supabase SQL editor, or
-- `supabase migration up` against a linked project. Depends only on
-- Supabase's built-in `auth.users` table and Postgres 13+'s built-in
-- gen_random_uuid() — no extensions required.

-- ── Enums ────────────────────────────────────────────────────────────────

create type public.question_category as enum ('Fitness', 'Nutrition', 'Health', 'Science', 'Food');
create type public.echo_strength as enum ('direct', 'thematic');
create type public.question_difficulty as enum ('easy', 'medium', 'hard');
create type public.bible_translation as enum ('NIV');

-- ── updated_at helper ────────────────────────────────────────────────────

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── profiles ─────────────────────────────────────────────────────────────
-- One row per auth.users row, auto-created on signup. Kept minimal — there's
-- no display-name/avatar feature yet, but app code should never read
-- auth.users directly, so this is the extension point when that lands.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are viewable by their owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles are insertable by their owner"
  on public.profiles for insert
  with check (auth.uid() = id);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── questions ────────────────────────────────────────────────────────────
-- The content bank. Publicly readable (quiz content isn't user-specific or
-- sensitive) but not writable by the anon/authenticated roles — only the
-- service role (which bypasses RLS) or an authenticated admin tool should
-- insert/update/delete rows here. Matches the locked content-generation
-- rule's JSON schema in docs/prayfit-trivia-content-engine-prompt.md.

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  category public.question_category not null,
  question text not null,
  options jsonb not null,
  correct_answer text not null,
  verse_reference text not null,
  verse_text text not null,
  echo_word text not null,
  echo_strength public.echo_strength not null,
  difficulty public.question_difficulty not null,
  translation public.bible_translation not null default 'NIV',
  created_at timestamptz not null default now()
);

alter table public.questions enable row level security;

create policy "questions are viewable by everyone"
  on public.questions for select
  using (true);

create index questions_category_idx on public.questions (category);

-- ── user_streaks ─────────────────────────────────────────────────────────
-- One row per user. Mirrors src/lib/streak.ts's local AsyncStorage shape so
-- the sync layer can upsert it directly.

create table public.user_streaks (
  user_id uuid primary key references auth.users (id) on delete cascade,
  count integer not null default 0,
  last_completed_date date,
  freezes_available integer not null default 1,
  freeze_week_key text,
  updated_at timestamptz not null default now()
);

alter table public.user_streaks enable row level security;

create policy "users manage their own streak"
  on public.user_streaks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger set_updated_at
  before update on public.user_streaks
  for each row execute procedure public.set_updated_at();

-- ── user_bible_progress ──────────────────────────────────────────────────
-- One row per (user, book). Chapter numbers are stored as int arrays —
-- touched/read are both monotonic (a chapter, once touched, stays touched),
-- so merging two devices' progress is always a safe set union, never a
-- conflict. See src/lib/bibleProgress.ts.

create table public.user_bible_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  book_name text not null,
  touched_chapters integer[] not null default '{}',
  read_chapters integer[] not null default '{}',
  updated_at timestamptz not null default now(),
  primary key (user_id, book_name)
);

alter table public.user_bible_progress enable row level security;

create policy "users manage their own bible progress"
  on public.user_bible_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger set_updated_at
  before update on public.user_bible_progress
  for each row execute procedure public.set_updated_at();

-- ── user_verse_encounters ────────────────────────────────────────────────
-- Per-verse history (not just per-chapter totals) — the data source for the
-- concept doc's "personal verse bank" feature once that screen is built.

create table public.user_verse_encounters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  question_id uuid references public.questions (id) on delete set null,
  category public.question_category not null,
  verse_reference text not null,
  verse_text text not null,
  was_read boolean not null default false,
  encountered_at timestamptz not null default now()
);

alter table public.user_verse_encounters enable row level security;

create policy "users manage their own verse encounters"
  on public.user_verse_encounters for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index user_verse_encounters_user_id_idx on public.user_verse_encounters (user_id);

-- ── user_quiz_completions ────────────────────────────────────────────────
-- One row per user per completed day. The unique constraint doubles as a
-- server-side guard against double-completion for the same day.

create table public.user_quiz_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  day_key date not null,
  score integer not null,
  points integer not null,
  created_at timestamptz not null default now(),
  unique (user_id, day_key)
);

alter table public.user_quiz_completions enable row level security;

create policy "users manage their own quiz completions"
  on public.user_quiz_completions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
