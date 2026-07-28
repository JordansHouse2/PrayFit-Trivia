import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { GROUP_ORDER, TOTAL_CHAPTERS } from '@/data/bible-books';
import { getProgressState, summarizeProgress, type ProgressSummary } from '@/lib/bibleProgress';
import { MILESTONES } from '@/lib/milestones';

function ProgressBar({ fraction }: { fraction: number }) {
  const theme = useTheme();
  return (
    <View style={[styles.barTrack, { backgroundColor: theme.backgroundElement }]}>
      <View
        style={[
          styles.barFill,
          { backgroundColor: theme.primary, width: `${Math.min(100, Math.round(fraction * 100))}%` },
        ]}
      />
    </View>
  );
}

export default function ProgressScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [summary, setSummary] = useState<ProgressSummary | null>(null);

  useFocusEffect(
    useCallback(() => {
      getProgressState().then((state) => setSummary(summarizeProgress(state)));
    }, []),
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <ThemedText type="linkPrimary" themeColor="primary">
              ← Back
            </ThemedText>
          </Pressable>
          <ThemedText type="smallBold">Bible Progress Tracker</ThemedText>
          <View style={{ width: 44 }} />
        </View>

        {!summary ? (
          <ThemedText style={styles.centerPad}>Loading...</ThemedText>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <ThemedView type="backgroundElement" style={styles.summaryCard}>
              <ThemedText type="title">{summary.totalChaptersTouched}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                of {TOTAL_CHAPTERS} chapters touched · {summary.totalChaptersRead} read in full
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.booksLine}>
                {summary.booksTouchedCount}/66 books touched · {summary.booksFullyTouchedCount} fully touched
              </ThemedText>
            </ThemedView>

            <View style={styles.testamentRow}>
              <View style={styles.testamentCard}>
                <ThemedText type="smallBold">Old Testament</ThemedText>
                <ProgressBar fraction={summary.otPercentTouched} />
                <ThemedText type="small" themeColor="textSecondary">
                  {Math.round(summary.otPercentTouched * 100)}% touched
                </ThemedText>
              </View>
              <View style={styles.testamentCard}>
                <ThemedText type="smallBold">New Testament</ThemedText>
                <ProgressBar fraction={summary.ntPercentTouched} />
                <ThemedText type="small" themeColor="textSecondary">
                  {Math.round(summary.ntPercentTouched * 100)}% touched
                </ThemedText>
              </View>
            </View>

            {GROUP_ORDER.map((group) => {
              const groupBooks = summary.books.filter((b) => b.group === group);
              return (
                <View key={group} style={styles.groupSection}>
                  <ThemedText type="smallBold" themeColor="textSecondary">
                    {group}
                  </ThemedText>
                  <View style={styles.chipRow}>
                    {groupBooks.map((book) => {
                      const isRead = book.readCount > 0;
                      const isTouched = book.touchedCount > 0;
                      const backgroundColor = isRead
                        ? theme.primary
                        : isTouched
                          ? theme.backgroundSelected
                          : theme.backgroundElement;
                      const textColor = isRead ? theme.onPrimary : isTouched ? theme.text : theme.textSecondary;
                      return (
                        <View key={book.name} style={[styles.chip, { backgroundColor, borderColor: theme.border }]}>
                          <ThemedText type="small" style={{ color: textColor }}>
                            {book.name}
                          </ThemedText>
                          <ThemedText type="small" style={{ color: textColor, opacity: 0.7 }}>
                            {book.touchedCount}/{book.totalChapters}
                          </ThemedText>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}

            <View style={styles.groupSection}>
              <ThemedText type="smallBold" themeColor="textSecondary">
                Milestones
              </ThemedText>
              <View style={styles.milestoneList}>
                {MILESTONES.map((m) => {
                  const unlocked = m.isUnlocked(summary);
                  return (
                    <View key={m.id} style={styles.milestoneRow}>
                      <ThemedText type="default" style={{ opacity: unlocked ? 1 : 0.35 }}>
                        {unlocked ? '✓' : '○'}
                      </ThemedText>
                      <ThemedText
                        type="default"
                        themeColor={unlocked ? 'text' : 'textSecondary'}
                        style={{ opacity: unlocked ? 1 : 0.6 }}>
                        {m.label}
                      </ThemedText>
                    </View>
                  );
                })}
              </View>
            </View>
          </ScrollView>
        )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  centerPad: {
    padding: Spacing.four,
    textAlign: 'center',
  },
  scrollContent: {
    padding: Spacing.four,
    gap: Spacing.four,
    paddingBottom: Spacing.six,
  },
  summaryCard: {
    borderRadius: 16,
    padding: Spacing.four,
    alignItems: 'center',
    gap: Spacing.half,
  },
  booksLine: {
    marginTop: Spacing.one,
  },
  testamentRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  testamentCard: {
    flex: 1,
    gap: Spacing.two,
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: 8,
    borderRadius: 4,
  },
  groupSection: {
    gap: Spacing.two,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    flexDirection: 'row',
    gap: Spacing.one,
    alignItems: 'baseline',
  },
  milestoneList: {
    gap: Spacing.two,
  },
  milestoneRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
});
