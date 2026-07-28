export type Testament = 'OT' | 'NT';

/** Standard groupings used for milestone language ("Every book of the Minor Prophets touched"). */
export type BookGroup =
  | 'Law'
  | 'History'
  | 'Wisdom'
  | 'Major Prophets'
  | 'Minor Prophets'
  | 'Gospels'
  | 'Acts'
  | 'Pauline Epistles'
  | 'General Epistles'
  | 'Revelation';

export interface BibleBook {
  name: string;
  testament: Testament;
  group: BookGroup;
  chapters: number;
}

/** All 66 books, in canonical order, with real chapter counts (929 OT + 260 NT = 1189 total). */
export const BIBLE_BOOKS: BibleBook[] = [
  // Law
  { name: 'Genesis', testament: 'OT', group: 'Law', chapters: 50 },
  { name: 'Exodus', testament: 'OT', group: 'Law', chapters: 40 },
  { name: 'Leviticus', testament: 'OT', group: 'Law', chapters: 27 },
  { name: 'Numbers', testament: 'OT', group: 'Law', chapters: 36 },
  { name: 'Deuteronomy', testament: 'OT', group: 'Law', chapters: 34 },
  // History
  { name: 'Joshua', testament: 'OT', group: 'History', chapters: 24 },
  { name: 'Judges', testament: 'OT', group: 'History', chapters: 21 },
  { name: 'Ruth', testament: 'OT', group: 'History', chapters: 4 },
  { name: '1 Samuel', testament: 'OT', group: 'History', chapters: 31 },
  { name: '2 Samuel', testament: 'OT', group: 'History', chapters: 24 },
  { name: '1 Kings', testament: 'OT', group: 'History', chapters: 22 },
  { name: '2 Kings', testament: 'OT', group: 'History', chapters: 25 },
  { name: '1 Chronicles', testament: 'OT', group: 'History', chapters: 29 },
  { name: '2 Chronicles', testament: 'OT', group: 'History', chapters: 36 },
  { name: 'Ezra', testament: 'OT', group: 'History', chapters: 10 },
  { name: 'Nehemiah', testament: 'OT', group: 'History', chapters: 13 },
  { name: 'Esther', testament: 'OT', group: 'History', chapters: 10 },
  // Wisdom
  { name: 'Job', testament: 'OT', group: 'Wisdom', chapters: 42 },
  { name: 'Psalms', testament: 'OT', group: 'Wisdom', chapters: 150 },
  { name: 'Proverbs', testament: 'OT', group: 'Wisdom', chapters: 31 },
  { name: 'Ecclesiastes', testament: 'OT', group: 'Wisdom', chapters: 12 },
  { name: 'Song of Solomon', testament: 'OT', group: 'Wisdom', chapters: 8 },
  // Major Prophets
  { name: 'Isaiah', testament: 'OT', group: 'Major Prophets', chapters: 66 },
  { name: 'Jeremiah', testament: 'OT', group: 'Major Prophets', chapters: 52 },
  { name: 'Lamentations', testament: 'OT', group: 'Major Prophets', chapters: 5 },
  { name: 'Ezekiel', testament: 'OT', group: 'Major Prophets', chapters: 48 },
  { name: 'Daniel', testament: 'OT', group: 'Major Prophets', chapters: 12 },
  // Minor Prophets
  { name: 'Hosea', testament: 'OT', group: 'Minor Prophets', chapters: 14 },
  { name: 'Joel', testament: 'OT', group: 'Minor Prophets', chapters: 3 },
  { name: 'Amos', testament: 'OT', group: 'Minor Prophets', chapters: 9 },
  { name: 'Obadiah', testament: 'OT', group: 'Minor Prophets', chapters: 1 },
  { name: 'Jonah', testament: 'OT', group: 'Minor Prophets', chapters: 4 },
  { name: 'Micah', testament: 'OT', group: 'Minor Prophets', chapters: 7 },
  { name: 'Nahum', testament: 'OT', group: 'Minor Prophets', chapters: 3 },
  { name: 'Habakkuk', testament: 'OT', group: 'Minor Prophets', chapters: 3 },
  { name: 'Zephaniah', testament: 'OT', group: 'Minor Prophets', chapters: 3 },
  { name: 'Haggai', testament: 'OT', group: 'Minor Prophets', chapters: 2 },
  { name: 'Zechariah', testament: 'OT', group: 'Minor Prophets', chapters: 14 },
  { name: 'Malachi', testament: 'OT', group: 'Minor Prophets', chapters: 4 },
  // Gospels
  { name: 'Matthew', testament: 'NT', group: 'Gospels', chapters: 28 },
  { name: 'Mark', testament: 'NT', group: 'Gospels', chapters: 16 },
  { name: 'Luke', testament: 'NT', group: 'Gospels', chapters: 24 },
  { name: 'John', testament: 'NT', group: 'Gospels', chapters: 21 },
  // Acts
  { name: 'Acts', testament: 'NT', group: 'Acts', chapters: 28 },
  // Pauline Epistles
  { name: 'Romans', testament: 'NT', group: 'Pauline Epistles', chapters: 16 },
  { name: '1 Corinthians', testament: 'NT', group: 'Pauline Epistles', chapters: 16 },
  { name: '2 Corinthians', testament: 'NT', group: 'Pauline Epistles', chapters: 13 },
  { name: 'Galatians', testament: 'NT', group: 'Pauline Epistles', chapters: 6 },
  { name: 'Ephesians', testament: 'NT', group: 'Pauline Epistles', chapters: 6 },
  { name: 'Philippians', testament: 'NT', group: 'Pauline Epistles', chapters: 4 },
  { name: 'Colossians', testament: 'NT', group: 'Pauline Epistles', chapters: 4 },
  { name: '1 Thessalonians', testament: 'NT', group: 'Pauline Epistles', chapters: 5 },
  { name: '2 Thessalonians', testament: 'NT', group: 'Pauline Epistles', chapters: 3 },
  { name: '1 Timothy', testament: 'NT', group: 'Pauline Epistles', chapters: 6 },
  { name: '2 Timothy', testament: 'NT', group: 'Pauline Epistles', chapters: 4 },
  { name: 'Titus', testament: 'NT', group: 'Pauline Epistles', chapters: 3 },
  { name: 'Philemon', testament: 'NT', group: 'Pauline Epistles', chapters: 1 },
  // General Epistles
  { name: 'Hebrews', testament: 'NT', group: 'General Epistles', chapters: 13 },
  { name: 'James', testament: 'NT', group: 'General Epistles', chapters: 5 },
  { name: '1 Peter', testament: 'NT', group: 'General Epistles', chapters: 5 },
  { name: '2 Peter', testament: 'NT', group: 'General Epistles', chapters: 3 },
  { name: '1 John', testament: 'NT', group: 'General Epistles', chapters: 5 },
  { name: '2 John', testament: 'NT', group: 'General Epistles', chapters: 1 },
  { name: '3 John', testament: 'NT', group: 'General Epistles', chapters: 1 },
  { name: 'Jude', testament: 'NT', group: 'General Epistles', chapters: 1 },
  // Revelation
  { name: 'Revelation', testament: 'NT', group: 'Revelation', chapters: 22 },
];

/** Aliases from verse_reference book spellings (e.g. seed data uses "Psalm") to the canonical name above. */
export const BOOK_ALIASES: Record<string, string> = {
  Psalm: 'Psalms',
  'Song of Songs': 'Song of Solomon',
  Canticles: 'Song of Solomon',
};

export const BOOKS_BY_NAME = new Map(BIBLE_BOOKS.map((b) => [b.name, b]));

export const GROUP_ORDER: BookGroup[] = [
  'Law',
  'History',
  'Wisdom',
  'Major Prophets',
  'Minor Prophets',
  'Gospels',
  'Acts',
  'Pauline Epistles',
  'General Epistles',
  'Revelation',
];

export const TOTAL_CHAPTERS = BIBLE_BOOKS.reduce((sum, b) => sum + b.chapters, 0);
export const OT_CHAPTERS = BIBLE_BOOKS.filter((b) => b.testament === 'OT').reduce((s, b) => s + b.chapters, 0);
export const NT_CHAPTERS = BIBLE_BOOKS.filter((b) => b.testament === 'NT').reduce((s, b) => s + b.chapters, 0);
