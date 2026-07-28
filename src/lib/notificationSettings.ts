import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'prayfit:notificationSettings:v1';

export interface NotificationSettings {
  enabled: boolean;
  reminderHour: number;
  reminderMinute: number;
}

/** Default reminder time per the product spec: 7:00am. */
export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: false,
  reminderHour: 7,
  reminderMinute: 0,
};

/** Evening check for the "streak at risk" nudge — not user-configurable for now. */
export const STREAK_RISK_HOUR = 20;
export const STREAK_RISK_MINUTE = 0;

export async function getNotificationSettings(): Promise<NotificationSettings> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_NOTIFICATION_SETTINGS;
  try {
    return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

export async function setNotificationSettings(settings: NotificationSettings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
