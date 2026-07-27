export interface QuestionResult {
  questionId: string;
  selectedAnswer: string | null;
  isAnswerCorrect: boolean;
  selectedVerseId: string | null;
  isVerseCorrect: boolean;
  chapterRead: boolean;
  pointsEarned: number;
}

export type SessionStatus = 'idle' | 'in-progress' | 'complete';
