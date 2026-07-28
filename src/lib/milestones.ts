import type { ProgressSummary } from '@/lib/bibleProgress';

export interface Milestone {
  id: string;
  label: string;
  isUnlocked: (summary: ProgressSummary) => boolean;
}

export const MILESTONES: Milestone[] = [
  { id: 'first-verse', label: 'First verse touched', isUnlocked: (s) => s.totalChaptersTouched >= 1 },
  { id: 'chapters-10', label: '10 chapters touched', isUnlocked: (s) => s.totalChaptersTouched >= 10 },
  { id: 'chapters-50', label: '50 chapters touched', isUnlocked: (s) => s.totalChaptersTouched >= 50 },
  { id: 'chapters-100', label: '100 chapters touched', isUnlocked: (s) => s.totalChaptersTouched >= 100 },
  { id: 'chapters-200', label: '200 chapters touched', isUnlocked: (s) => s.totalChaptersTouched >= 200 },
  { id: 'ot-25', label: 'Old Testament: 25% touched', isUnlocked: (s) => s.otPercentTouched >= 0.25 },
  { id: 'ot-50', label: 'Old Testament: 50% touched', isUnlocked: (s) => s.otPercentTouched >= 0.5 },
  { id: 'nt-25', label: 'New Testament: 25% touched', isUnlocked: (s) => s.ntPercentTouched >= 0.25 },
  { id: 'nt-50', label: 'New Testament: 50% touched', isUnlocked: (s) => s.ntPercentTouched >= 0.5 },
  {
    id: 'minor-prophets',
    label: 'Every book of the Minor Prophets touched',
    isUnlocked: (s) => s.groupFullyTouched['Minor Prophets'],
  },
  { id: 'gospels', label: 'All four Gospels touched', isUnlocked: (s) => s.groupFullyTouched['Gospels'] },
  {
    id: 'pauline',
    label: 'Every Pauline Epistle touched',
    isUnlocked: (s) => s.groupFullyTouched['Pauline Epistles'],
  },
  { id: 'every-book', label: 'Every book of the Bible touched', isUnlocked: (s) => s.booksTouchedCount >= 66 },
];
