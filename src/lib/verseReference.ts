import { BOOK_ALIASES, BOOKS_BY_NAME } from '@/data/bible-books';

export interface ParsedReference {
  book: string;
  chapter: number;
}

/**
 * Parses references like "Psalm 46:10", "2 Corinthians 4:8-9", "1 Samuel 25:18"
 * into a canonical book name + chapter number. Verse numbers and ranges are
 * ignored — progress is tracked at chapter granularity.
 */
export function parseVerseReference(reference: string): ParsedReference | null {
  const match = reference.trim().match(/^(.+?)\s+(\d+):\d+/);
  if (!match) return null;

  const rawBook = match[1].trim();
  const chapter = Number(match[2]);
  const canonicalBook = BOOK_ALIASES[rawBook] ?? rawBook;

  if (!BOOKS_BY_NAME.has(canonicalBook)) return null;
  return { book: canonicalBook, chapter };
}
