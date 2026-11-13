import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRecommendedGoalMl,
  calculateStreak,
  createSeedEntries,
  createWaterEntry,
  evaluatePace,
  formatVolume,
  getDailySummary,
  getDateKey,
  getRecentDaysSummary,
  mlToOz,
  ozToMl,
  validateCustomAmount,
  validateGoalAmount,
} from './hydration';

test('unit conversions convert accurately between ml and fl oz', () => {
  assert.equal(mlToOz(250), 8.5);
  assert.equal(ozToMl(16), 473);
  assert.equal(formatVolume(1250, 'ml'), '1,250 ml');
  assert.equal(formatVolume(500, 'oz'), '16.9 fl oz');
});

test('daily summary computes effective hydration and goal completion', () => {
  const refDate = new Date(2026, 10, 13, 10, 0, 0);
  const key = getDateKey(refDate);
  const entries = [
    createWaterEntry({
      id: '1',
      rawAmountMl: 500,
      drinkType: 'water',
      timestamp: refDate,
    }),
    createWaterEntry({
      id: '2',
      rawAmountMl: 250,
      drinkType: 'coffee', // 0.8 -> 200 ml
      timestamp: refDate,
    }),
  ];

  const summary = getDailySummary(entries, key, 2500);
  assert.equal(summary.rawTotalMl, 750);
  assert.equal(summary.totalMl, 700);
  assert.equal(summary.remainingMl, 1800);
  assert.equal(summary.percentage, 28);
  assert.equal(summary.isGoalReached, false);

  const reachedSummary = getDailySummary(entries, key, 600);
  assert.equal(reachedSummary.isGoalReached, true);
  assert.equal(reachedSummary.overTargetMl, 100);
  assert.equal(reachedSummary.clampedPercentage, 100);
});

test('streak counts consecutive completed days ending yesterday or today', () => {
  const today = new Date(2026, 10, 13, 9, 0, 0);
  const seed = createSeedEntries(today);
  // In createSeedEntries:
  // 1 day ago: 350 + 500 + 500 + 500 + 750 = 2600 >= 2500
  // 2 days ago: 250 + 500 + 333(tea) + 750 + 700 = 2533 >= 2500
  // 3 days ago: 500 + 500 + 750 + 750 = 2500 >= 2500
  // 4 days ago: 200(coffee) + 500 + 500 + 500 = 1700 < 2500 (breaks streak)
  assert.equal(calculateStreak(seed, today, 2500), 3);

  const withTodayComplete = [
    ...seed,
    createWaterEntry({ id: 'today-1', rawAmountMl: 2500, timestamp: today }),
  ];
  assert.equal(calculateStreak(withTodayComplete, today, 2500), 4);
});

test('recent days trend returns exact day count ordered oldest to today', () => {
  const today = new Date(2026, 10, 13, 9, 0, 0);
  const seed = createSeedEntries(today);
  const trend = getRecentDaysSummary(seed, today, 7, 2500);
  assert.equal(trend.length, 7);
  assert.equal(trend[6].isToday, true);
  assert.equal(trend[6].totalMl, 0);
  assert.equal(trend[5].isGoalReached, true);
});

test('pace evaluation reports ahead, on-track, behind, and complete states', () => {
  // Wake 7, sleep 22 (15h span). At 14.5 (halfway), expected is 1250 for 2500 goal.
  const behind = evaluatePace(600, 2500, 7, 22, 14.5, 'ml');
  assert.equal(behind.status, 'behind');

  const onTrack = evaluatePace(1250, 2500, 7, 22, 14.5, 'ml');
  assert.equal(onTrack.status, 'on-track');

  const ahead = evaluatePace(1800, 2500, 7, 22, 14.5, 'ml');
  assert.equal(ahead.status, 'ahead');

  const complete = evaluatePace(2600, 2500, 7, 22, 14.5, 'ml');
  assert.equal(complete.status, 'complete');
});

test('goal calculator and input validation reject invalid inputs cleanly', () => {
  // 70 kg * 33 + (30 / 30) * 350 = 2310 + 350 = 2660 -> nearest 50 = 2650
  assert.equal(calculateRecommendedGoalMl(70, 30), 2650);

  assert.deepEqual(validateCustomAmount('', 'ml'), {
    valid: false,
    error: 'Enter a water amount to log.',
  });
  assert.deepEqual(validateCustomAmount('-20', 'ml'), {
    valid: false,
    error: 'Amount must be greater than zero.',
  });
  assert.deepEqual(validateCustomAmount('6000', 'ml'), {
    valid: false,
    error: 'Single entry cannot exceed 5,000 ml.',
  });
  assert.deepEqual(validateCustomAmount('350', 'ml'), {
    valid: true,
    ml: 350,
  });

  assert.equal(validateGoalAmount('200', 'ml').valid, false);
  assert.equal(validateGoalAmount('2800', 'ml').valid, true);
});
