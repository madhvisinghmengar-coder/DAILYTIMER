export type Unit = 'ml' | 'oz';

export type DrinkType = 'water' | 'sparkling' | 'tea' | 'coffee' | 'electrolyte';

export interface DrinkOption {
  type: DrinkType;
  label: string;
  hydrationFactor: number;
  note: string;
}

export const DRINK_OPTIONS: DrinkOption[] = [
  { type: 'water', label: 'Pure Water', hydrationFactor: 1.0, note: '100% hydration' },
  { type: 'sparkling', label: 'Sparkling Water', hydrationFactor: 1.0, note: '100% hydration' },
  { type: 'electrolyte', label: 'Electrolytes', hydrationFactor: 1.0, note: '100% hydration' },
  { type: 'tea', label: 'Herbal / Green Tea', hydrationFactor: 0.95, note: '95% hydration' },
  { type: 'coffee', label: 'Coffee', hydrationFactor: 0.8, note: '80% hydration' },
];

export interface VesselPreset {
  id: string;
  label: string;
  amountMl: number;
  amountOz: number;
}

export const VESSEL_PRESETS: VesselPreset[] = [
  { id: 'glass', label: 'Small Glass', amountMl: 250, amountOz: 8 },
  { id: 'mug', label: 'Tumbler', amountMl: 350, amountOz: 12 },
  { id: 'bottle', label: 'Bottle', amountMl: 500, amountOz: 16 },
  { id: 'flask', label: 'Large Flask', amountMl: 750, amountOz: 24 },
];

export interface WaterEntry {
  id: string;
  timestamp: string; // ISO string
  dateKey: string; // YYYY-MM-DD local
  rawAmountMl: number;
  effectiveMl: number;
  drinkType: DrinkType;
  label: string;
}

export interface DailyGoalConfig {
  dailyGoalMl: number;
  unit: Unit;
  wakeHour: number; // 0-23
  sleepHour: number; // 0-23
}

export const DEFAULT_GOAL_CONFIG: DailyGoalConfig = {
  dailyGoalMl: 2500,
  unit: 'ml',
  wakeHour: 7,
  sleepHour: 22,
};

const ML_PER_OZ = 29.5735;

export function mlToOz(ml: number): number {
  return Math.round((ml / ML_PER_OZ) * 10) / 10;
}

export function ozToMl(oz: number): number {
  return Math.round(oz * ML_PER_OZ);
}

export function formatVolume(ml: number, unit: Unit): string {
  if (unit === 'oz') {
    const oz = mlToOz(ml);
    const formatted = Number.isInteger(oz) ? oz.toFixed(0) : oz.toFixed(1);
    return `${formatted} fl oz`;
  }
  return `${Math.round(ml).toLocaleString('en-US')} ml`;
}

export function formatCompactVolume(ml: number, unit: Unit): string {
  if (unit === 'oz') {
    const oz = Math.round(ml / ML_PER_OZ);
    return `${oz} oz`;
  }
  return `${Math.round(ml).toLocaleString('en-US')} ml`;
}

export function getDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function getHydrationFactor(drinkType: DrinkType): number {
  const found = DRINK_OPTIONS.find((d) => d.type === drinkType);
  return found ? found.hydrationFactor : 1.0;
}

export function getDrinkLabel(drinkType: DrinkType): string {
  const found = DRINK_OPTIONS.find((d) => d.type === drinkType);
  return found ? found.label : 'Pure Water';
}

export function computeEffectiveMl(rawAmountMl: number, drinkType: DrinkType): number {
  return Math.round(rawAmountMl * getHydrationFactor(drinkType));
}

export function createWaterEntry(params: {
  id: string;
  rawAmountMl: number;
  drinkType?: DrinkType;
  label?: string;
  timestamp?: Date;
}): WaterEntry {
  const now = params.timestamp ?? new Date();
  const drinkType = params.drinkType ?? 'water';
  const rawAmountMl = Math.max(1, Math.round(params.rawAmountMl));
  return {
    id: params.id,
    timestamp: now.toISOString(),
    dateKey: getDateKey(now),
    rawAmountMl,
    effectiveMl: computeEffectiveMl(rawAmountMl, drinkType),
    drinkType,
    label: params.label?.trim() || getDrinkLabel(drinkType),
  };
}

export function getDailyEntries(entries: WaterEntry[], dateKey: string): WaterEntry[] {
  return entries
    .filter((entry) => entry.dateKey === dateKey)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export interface DailySummary {
  dateKey: string;
  totalMl: number;
  rawTotalMl: number;
  goalMl: number;
  remainingMl: number;
  overTargetMl: number;
  percentage: number;
  clampedPercentage: number;
  isGoalReached: boolean;
  entryCount: number;
}

export function getDailySummary(
  entries: WaterEntry[],
  dateKey: string,
  dailyGoalMl: number
): DailySummary {
  const safeGoal = Math.max(250, dailyGoalMl);
  const dayEntries = getDailyEntries(entries, dateKey);
  const totalMl = dayEntries.reduce((sum, item) => sum + item.effectiveMl, 0);
  const rawTotalMl = dayEntries.reduce((sum, item) => sum + item.rawAmountMl, 0);
  const percentage = Math.round((totalMl / safeGoal) * 100);
  return {
    dateKey,
    totalMl,
    rawTotalMl,
    goalMl: safeGoal,
    remainingMl: Math.max(0, safeGoal - totalMl),
    overTargetMl: Math.max(0, totalMl - safeGoal),
    percentage,
    clampedPercentage: Math.min(100, Math.max(0, percentage)),
    isGoalReached: totalMl >= safeGoal,
    entryCount: dayEntries.length,
  };
}

export interface PaceEvaluation {
  expectedMl: number;
  deltaMl: number;
  status: 'complete' | 'ahead' | 'on-track' | 'behind';
  message: string;
}

export function getExpectedPaceMl(
  dailyGoalMl: number,
  wakeHour: number,
  sleepHour: number,
  currentHourDecimal: number
): number {
  const safeGoal = Math.max(250, dailyGoalMl);
  const span = Math.max(1, sleepHour - wakeHour);
  if (currentHourDecimal <= wakeHour) return 0;
  if (currentHourDecimal >= sleepHour) return safeGoal;
  const elapsedFraction = (currentHourDecimal - wakeHour) / span;
  return Math.round(safeGoal * elapsedFraction);
}

export function evaluatePace(
  totalMl: number,
  dailyGoalMl: number,
  wakeHour: number,
  sleepHour: number,
  currentHourDecimal: number,
  unit: Unit
): PaceEvaluation {
  if (totalMl >= dailyGoalMl) {
    const extra = totalMl - dailyGoalMl;
    return {
      expectedMl: dailyGoalMl,
      deltaMl: extra,
      status: 'complete',
      message:
        extra > 0
          ? `Target met (+${formatVolume(extra, unit)} above goal)`
          : 'Daily hydration target met',
    };
  }

  const expectedMl = getExpectedPaceMl(dailyGoalMl, wakeHour, sleepHour, currentHourDecimal);
  const deltaMl = totalMl - expectedMl;
  const toleranceMl = Math.max(150, Math.round(dailyGoalMl * 0.08));

  if (deltaMl > toleranceMl) {
    return {
      expectedMl,
      deltaMl,
      status: 'ahead',
      message: `${formatVolume(deltaMl, unit)} ahead of daytime pace`,
    };
  }

  if (deltaMl >= -toleranceMl) {
    return {
      expectedMl,
      deltaMl,
      status: 'on-track',
      message: `On pace (target ~${formatVolume(expectedMl, unit)} by now)`,
    };
  }

  return {
    expectedMl,
    deltaMl,
    status: 'behind',
    message: `${formatVolume(Math.abs(deltaMl), unit)} behind pace`,
  };
}

export interface DayTrendPoint {
  dateKey: string;
  weekdayLabel: string;
  shortDate: string;
  totalMl: number;
  goalMl: number;
  percentage: number;
  isGoalReached: boolean;
  isToday: boolean;
  entryCount: number;
}

export function getRecentDaysSummary(
  entries: WaterEntry[],
  today: Date,
  daysCount: number,
  dailyGoalMl: number
): DayTrendPoint[] {
  const todayKey = getDateKey(today);
  const result: DayTrendPoint[] = [];

  for (let offset = daysCount - 1; offset >= 0; offset -= 1) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset, 12, 0, 0, 0);
    const key = getDateKey(d);
    const summary = getDailySummary(entries, key, dailyGoalMl);
    result.push({
      dateKey: key,
      weekdayLabel: d.toLocaleDateString('en-US', { weekday: 'short' }),
      shortDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      totalMl: summary.totalMl,
      goalMl: summary.goalMl,
      percentage: summary.percentage,
      isGoalReached: summary.isGoalReached,
      isToday: key === todayKey,
      entryCount: summary.entryCount,
    });
  }

  return result;
}

export function calculateStreak(
  entries: WaterEntry[],
  today: Date,
  dailyGoalMl: number,
  maxLookbackDays = 60
): number {
  const todayKey = getDateKey(today);
  const todaySummary = getDailySummary(entries, todayKey, dailyGoalMl);
  let streak = todaySummary.isGoalReached ? 1 : 0;

  for (let offset = 1; offset <= maxLookbackDays; offset += 1) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset, 12, 0, 0, 0);
    const key = getDateKey(d);
    const summary = getDailySummary(entries, key, dailyGoalMl);
    if (summary.isGoalReached) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

export function calculateRecommendedGoalMl(
  weightKg: number,
  exerciseMinutes: number
): number {
  const safeWeight = Math.min(200, Math.max(30, weightKg));
  const safeExercise = Math.min(300, Math.max(0, exerciseMinutes));
  const raw = safeWeight * 33 + (safeExercise / 30) * 350;
  const clamped = Math.min(5000, Math.max(1200, raw));
  return Math.round(clamped / 50) * 50;
}

export function validateCustomAmount(
  rawValue: string,
  unit: Unit
): { valid: true; ml: number } | { valid: false; error: string } {
  const trimmed = rawValue.trim();
  if (!trimmed) {
    return { valid: false, error: 'Enter a water amount to log.' };
  }
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return { valid: false, error: 'Amount must be greater than zero.' };
  }
  const ml = unit === 'oz' ? ozToMl(parsed) : Math.round(parsed);
  if (ml < 10) {
    return {
      valid: false,
      error: unit === 'oz' ? 'Minimum amount is 0.5 fl oz.' : 'Minimum amount is 10 ml.',
    };
  }
  if (ml > 5000) {
    return {
      valid: false,
      error:
        unit === 'oz'
          ? 'Single entry cannot exceed 169 fl oz (5,000 ml).'
          : 'Single entry cannot exceed 5,000 ml.',
    };
  }
  return { valid: true, ml };
}

export function validateGoalAmount(
  rawValue: string,
  unit: Unit
): { valid: true; ml: number } | { valid: false; error: string } {
  const trimmed = rawValue.trim();
  if (!trimmed) {
    return { valid: false, error: 'Enter a daily hydration goal.' };
  }
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return { valid: false, error: 'Goal must be a positive number.' };
  }
  const ml = unit === 'oz' ? ozToMl(parsed) : Math.round(parsed);
  if (ml < 500 || ml > 8000) {
    return {
      valid: false,
      error:
        unit === 'oz'
          ? 'Daily goal must be between 17 fl oz and 270 fl oz.'
          : 'Daily goal must be between 500 ml and 8,000 ml.',
    };
  }
  return { valid: true, ml };
}

export function createSeedEntries(today: Date): WaterEntry[] {
  // Deterministic 6-day prior history so trends & streak are immediately informative,
  // while Today starts clean at 0 ml ready for the user's first glass.
  const dailyPatterns: Array<{
    daysAgo: number;
    items: Array<{ hour: number; minute: number; ml: number; drinkType: DrinkType; label: string }>;
  }> = [
    {
      daysAgo: 1,
      items: [
        { hour: 7, minute: 30, ml: 350, drinkType: 'water', label: 'Morning Glass' },
        { hour: 10, minute: 15, ml: 500, drinkType: 'water', label: 'Bottle' },
        { hour: 13, minute: 0, ml: 500, drinkType: 'sparkling', label: 'Sparkling Water' },
        { hour: 16, minute: 20, ml: 500, drinkType: 'water', label: 'Afternoon Bottle' },
        { hour: 19, minute: 45, ml: 750, drinkType: 'electrolyte', label: 'Post-Run Flask' },
      ],
    },
    {
      daysAgo: 2,
      items: [
        { hour: 8, minute: 0, ml: 250, drinkType: 'water', label: 'Small Glass' },
        { hour: 11, minute: 10, ml: 500, drinkType: 'water', label: 'Bottle' },
        { hour: 14, minute: 30, ml: 350, drinkType: 'tea', label: 'Green Tea' },
        { hour: 17, minute: 15, ml: 750, drinkType: 'water', label: 'Large Flask' },
        { hour: 20, minute: 20, ml: 700, drinkType: 'water', label: 'Evening Refill' },
      ],
    },
    {
      daysAgo: 3,
      items: [
        { hour: 7, minute: 45, ml: 500, drinkType: 'water', label: 'Morning Bottle' },
        { hour: 11, minute: 40, ml: 500, drinkType: 'water', label: 'Desk Bottle' },
        { hour: 15, minute: 10, ml: 750, drinkType: 'water', label: 'Large Flask' },
        { hour: 18, minute: 50, ml: 750, drinkType: 'water', label: 'Dinner & Evening' },
      ],
    },
    {
      daysAgo: 4,
      items: [
        { hour: 8, minute: 20, ml: 250, drinkType: 'coffee', label: 'Morning Coffee' },
        { hour: 12, minute: 10, ml: 500, drinkType: 'water', label: 'Lunch Bottle' },
        { hour: 16, minute: 0, ml: 500, drinkType: 'water', label: 'Afternoon Bottle' },
        { hour: 20, minute: 0, ml: 500, drinkType: 'water', label: 'Evening Bottle' },
      ],
    },
    {
      daysAgo: 5,
      items: [
        { hour: 7, minute: 50, ml: 350, drinkType: 'water', label: 'Tumbler' },
        { hour: 11, minute: 30, ml: 750, drinkType: 'water', label: 'Large Flask' },
        { hour: 15, minute: 45, ml: 750, drinkType: 'water', label: 'Large Flask' },
        { hour: 19, minute: 30, ml: 750, drinkType: 'water', label: 'Evening Flask' },
      ],
    },
    {
      daysAgo: 6,
      items: [
        { hour: 9, minute: 0, ml: 500, drinkType: 'water', label: 'Bottle' },
        { hour: 13, minute: 30, ml: 500, drinkType: 'tea', label: 'Herbal Tea' },
        { hour: 18, minute: 0, ml: 750, drinkType: 'water', label: 'Large Flask' },
        { hour: 21, minute: 0, ml: 500, drinkType: 'water', label: 'Bottle' },
      ],
    },
  ];

  const seeded: WaterEntry[] = [];
  for (const day of dailyPatterns) {
    day.items.forEach((item, index) => {
      const dt = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - day.daysAgo,
        item.hour,
        item.minute,
        0,
        0
      );
      seeded.push(
        createWaterEntry({
          id: `seed-${day.daysAgo}-${index}`,
          rawAmountMl: item.ml,
          drinkType: item.drinkType,
          label: item.label,
          timestamp: dt,
        })
      );
    });
  }

  return seeded;
}
