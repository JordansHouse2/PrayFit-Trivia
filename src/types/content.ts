export type Category = 'Fitness' | 'Nutrition' | 'Health' | 'Science' | 'Food';
export type EchoStrength = 'direct' | 'thematic';
export type Difficulty = 'easy' | 'medium' | 'hard';

/** Raw shape as produced by the content-generation prompt / JSON seed files. */
export interface RawQuestion {
  category: Category;
  question: string;
  options: string[];
  correct_answer: string;
  verse_reference: string;
  verse_text: string;
  echo_word: string;
  echo_strength: EchoStrength;
  difficulty: Difficulty;
}

/** Question with a stable id assigned once loaded into the app. */
export interface Question extends RawQuestion {
  id: string;
}

/** A verse shown on the discernment step — one per question is the valid clue. */
export interface VerseCandidate {
  id: string;
  reference: string;
  text: string;
  isCorrectClue: boolean;
}
