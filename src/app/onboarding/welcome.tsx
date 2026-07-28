import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand-mark';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function OnboardingWelcomeScreen() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.hero}>
          <BrandMark size={88} />
          <ThemedText type="title" style={styles.title}>
            PrayFit Trivia
          </ThemedText>
          <ThemedText type="default" themeColor="textSecondary" style={styles.subtitle}>
            A daily 5-question trivia game where the Bible verse is the clue — not decoration.
          </ThemedText>
        </View>

        <ThemedView type="backgroundElement" style={styles.verseCard}>
          <ThemedText type="default" style={styles.verseText}>
            "Whatever you do, work at it with all your heart, as working for the Lord, not for human
            masters,"
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Colossians 3:23, NIV
          </ThemedText>
        </ThemedView>

        <Pressable
          onPress={() => router.push('/onboarding/notifications')}
          style={[styles.primaryButton, { backgroundColor: theme.primary }]}>
          <ThemedText type="default" style={{ color: theme.onPrimary }}>
            Get Started
          </ThemedText>
        </Pressable>
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
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    paddingHorizontal: Spacing.three,
  },
  verseCard: {
    borderRadius: 16,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  verseText: {
    fontStyle: 'italic',
  },
  primaryButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
});
