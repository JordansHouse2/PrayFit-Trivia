import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Everything here is a local, on-device notification — there's no backend yet,
 * so nothing is server-scheduled or pushed. That covers three of the four
 * triggers from the product spec well (daily reminder, milestone-unlocked,
 * re-engagement); the fourth (streak-at-risk) is approximated by rescheduling
 * a same-day one-shot notification each time the app is opened — see
 * syncStreakRiskNotification for the honest limitation that implies.
 */

const DAILY_REMINDER_ID_KEY = 'prayfit:notif:dailyReminderId';
const STREAK_RISK_ID_KEY = 'prayfit:notif:streakRiskId';
const STREAK_RISK_DATE_KEY = 'prayfit:notif:streakRiskDate';
const REENGAGEMENT_ID_KEY = 'prayfit:notif:reengagementId';

const isSupportedPlatform = Platform.OS !== 'web';

export function configureNotificationHandler(): void {
  if (!isSupportedPlatform) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function getNotificationPermissionGranted(): Promise<boolean> {
  if (!isSupportedPlatform) return false;
  const status = await Notifications.getPermissionsAsync();
  return status.granted;
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!isSupportedPlatform) return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

async function cancelStored(key: string): Promise<void> {
  const id = await AsyncStorage.getItem(key);
  if (id) {
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
    await AsyncStorage.removeItem(key);
  }
}

/** "Your 5 are ready" — repeats daily at the user's chosen time. */
export async function scheduleDailyReminder(hour: number, minute: number): Promise<void> {
  if (!isSupportedPlatform) return;
  await cancelStored(DAILY_REMINDER_ID_KEY);
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Your 5 are ready',
      body: "Keep the streak alive — today's PrayFit Trivia is waiting.",
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
  });
  await AsyncStorage.setItem(DAILY_REMINDER_ID_KEY, id);
}

export async function cancelDailyReminder(): Promise<void> {
  if (!isSupportedPlatform) return;
  await cancelStored(DAILY_REMINDER_ID_KEY);
}

/**
 * "Don't lose your streak" — evening nudge, only if today's 5 aren't done yet.
 * Limitation: since this is scheduled fresh each time the app is opened (so
 * the message can include the real, current streak count), it only fires on
 * days the app was opened at least once — there's no background task keeping
 * it alive on days the app never launches. Call this from Home whenever the
 * user is active; call cancelStreakRiskNotification the moment they complete
 * the day's 5.
 */
export async function syncStreakRiskNotification(params: {
  enabled: boolean;
  streakCount: number;
  completedToday: boolean;
  hour: number;
  minute: number;
}): Promise<void> {
  if (!isSupportedPlatform) return;
  const { enabled, streakCount, completedToday, hour, minute } = params;

  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const alreadyScheduledFor = await AsyncStorage.getItem(STREAK_RISK_DATE_KEY);

  if (!enabled || completedToday || streakCount <= 0) {
    await cancelStored(STREAK_RISK_ID_KEY);
    await AsyncStorage.removeItem(STREAK_RISK_DATE_KEY);
    return;
  }

  if (alreadyScheduledFor === todayKey) return; // already scheduled for today

  await cancelStored(STREAK_RISK_ID_KEY);

  const fireDate = new Date();
  fireDate.setHours(hour, minute, 0, 0);
  if (fireDate.getTime() <= Date.now()) return; // that time already passed today

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `Don't lose your ${streakCount}-day streak`,
      body: "You haven't done today's 5 yet — a couple minutes keeps it going.",
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireDate },
  });
  await AsyncStorage.setItem(STREAK_RISK_ID_KEY, id);
  await AsyncStorage.setItem(STREAK_RISK_DATE_KEY, todayKey);
}

export async function cancelStreakRiskNotification(): Promise<void> {
  if (!isSupportedPlatform) return;
  await cancelStored(STREAK_RISK_ID_KEY);
  await AsyncStorage.removeItem(STREAK_RISK_DATE_KEY);
}

/**
 * Soft win-back after 3+ missed days. Rescheduled 3 days out every time the
 * user is active (app open or quiz completed), so it only actually fires if
 * they truly don't come back.
 */
export async function scheduleReengagementReminder(): Promise<void> {
  if (!isSupportedPlatform) return;
  await cancelStored(REENGAGEMENT_ID_KEY);

  const fireDate = new Date();
  fireDate.setDate(fireDate.getDate() + 3);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Pick back up anytime',
      body: 'Your streak and Bible progress are right where you left them — no pressure, just come back when ready.',
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireDate },
  });
  await AsyncStorage.setItem(REENGAGEMENT_ID_KEY, id);
}

export async function cancelReengagementReminder(): Promise<void> {
  if (!isSupportedPlatform) return;
  await cancelStored(REENGAGEMENT_ID_KEY);
}

/** Celebratory, fires immediately — book completed, streak milestone, etc. */
export async function presentMilestoneNotification(label: string): Promise<void> {
  if (!isSupportedPlatform) return;
  await Notifications.scheduleNotificationAsync({
    content: { title: 'Milestone unlocked 🎉', body: label },
    trigger: null,
  });
}
