import { create } from 'zustand';

import { buildVerseCandidates, getDailyFive } from '@/lib/quizEngine';
import { SCORING } from '@/lib/scoring';
import type { Question, VerseCandidate } from '@/types/content';
import type { QuestionResult, SessionStatus } from '@/types/quiz';

interface QuizSessionState {
  dayKey: string | null;
  questions: Question[];
  verseCandidatesByQuestion: Record<string, VerseCandidate[]>;
  currentIndex: number;
  results: QuestionResult[];
  pendingAnswer: string | null;
  pendingVerseId: string | null;
  locked: boolean;
  status: SessionStatus;

  startSession: (dayKey: string) => void;
  selectAnswer: (answer: string) => void;
  selectVerse: (verseId: string) => void;
  submitCurrent: () => void;
  markChapterRead: () => void;
  goToNext: () => void;
  resetSession: () => void;
}

const initialSessionFields = {
  dayKey: null,
  questions: [],
  verseCandidatesByQuestion: {},
  currentIndex: 0,
  results: [],
  pendingAnswer: null,
  pendingVerseId: null,
  locked: false,
  status: 'idle' as SessionStatus,
};

export const useQuizSession = create<QuizSessionState>((set, get) => ({
  ...initialSessionFields,

  startSession: (dayKey) => {
    const questions = getDailyFive(dayKey);
    const verseCandidatesByQuestion: Record<string, VerseCandidate[]> = {};
    for (const q of questions) {
      verseCandidatesByQuestion[q.id] = buildVerseCandidates(q, dayKey);
    }
    set({
      ...initialSessionFields,
      dayKey,
      questions,
      verseCandidatesByQuestion,
      status: 'in-progress',
    });
  },

  selectAnswer: (answer) => {
    if (get().locked) return;
    set({ pendingAnswer: answer });
  },

  selectVerse: (verseId) => {
    if (get().locked) return;
    set({ pendingVerseId: verseId });
  },

  submitCurrent: () => {
    const { questions, currentIndex, pendingAnswer, pendingVerseId, verseCandidatesByQuestion, locked } = get();
    if (locked) return;
    const question = questions[currentIndex];
    if (!question || pendingAnswer === null || pendingVerseId === null) return;

    const isAnswerCorrect = pendingAnswer === question.correct_answer;
    const candidates = verseCandidatesByQuestion[question.id] ?? [];
    const isVerseCorrect = candidates.find((c) => c.id === pendingVerseId)?.isCorrectClue ?? false;

    const pointsEarned =
      (isAnswerCorrect ? SCORING.BASE_POINTS_CORRECT : 0) + (isVerseCorrect ? SCORING.DISCERNMENT_BONUS : 0);

    const result: QuestionResult = {
      questionId: question.id,
      selectedAnswer: pendingAnswer,
      isAnswerCorrect,
      selectedVerseId: pendingVerseId,
      isVerseCorrect,
      chapterRead: false,
      pointsEarned,
    };

    set((state) => ({
      results: [...state.results, result],
      locked: true,
    }));
  },

  markChapterRead: () => {
    const { currentIndex, results } = get();
    if (results.length <= currentIndex) return;
    set((state) => ({
      results: state.results.map((r, i) =>
        i === currentIndex ? { ...r, chapterRead: true, pointsEarned: r.pointsEarned } : r,
      ),
    }));
  },

  goToNext: () => {
    const { locked, currentIndex, questions } = get();
    if (!locked) return;
    if (currentIndex + 1 < questions.length) {
      set({ currentIndex: currentIndex + 1, pendingAnswer: null, pendingVerseId: null, locked: false });
    } else {
      set({ status: 'complete' });
    }
  },

  resetSession: () => set({ ...initialSessionFields }),
}));
