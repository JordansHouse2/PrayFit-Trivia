import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { setOnboardingComplete } from '@/lib/onboarding';
import { setNotificationSettings } from '@/lib/notificationSettings';
import { requestNotificationPermissions, scheduleDailyReminder } from '@/lib/notifications';

const TIME_PRESETS: { label: string; hour: number; minute: number }[] = [
  { label: '6:00 AM', hour: 6, minute: 0 },
  { label: '7:00 AM', hour: 7, minute: 0 },
  { label: '8:00 AM', hour: 8, minute: 0 },
  { label: '12:00 PM', hour: 12, minute: 0 },
  { label: '6:00 PM', hour: 18, minute: 0 },
  { label: '8:00 PM', hour: 20, minute: 0 },
];

export default function OnboardingNotificationsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [selected, setSelected] = useState(TIME_PRESETS[1]); // 7:00 AM default
  const [requesting, setRequesting] = useState(false);

  const finish = async () => {
    await setOnboardingComplete();
    router.replace('/');
  };

  const enableReminders = async () => {
    setRequesting(true);
    try {
      const granted = await requestNotificationPermissions();
      if (granted) {
        await setNotificationSettings({ enabled: true, reminderHour: selected.hour, reminderMinute: selected.minute });
        await scheduleDailyReminder(selected.hour, selected.minute);
      }
      await finish();
    } finally {
      setRequesting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <ThemedText type="title" style={styles.title}>
            Never Miss Your 5
          </ThemedText>
          <ThemedText type="default" themeColor="textSecondary" style={styles.body}>
            One reminder a day, timed to when you'd actually play — not a generic notification blast. You
            can turn this off anytime in Settings.
          </ThemedText>

          <View style={styles.presetGrid}>
            {TIME_PRESETS.map((preset) => {
              const isSelected = preset.label === selected.label;
              return (
                <Pressable
                  key={preset.label}
                  onPress={() => setSelected(preset)}
                  style={[
                    styles.presetChip,
                    {
                      backgroundColor: isSelected ? theme.primary : theme.backgroundElement,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}>
                  <ThemedText type="default" style={{ color: isSelected ? theme.onPrimary : theme.text }}>
                    {preset.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable
            onPress={enableReminders}
            disabled={requesting}
            style={[styles.primaryButton, { backgroundColor: theme.primary }]}>
            <ThemedText type="default" style={{ color: theme.onPrimary }}>
              Enable Reminders
            </ThemedText>
          </Pressable>
          <Pressable onPress={finish} style={styles.skipButton}>
            <ThemedText type="small" themeColor="textSecondary">
              Skip for now
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
    padding: Spacing.four,
    justifyContent: 'space-between',
  },
  content: {
    gap: Spacing.four,
    marginTop: Spacing.six,
  },
  title: {
    textAlign: 'center',
  },
  body: {
    textAlign: 'center',
    paddingHorizontal: Spacing.two,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    justifyContent: 'center',
  },
  presetChip: {
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  footer: {
    gap: Spacing.three,
  },
  primaryButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
});
