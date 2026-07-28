import { getProgressState, setProgressState, type ProgressState } from '@/lib/bibleProgress';
import { getStreakState, setStreakState } from '@/lib/streak';
import { supabase } from '@/lib/supabase';

/**
 * Push-on-change + pull-and-merge-on-sign-in sync. Local AsyncStorage stays
 * the source of truth for instant, offline-safe reads/writes; these
 * functions are additive best-effort background writes to Supabase, called
 * only when a session exists. Every function is a no-op if `supabase` is
 * null (no backend configured) — call sites don't need to check first.
 *
 * Conflict policy (deliberately simple, documented rather than clever):
 *   - Streak: remote wins if a remote record already exists (it represents
 *     the user's real cross-device progress); otherwise local is uploaded
 *     as the starting point. This only matters the moment someone signs in
 *     on a second device — not on every sync.
 *   - Bible progress: always a safe set union. Touched/read is monotonic
 *     (a chapter, once touched, stays touched), so merging two devices'
 *     progress can never lose data in either direction.
 */

export async function pushStreakToRemote(userId: string): Promise<void> {
  if (!supabase) return;
  const local = await getStreakState();
  await supabase.from('user_streaks').upsert({
    user_id: userId,
    count: local.count,
    last_completed_date: local.lastCompletedDate,
    freezes_available: local.freezesAvailable,
    freeze_week_key: local.freezeWeekKey,
  });
}

export async function pushBibleProgressToRemote(userId: string): Promise<void> {
  if (!supabase) return;
  const local = await getProgressState();
  const rows = Object.entries(local).map(([bookName, progress]) => ({
    user_id: userId,
    book_name: bookName,
    touched_chapters: progress.touchedChapters,
    read_chapters: progress.readChapters,
  }));
  if (rows.length === 0) return;
  await supabase.from('user_bible_progress').upsert(rows);
}

export async function pushQuizCompletion(
  userId: string,
  entry: { dayKey: string; score: number; points: number },
): Promise<void> {
  if (!supabase) return;
  await supabase
    .from('user_quiz_completions')
    .upsert(
      { user_id: userId, day_key: entry.dayKey, score: entry.score, points: entry.points },
      { onConflict: 'user_id,day_key' },
    );
}

export async function pushVerseEncounters(
  userId: string,
  entries: { questionId?: string; category: string; verseReference: string; verseText: string; wasRead: boolean }[],
): Promise<void> {
  if (!supabase || entries.length === 0) return;
  await supabase.from('user_verse_encounters').insert(
    entries.map((e) => ({
      user_id: userId,
      question_id: e.questionId ?? null,
      category: e.category as 'Fitness' | 'Nutrition' | 'Health' | 'Science' | 'Food',
      verse_reference: e.verseReference,
      verse_text: e.verseText,
      was_read: e.wasRead,
    })),
  );
}

function unionChapters(a: number[], b: number[]): number[] {
  return Array.from(new Set([...a, ...b])).sort((x, y) => x - y);
}

/**
 * Call once right after a successful sign-in. Reconciles local (this
 * device, possibly played anonymously before signing in) with remote
 * (this account's real progress, possibly from other devices).
 */
export async function pullAndMergeOnSignIn(userId: string): Promise<void> {
  if (!supabase) return;

  // Streak
  const { data: remoteStreak } = await supabase.from('user_streaks').select('*').eq('user_id', userId).maybeSingle();
  if (remoteStreak) {
    await setStreakState({
      count: remoteStreak.count,
      lastCompletedDate: remoteStreak.last_completed_date,
      freezesAvailable: remoteStreak.freezes_available,
      freezeWeekKey: remoteStreak.freeze_week_key,
    });
  } else {
    await pushStreakToRemote(userId);
  }

  // Bible progress — union merge, then write the merged result both ways.
  const { data: remoteProgress } = await supabase.from('user_bible_progress').select('*').eq('user_id', userId);
  const localProgress = await getProgressState();
  const merged: ProgressState = { ...localProgress };

  for (const row of remoteProgress ?? []) {
    const existing = merged[row.book_name] ?? { touchedChapters: [], readChapters: [] };
    merged[row.book_name] = {
      touchedChapters: unionChapters(existing.touchedChapters, row.touched_chapters),
      readChapters: unionChapters(existing.readChapters, row.read_chapters),
    };
  }

  await setProgressState(merged);
  await pushBibleProgressToRemote(userId);
}
