import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'prayfit:streakState:v1';

export interface StreakState {
  count: number;
  lastCompletedDate: string | null; // YYYY-MM-DD
  freezesAvailable: number;
  freezeWeekKey: string | null;
}

const DEFAULT_STATE: StreakState = {
  count: 0,
  lastCompletedDate: null,
  freezesAvailable: 1,
  freezeWeekKey: null,
};

function parseDayKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function dayDiff(fromKey: string, toKey: string): number {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.round((parseDayKey(toKey).getTime() - parseDayKey(fromKey).getTime()) / MS_PER_DAY);
}

/** Year + ISO-ish week number, used to cap streak freezes at one per week. */
function weekKey(dayKey: string): string {
  const date = parseDayKey(dayKey);
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const daysSinceYearStart = Math.floor((date.getTime() - firstDayOfYear.getTime()) / 86400000);
  const week = Math.ceil((daysSinceYearStart + firstDayOfYear.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${week}`;
}

export async function getStreakState(): Promise<StreakState> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_STATE;
  try {
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

async function persist(state: StreakState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
 * Call once when a user finishes all 5 questions for the day. Correctness
 * doesn't matter here on purpose — the spec treats participation as the
 * habit being built. Returns the updated streak plus whether a freeze was
 * spent, so the UI can show a "streak saved" moment if so.
 */
export async function recordDailyCompletion(
  today: string,
): Promise<{ state: StreakState; freezeSpent: boolean; streakBroken: boolean }> {
  const previous = await getStreakState();

  if (previous.lastCompletedDate === today) {
    return { state: previous, freezeSpent: false, streakBroken: false };
  }

  const currentWeek = weekKey(today);
  let freezesAvailable = previous.freezesAvailable;
  if (previous.freezeWeekKey !== currentWeek) {
    freezesAvailable = 1;
  }

  let nextCount = 1;
  let freezeSpent = false;
  let streakBroken = false;

  if (previous.lastCompletedDate) {
    const gap = dayDiff(previous.lastCompletedDate, today);
    if (gap === 1) {
      nextCount = previous.count + 1;
    } else if (gap === 2 && freezesAvailable > 0) {
      nextCount = previous.count + 1;
      freezesAvailable -= 1;
      freezeSpent = true;
    } else if (gap <= 0) {
      // Completing "today" out of order (e.g. clock change) — don't punish.
      nextCount = Math.max(previous.count, 1);
    } else {
      streakBroken = previous.count > 0;
      nextCount = 1;
    }
  }

  const nextState: StreakState = {
    count: nextCount,
    lastCompletedDate: today,
    freezesAvailable,
    freezeWeekKey: currentWeek,
  };
  await persist(nextState);
  return { state: nextState, freezeSpent, streakBroken };
}

export async function hasCompletedToday(today: string): Promise<boolean> {
  const state = await getStreakState();
  return state.lastCompletedDate === today;
}
