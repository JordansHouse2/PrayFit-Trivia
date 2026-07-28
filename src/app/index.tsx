import { useFocusEffect, useRouter } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand-mark';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { NIV_ATTRIBUTION } from '@/constants/attribution';
import { Spacing } from '@/constants/theme';
import { TOTAL_CHAPTERS } from '@/data/bible-books';
import { useTheme } from '@/hooks/use-theme';
import { getProgressState, summarizeProgress, type ProgressSummary } from '@/lib/bibleProgress';
import { todayKey } from '@/lib/random';
import { getStreakState, type StreakState } from '@/lib/streak';

const DONATE_URL = 'https://www.prayfit.org/?form=donate';

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [streak, setStreak] = useState<StreakState | null>(null);
  const [completedToday, setCompletedToday] = useState(false);
  const [progressSummary, setProgressSummary] = useState<ProgressSummary | null>(null);

  useFocusEffect(
    useCallback(() => {
      getStreakState().then((state) => {
        setStreak(state);
        setCompletedToday(state.lastCompletedDate === todayKey());
      });
      getProgressState().then((state) => setProgressSummary(summarizeProgress(state)));
    }, []),
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerRow}>
          <BrandMark size={44} />
          <Pressable
            onPress={() => openBrowserAsync(DONATE_URL)}
            style={[styles.donateButton, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <ThemedText type="smallBold" themeColor="primary">
              🤍 Donate
            </ThemedText>
          </Pressable>
        </View>

        <ThemedText type="title" style={styles.title}>
          PrayFit Trivia
        </ThemedText>

        <ThemedView type="backgroundElement" style={styles.statusCard}>
          <ThemedText type="subtitle">{completedToday ? 'Completed for today' : "Today's 5 are ready"}</ThemedText>
          <ThemedText type="default" themeColor="textSecondary">
            {completedToday ? 'Come back tomorrow for your next 5.' : 'Fitness, Nutrition, Health, Science, Food.'}
          </ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.streakCard}>
          <ThemedText type="title" themeColor="primary">
            🔥 {streak?.count ?? 0}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            day streak
          </ThemedText>
        </ThemedView>

        <Pressable onPress={() => router.push('/progress')}>
          <ThemedView type="backgroundElement" style={styles.progressPreview}>
            <ThemedText type="smallBold">Bible Progress Tracker</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {progressSummary
                ? `${progressSummary.booksTouchedCount}/66 books · ${progressSummary.totalChaptersTouched}/${TOTAL_CHAPTERS} chapters touched`
                : 'Loading...'}
            </ThemedText>
          </ThemedView>
        </Pressable>

        <Pressable
          onPress={() => router.push('/quiz')}
          disabled={completedToday}
          style={[styles.primaryButton, { backgroundColor: completedToday ? theme.backgroundElement : theme.primary }]}>
          <ThemedText type="default" style={{ color: completedToday ? theme.textSecondary : theme.onPrimary }}>
            {completedToday ? 'See you tomorrow' : "Start Today's 5"}
          </ThemedText>
        </Pressable>

        <ThemedText type="small" themeColor="textSecondary" style={styles.attribution}>
          {NIV_ATTRIBUTION}
        </ThemedText>
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
    padding: Spacing.four,
    gap: Spacing.four,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
  },
  donateButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  title: {
    textAlign: 'center',
  },
  statusCard: {
    borderRadius: 16,
    padding: Spacing.four,
    gap: Spacing.one,
  },
  streakCard: {
    borderRadius: 16,
    padding: Spacing.four,
    alignItems: 'center',
  },
  progressPreview: {
    borderRadius: 16,
    padding: Spacing.four,
    gap: Spacing.one,
  },
  primaryButton: {
    marginTop: 'auto',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  attribution: {
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 15,
  },
});
