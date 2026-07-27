import rawQuestions from '@/data/seed/questions.json';
import { createSeededRandom, seededShuffle } from '@/lib/random';
import type { Category, Question, RawQuestion, VerseCandidate } from '@/types/content';

const CATEGORY_ORDER: Category[] = ['Fitness', 'Nutrition', 'Health', 'Science', 'Food'];

let cachedQuestions: Question[] | null = null;

/** Loads the seed question bank and assigns each question a stable id. */
export function loadQuestionBank(): Question[] {
  if (cachedQuestions) return cachedQuestions;
  cachedQuestions = (rawQuestions as RawQuestion[]).map((q, index) => ({
    ...q,
    id: `${q.category.toLowerCase()}-${index}`,
  }));
  return cachedQuestions;
}

/**
 * Picks one question per category, seeded by the day, so every user gets
 * the same 5 questions on a given calendar day and they change tomorrow.
 * Falls back gracefully if a category ever has zero questions.
 */
export function getDailyFive(dayKey: string): Question[] {
  const bank = loadQuestionBank();
  const rng = createSeededRandom(`daily-five:${dayKey}`);

  return CATEGORY_ORDER.map((category) => {
    const inCategory = bank.filter((q) => q.category === category);
    if (inCategory.length === 0) return null;
    const shuffled = seededShuffle(inCategory, rng);
    return shuffled[0];
  }).filter((q): q is Question => q !== null);
}

/**
 * Builds the Discernment Mode verse options for a question: the real clue
 * verse plus distractor verses pulled from other questions' verses. Only
 * the question's own verse is guaranteed to actually satisfy the Clarity
 * Test for this question, per the locked content rule.
 */
export function buildVerseCandidates(
  question: Question,
  dayKey: string,
  candidateCount: 2 | 3 | 4 = 3,
): VerseCandidate[] {
  const bank = loadQuestionBank();
  const rng = createSeededRandom(`verse-candidates:${dayKey}:${question.id}`);

  const correctCandidate: VerseCandidate = {
    id: `${question.id}-correct`,
    reference: question.verse_reference,
    text: question.verse_text,
    isCorrectClue: true,
  };

  const distractorPool = bank.filter(
    (q) => q.id !== question.id && q.verse_reference !== question.verse_reference,
  );
  const shuffledPool = seededShuffle(distractorPool, rng);

  const distractors: VerseCandidate[] = shuffledPool.slice(0, candidateCount - 1).map((q, i) => ({
    id: `${question.id}-distractor-${i}`,
    reference: q.verse_reference,
    text: q.verse_text,
    isCorrectClue: false,
  }));

  return seededShuffle([correctCandidate, ...distractors], rng);
}
