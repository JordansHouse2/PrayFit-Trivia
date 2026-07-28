import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getStreakState, type StreakState } from '@/lib/streak';
import { useQuizSession } from '@/store/quizSession';

export default function ResultsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { questions, results, resetSession } = useQuizSession();
  const [streak, setStreak] = useState<StreakState | null>(null);

  useEffect(() => {
    getStreakState().then(setStreak);
  }, []);

  const correctCount = results.filter((r) => r.isAnswerCorrect).length;
  const totalPoints = results.reduce((sum, r) => sum + r.pointsEarned, 0);
  const versesRead = results.filter((r) => r.chapterRead).length;

  const goHome = () => {
    resetSession();
    // dismissTo (not replace) so this pops back to the single existing Home
    // instance instead of stacking a second one underneath it.
    router.dismissTo('/');
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="title" style={styles.centerText}>
            {correctCount}/{questions.length}
          </ThemedText>
          <ThemedText type="default" themeColor="textSecondary" style={styles.centerText}>
            {totalPoints} points earned today
          </ThemedText>

          {streak && (
            <ThemedView type="backgroundElement" style={styles.streakCard}>
              <ThemedText type="subtitle" themeColor="primary" style={styles.centerText}>
                🔥 {streak.count}-day streak
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
                +1 day for showing up today
              </ThemedText>
            </ThemedView>
          )}

          <ThemedView type="backgroundElement" style={styles.versesCard}>
            <ThemedText type="smallBold">Today's verses</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {questions.length} touched · {versesRead} read in full
            </ThemedText>
            <View style={styles.verseList}>
              {questions.map((q) => {
                const result = results.find((r) => r.questionId === q.id);
                return (
                  <View key={q.id} style={styles.verseRow}>
                    <ThemedText type="small">{q.verse_reference}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {result?.chapterRead ? 'Read' : 'Touched'}
                    </ThemedText>
                  </View>
                );
              })}
            </View>
          </ThemedView>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable onPress={goHome} style={[styles.primaryButton, { backgroundColor: theme.primary }]}>
            <ThemedText type="default" style={{ color: theme.onPrimary }}>
              Back to Home
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  centerText: {
    textAlign: 'center',
  },
  streakCard: {
    borderRadius: 16,
    padding: Spacing.four,
    gap: Spacing.one,
  },
  versesCard: {
    borderRadius: 16,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  verseList: {
    gap: Spacing.one,
    marginTop: Spacing.two,
  },
  verseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
