import { useRouter } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnswerOption } from '@/components/quiz/answer-option';
import { ProgressDots } from '@/components/quiz/progress-dots';
import { VerseCandidateCard } from '@/components/quiz/verse-candidate-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { getProgressState, recordVerseEngagements, summarizeProgress } from '@/lib/bibleProgress';
import { MILESTONES } from '@/lib/milestones';
import { cancelStreakRiskNotification, presentMilestoneNotification, scheduleReengagementReminder } from '@/lib/notifications';
import { todayKey } from '@/lib/random';
import { recordDailyCompletion } from '@/lib/streak';
import { Spacing } from '@/constants/theme';
import { useQuizSession } from '@/store/quizSession';

export default function QuizScreen() {
  const router = useRouter();
  const theme = useTheme();

  const {
    dayKey,
    questions,
    verseCandidatesByQuestion,
    currentIndex,
    results,
    pendingAnswer,
    pendingVerseId,
    locked,
    status,
    startSession,
    selectAnswer,
    selectVerse,
    submitCurrent,
    markChapterRead,
    goToNext,
  } = useQuizSession();

  useEffect(() => {
    if (status === 'idle') {
      startSession(todayKey());
    }
  }, [status, startSession]);

  useEffect(() => {
    if (status !== 'complete' || !dayKey) return;

    (async () => {
      const entries = questions.map((q) => {
        const result = results.find((r) => r.questionId === q.id);
        return { reference: q.verse_reference, wasRead: result?.chapterRead ?? false };
      });

      const beforeSummary = summarizeProgress(await getProgressState());
      const unlockedBefore = new Set(MILESTONES.filter((m) => m.isUnlocked(beforeSummary)).map((m) => m.id));

      await Promise.all([recordDailyCompletion(dayKey), recordVerseEngagements(entries)]);

      const afterSummary = summarizeProgress(await getProgressState());
      const newlyUnlocked = MILESTONES.filter((m) => !unlockedBefore.has(m.id) && m.isUnlocked(afterSummary));

      await cancelStreakRiskNotification();
      await scheduleReengagementReminder();
      for (const milestone of newlyUnlocked) {
        await presentMilestoneNotification(milestone.label);
      }

      router.replace('/quiz/results');
    })();
  }, [status, dayKey, router, questions, results]);

  if (status === 'idle' || questions.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.centered}>
          <ThemedText>Loading today's 5...</ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (status === 'complete') {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.centered}>
          <ThemedText>Finishing up...</ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const question = questions[currentIndex];
  const candidates = verseCandidatesByQuestion[question.id] ?? [];
  const currentResult = results[currentIndex];
  const canSubmit = pendingAnswer !== null && pendingVerseId !== null && !locked;
  const isLastQuestion = currentIndex === questions.length - 1;

  const openChapter = async () => {
    const url = `https://www.biblegateway.com/passage/?search=${encodeURIComponent(
      question.verse_reference,
    )}&version=KJV`;
    markChapterRead();
    await openBrowserAsync(url);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ProgressDots total={questions.length} currentIndex={currentIndex} />

          <ThemedView type="backgroundElement" style={styles.categoryTag}>
            <ThemedText type="smallBold">{question.category}</ThemedText>
          </ThemedView>

          <ThemedText type="subtitle">{question.question}</ThemedText>

          <View style={styles.optionsGroup}>
            {question.options.map((option) => (
              <AnswerOption
                key={option}
                label={option}
                selected={pendingAnswer === option}
                locked={locked}
                isCorrectAnswer={option === question.correct_answer}
                onPress={() => selectAnswer(option)}
              />
            ))}
          </View>

          <View style={styles.verseSection}>
            <ThemedText type="smallBold">Which verse is the real clue?</ThemedText>
            <View style={styles.verseGroup}>
              {candidates.map((candidate) => (
                <VerseCandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  selected={pendingVerseId === candidate.id}
                  locked={locked}
                  onPress={() => selectVerse(candidate.id)}
                  echoWord={question.echo_word}
                  echoStrength={question.echo_strength}
                />
              ))}
            </View>
          </View>

          {locked && currentResult && (
            <View style={styles.resultSection}>
              <ThemedText type="default" themeColor={currentResult.isAnswerCorrect ? 'success' : 'danger'}>
                {currentResult.isAnswerCorrect ? 'Correct!' : `Not quite — the answer was "${question.correct_answer}."`}
              </ThemedText>
              <ThemedText type="small" themeColor={currentResult.isVerseCorrect ? 'success' : 'textSecondary'}>
                {currentResult.isVerseCorrect
                  ? '+ Discernment bonus for spotting the right clue verse.'
                  : "That wasn't the clue verse this time — no discernment bonus."}
              </ThemedText>

              <Pressable onPress={openChapter} style={styles.chapterLink}>
                <ThemedText type="linkPrimary">
                  {currentResult.chapterRead ? '✓ Opened the full chapter' : 'Read the full chapter →'}
                </ThemedText>
              </Pressable>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          {!locked ? (
            <Pressable
              onPress={submitCurrent}
              disabled={!canSubmit}
              style={[styles.primaryButton, { backgroundColor: canSubmit ? theme.primary : theme.backgroundElement }]}>
              <ThemedText type="default" style={{ color: canSubmit ? theme.onPrimary : theme.textSecondary }}>
                Lock In Answer
              </ThemedText>
            </Pressable>
          ) : (
            <Pressable onPress={goToNext} style={[styles.primaryButton, { backgroundColor: theme.primary }]}>
              <ThemedText type="default" style={{ color: theme.onPrimary }}>
                {isLastQuestion ? 'See Results' : 'Next Question'}
              </ThemedText>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 999,
  },
  optionsGroup: {
    gap: Spacing.two,
  },
  verseSection: {
    gap: Spacing.two,
  },
  verseGroup: {
    gap: Spacing.two,
  },
  resultSection: {
    gap: Spacing.one,
    paddingTop: Spacing.two,
  },
  chapterLink: {
    marginTop: Spacing.two,
  },
  footer: {
    padding: Spacing.four,
  },
  primaryButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
});
