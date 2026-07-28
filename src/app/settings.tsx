import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { signOut } from '@/lib/auth';
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  getNotificationSettings,
  setNotificationSettings,
  type NotificationSettings,
} from '@/lib/notificationSettings';
import { cancelDailyReminder, requestNotificationPermissions, scheduleDailyReminder } from '@/lib/notifications';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useAuthSession } from '@/store/authSession';

const TIME_PRESETS: { label: string; hour: number; minute: number }[] = [
  { label: '6:00 AM', hour: 6, minute: 0 },
  { label: '7:00 AM', hour: 7, minute: 0 },
  { label: '8:00 AM', hour: 8, minute: 0 },
  { label: '12:00 PM', hour: 12, minute: 0 },
  { label: '6:00 PM', hour: 18, minute: 0 },
  { label: '8:00 PM', hour: 20, minute: 0 },
];

export default function SettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [settings, setSettingsState] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const session = useAuthSession((s) => s.session);

  useFocusEffect(
    useCallback(() => {
      getNotificationSettings().then(setSettingsState);
    }, []),
  );

  const toggleEnabled = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestNotificationPermissions();
      if (!granted) return;
      const next = { ...settings, enabled: true };
      setSettingsState(next);
      await setNotificationSettings(next);
      await scheduleDailyReminder(next.reminderHour, next.reminderMinute);
    } else {
      const next = { ...settings, enabled: false };
      setSettingsState(next);
      await setNotificationSettings(next);
      await cancelDailyReminder();
    }
  };

  const selectTime = async (hour: number, minute: number) => {
    const next = { ...settings, reminderHour: hour, reminderMinute: minute };
    setSettingsState(next);
    await setNotificationSettings(next);
    if (next.enabled) {
      await scheduleDailyReminder(hour, minute);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <ThemedText type="linkPrimary" themeColor="primary">
              ← Back
            </ThemedText>
          </Pressable>
          <ThemedText type="smallBold">Settings</ThemedText>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.content}>
          <ThemedView type="backgroundElement" style={styles.section}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleLabel}>
                <ThemedText type="default">Daily reminder</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  "Your 5 are ready" at your chosen time
                </ThemedText>
              </View>
              <Switch value={settings.enabled} onValueChange={toggleEnabled} />
            </View>

            {settings.enabled && (
              <View style={styles.presetGrid}>
                {TIME_PRESETS.map((preset) => {
                  const isSelected = preset.hour === settings.reminderHour && preset.minute === settings.reminderMinute;
                  return (
                    <Pressable
                      key={preset.label}
                      onPress={() => selectTime(preset.hour, preset.minute)}
                      style={[
                        styles.presetChip,
                        {
                          backgroundColor: isSelected ? theme.primary : theme.background,
                          borderColor: isSelected ? theme.primary : theme.border,
                        },
                      ]}>
                      <ThemedText type="small" style={{ color: isSelected ? theme.onPrimary : theme.text }}>
                        {preset.label}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </ThemedView>

          {isSupabaseConfigured && (
            <ThemedView type="backgroundElement" style={styles.section}>
              <ThemedText type="default">Account</ThemedText>
              {session ? (
                <>
                  <ThemedText type="small" themeColor="textSecondary">
                    Signed in as {session.user.email}
                  </ThemedText>
                  <Pressable onPress={() => signOut()}>
                    <ThemedText type="linkPrimary" themeColor="danger">
                      Sign Out
                    </ThemedText>
                  </Pressable>
                </>
              ) : (
                <>
                  <ThemedText type="small" themeColor="textSecondary">
                    Sign in to sync your streak and Bible progress across devices.
                  </ThemedText>
                  <Pressable onPress={() => router.push('/account')}>
                    <ThemedText type="linkPrimary" themeColor="primary">
                      Sign In / Create Account
                    </ThemedText>
                  </Pressable>
                </>
              )}
            </ThemedView>
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
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  section: {
    borderRadius: 16,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    flex: 1,
    gap: Spacing.half,
    paddingRight: Spacing.two,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  presetChip: {
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
});
