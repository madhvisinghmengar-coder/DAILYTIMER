import {
  createSeedEntries,
  DailyGoalConfig,
  DEFAULT_GOAL_CONFIG,
  WaterEntry,
} from './hydration';

const STORAGE_KEY = 'clearwell_hydration_v1';

export interface StoredHydrationData {
  entries: WaterEntry[];
  config: DailyGoalConfig;
  seeded: boolean;
}

export function loadHydrationData(today: Date = new Date()): StoredHydrationData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial: StoredHydrationData = {
        entries: createSeedEntries(today),
        config: DEFAULT_GOAL_CONFIG,
        seeded: true,
      };
      saveHydrationData(initial);
      return initial;
    }

    const parsed = JSON.parse(raw) as Partial<StoredHydrationData>;
    const config: DailyGoalConfig = {
      dailyGoalMl:
        typeof parsed.config?.dailyGoalMl === 'number' && parsed.config.dailyGoalMl >= 500
          ? parsed.config.dailyGoalMl
          : DEFAULT_GOAL_CONFIG.dailyGoalMl,
      unit: parsed.config?.unit === 'oz' ? 'oz' : 'ml',
      wakeHour:
        typeof parsed.config?.wakeHour === 'number' &&
        parsed.config.wakeHour >= 0 &&
        parsed.config.wakeHour <= 14
          ? parsed.config.wakeHour
          : DEFAULT_GOAL_CONFIG.wakeHour,
      sleepHour:
        typeof parsed.config?.sleepHour === 'number' &&
        parsed.config.sleepHour >= 15 &&
        parsed.config.sleepHour <= 23
          ? parsed.config.sleepHour
          : DEFAULT_GOAL_CONFIG.sleepHour,
    };

    const entries = Array.isArray(parsed.entries) ? parsed.entries : [];
    return {
      entries,
      config,
      seeded: Boolean(parsed.seeded),
    };
  } catch {
    return {
      entries: createSeedEntries(today),
      config: DEFAULT_GOAL_CONFIG,
      seeded: true,
    };
  }
}

export function saveHydrationData(data: StoredHydrationData): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota errors gracefully
  }
}
