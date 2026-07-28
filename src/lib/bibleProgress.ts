import AsyncStorage from '@react-native-async-storage/async-storage';

import { BIBLE_BOOKS, GROUP_ORDER, NT_CHAPTERS, OT_CHAPTERS, TOTAL_CHAPTERS, type BookGroup } from '@/data/bible-books';
import { parseVerseReference } from '@/lib/verseReference';

const STORAGE_KEY = 'prayfit:bibleProgress:v1';

/** Chapter numbers touched/read per book, keyed by canonical book name. */
export interface BookProgress {
  touchedChapters: number[];
  readChapters: number[];
}

export type ProgressState = Record<string, BookProgress>;

export async function getProgressState(): Promise<ProgressState> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as ProgressState;
  } catch {
    return {};
  }
}

async function persist(state: ProgressState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function applyEngagement(state: ProgressState, reference: string, wasRead: boolean): void {
  const parsed = parseVerseReference(reference);
  if (!parsed) return;

  const existing = state[parsed.book] ?? { touchedChapters: [], readChapters: [] };

  const touchedChapters = existing.touchedChapters.includes(parsed.chapter)
    ? existing.touchedChapters
    : [...existing.touchedChapters, parsed.chapter];
  const readChapters =
    wasRead && !existing.readChapters.includes(parsed.chapter)
      ? [...existing.readChapters, parsed.chapter]
      : existing.readChapters;

  state[parsed.book] = { touchedChapters, readChapters };
}

/**
 * Records one verse's engagement toward lifetime progress. Every clue verse
 * a user answers counts as "touched"; tapping through to read the full
 * chapter (the Context Bonus) additionally counts as "read" — the two-tier
 * credit system from the product concept doc.
 */
export async function recordVerseEngagement(reference: string, wasRead: boolean): Promise<void> {
  const state = await getProgressState();
  applyEngagement(state, reference, wasRead);
  await persist(state);
}

/**
 * Records several verses in one read-modify-write cycle. Always use this
 * (not parallel calls to recordVerseEngagement) when recording more than one
 * verse at a time — concurrent calls each read the same pre-write state and
 * only the last one to persist would otherwise survive.
 */
export async function recordVerseEngagements(entries: { reference: string; wasRead: boolean }[]): Promise<void> {
  const state = await getProgressState();
  for (const entry of entries) {
    applyEngagement(state, entry.reference, entry.wasRead);
  }
  await persist(state);
}

export interface BookSummary {
  name: string;
  testament: 'OT' | 'NT';
  group: BookGroup;
  totalChapters: number;
  touchedCount: number;
  readCount: number;
}

export interface ProgressSummary {
  books: BookSummary[];
  totalChaptersTouched: number;
  totalChaptersRead: number;
  otChaptersTouched: number;
  ntChaptersTouched: number;
  otPercentTouched: number;
  ntPercentTouched: number;
  booksTouchedCount: number;
  booksFullyTouchedCount: number;
  groupFullyTouched: Record<BookGroup, boolean>;
}

export function summarizeProgress(state: ProgressState): ProgressSummary {
  const books: BookSummary[] = BIBLE_BOOKS.map((b) => {
    const progress = state[b.name];
    return {
      name: b.name,
      testament: b.testament,
      group: b.group,
      totalChapters: b.chapters,
      touchedCount: progress?.touchedChapters.length ?? 0,
      readCount: progress?.readChapters.length ?? 0,
    };
  });

  const totalChaptersTouched = books.reduce((s, b) => s + b.touchedCount, 0);
  const totalChaptersRead = books.reduce((s, b) => s + b.readCount, 0);
  const otChaptersTouched = books.filter((b) => b.testament === 'OT').reduce((s, b) => s + b.touchedCount, 0);
  const ntChaptersTouched = books.filter((b) => b.testament === 'NT').reduce((s, b) => s + b.touchedCount, 0);
  const booksTouchedCount = books.filter((b) => b.touchedCount > 0).length;
  const booksFullyTouchedCount = books.filter((b) => b.touchedCount >= b.totalChapters).length;

  const groupFullyTouched = {} as Record<BookGroup, boolean>;
  for (const group of GROUP_ORDER) {
    const groupBooks = books.filter((b) => b.group === group);
    groupFullyTouched[group] = groupBooks.every((b) => b.touchedCount > 0);
  }

  return {
    books,
    totalChaptersTouched,
    totalChaptersRead,
    otChaptersTouched,
    ntChaptersTouched,
    otPercentTouched: OT_CHAPTERS > 0 ? otChaptersTouched / OT_CHAPTERS : 0,
    ntPercentTouched: NT_CHAPTERS > 0 ? ntChaptersTouched / NT_CHAPTERS : 0,
    booksTouchedCount,
    booksFullyTouchedCount,
    groupFullyTouched,
  };
}

export { TOTAL_CHAPTERS };
