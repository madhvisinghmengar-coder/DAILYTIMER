/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { CustomLogModal } from './components/CustomLogModal';
import { DailyLogList } from './components/DailyLogList';
import { GoalSettingsSection } from './components/GoalSettingsSection';
import { HydrationVessel } from './components/HydrationVessel';
import { QuickLogPanel } from './components/QuickLogPanel';
import { TopBar } from './components/TopBar';
import { WeeklyTrends } from './components/WeeklyTrends';
import {
  calculateStreak,
  createSeedEntries,
  createWaterEntry,
  DailyGoalConfig,
  DEFAULT_GOAL_CONFIG,
  DrinkType,
  evaluatePace,
  getDailyEntries,
  getDailySummary,
  getDateKey,
  getRecentDaysSummary,
  ozToMl,
  parseDateKey,
  WaterEntry,
} from './utils/hydration';
import { loadHydrationData, saveHydrationData } from './utils/storage';

export default function App() {
  const [today] = useState<Date>(() => new Date());
  const todayKey = useMemo(() => getDateKey(today), [today]);

  const [entries, setEntries] = useState<WaterEntry[]>(() => {
    return loadHydrationData(new Date()).entries;
  });
  const [config, setConfig] = useState<DailyGoalConfig>(() => {
    return loadHydrationData(new Date()).config;
  });

  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);
  const [selectedDrinkType, setSelectedDrinkType] = useState<DrinkType>('water');
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'today' | 'history' | 'goal'>('today');
  const [now, setNow] = useState<Date>(() => new Date());

  // Persist changes immediately
  useEffect(() => {
    saveHydrationData({ entries, config, seeded: true });
  }, [entries, config]);

  // Keep current time fresh every minute for accurate pacing evaluation
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const isSelectedToday = selectedDateKey === todayKey;
  const selectedDateLabel = useMemo(() => {
    if (isSelectedToday) return 'Today';
    const parsed = parseDateKey(selectedDateKey);
    return parsed.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }, [selectedDateKey, isSelectedToday]);

  const dailyEntries = useMemo(
    () => getDailyEntries(entries, selectedDateKey),
    [entries, selectedDateKey]
  );

  const dailySummary = useMemo(
    () => getDailySummary(entries, selectedDateKey, config.dailyGoalMl),
    [entries, selectedDateKey, config.dailyGoalMl]
  );

  const recentDays = useMemo(
    () => getRecentDaysSummary(entries, today, 7, config.dailyGoalMl),
    [entries, today, config.dailyGoalMl]
  );

  const streak = useMemo(
    () => calculateStreak(entries, today, config.dailyGoalMl),
    [entries, today, config.dailyGoalMl]
  );

  const pace = useMemo(() => {
    if (!isSelectedToday) return null;
    const currentHourDecimal = now.getHours() + now.getMinutes() / 60;
    return evaluatePace(
      dailySummary.totalMl,
      config.dailyGoalMl,
      config.wakeHour,
      config.sleepHour,
      currentHourDecimal,
      config.unit
    );
  }, [
    isSelectedToday,
    now,
    dailySummary.totalMl,
    config.dailyGoalMl,
    config.wakeHour,
    config.sleepHour,
    config.unit,
  ]);

  const handleAddEntry = (
    rawAmountMl: number,
    label: string,
    drinkType: DrinkType
  ) => {
    const currentNow = new Date();
    let entryTimestamp: Date;

    if (isSelectedToday) {
      entryTimestamp = currentNow;
    } else {
      const targetDay = parseDateKey(selectedDateKey);
      entryTimestamp = new Date(
        targetDay.getFullYear(),
        targetDay.getMonth(),
        targetDay.getDate(),
        currentNow.getHours(),
        currentNow.getMinutes(),
        currentNow.getSeconds()
      );
    }

    const newEntry = createWaterEntry({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      rawAmountMl,
      drinkType,
      label,
      timestamp: entryTimestamp,
    });

    setEntries((prev) => [newEntry, ...prev]);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUndoLast = () => {
    if (dailyEntries.length === 0) return;
    const mostRecentId = dailyEntries[0].id;
    handleDeleteEntry(mostRecentId);
  };

  const handleLogFirstGlass = () => {
    const amountMl = config.unit === 'oz' ? ozToMl(8) : 250;
    handleAddEntry(amountMl, 'Small Glass', 'water');
  };

  const handleNavigate = (section: 'today' | 'history' | 'goal') => {
    setActiveSection(section);
    const el = document.getElementById(section);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleResetSampleData = () => {
    const freshToday = new Date();
    setEntries(createSeedEntries(freshToday));
    setConfig(DEFAULT_GOAL_CONFIG);
    setSelectedDateKey(getDateKey(freshToday));
  };

  const handleClearAllData = () => {
    setEntries([]);
    setSelectedDateKey(todayKey);
  };

  return (
    <div className="min-h-screen bg-[#050C08] text-emerald-50">
      <TopBar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onOpenCustomLog={() => setIsCustomModalOpen(true)}
      />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Primary 2-Column Workspace */}
        <div
          id="today"
          className="scroll-mt-20 grid grid-cols-1 items-start gap-6 lg:grid-cols-12"
        >
          {/* Left Column: Focal Anchor Vessel + Quick Log */}
          <div className="space-y-6 lg:col-span-6">
            <HydrationVessel
              summary={dailySummary}
              unit={config.unit}
              pace={pace}
              streak={streak}
              selectedDateLabel={selectedDateLabel}
              isToday={isSelectedToday}
              onBackToToday={() => setSelectedDateKey(todayKey)}
            />

            <QuickLogPanel
              unit={config.unit}
              selectedDrinkType={selectedDrinkType}
              onSelectDrinkType={setSelectedDrinkType}
              onQuickAdd={handleAddEntry}
              onUndoLast={handleUndoLast}
              canUndo={dailyEntries.length > 0}
              onOpenCustomLog={() => setIsCustomModalOpen(true)}
              selectedDateLabel={selectedDateLabel}
              isToday={isSelectedToday}
            />
          </div>

          {/* Right Column: Today's Intake Log + 7-Day Trend */}
          <div className="space-y-6 lg:col-span-6">
            <DailyLogList
              entries={dailyEntries}
              unit={config.unit}
              selectedDateLabel={selectedDateLabel}
              isToday={isSelectedToday}
              onDeleteEntry={handleDeleteEntry}
              onLogFirstGlass={handleLogFirstGlass}
            />

            <WeeklyTrends
              days={recentDays}
              selectedDateKey={selectedDateKey}
              dailyGoalMl={config.dailyGoalMl}
              unit={config.unit}
              streak={streak}
              onSelectDate={(key) => setSelectedDateKey(key)}
            />
          </div>
        </div>

        {/* Full-Width Goal, Units & Calculator Section */}
        <div className="mt-6">
          <GoalSettingsSection
            config={config}
            onUpdateConfig={setConfig}
            onResetSampleData={handleResetSampleData}
            onClearAllData={handleClearAllData}
          />
        </div>
      </main>

      <footer className="mx-auto max-w-6xl border-t border-[#193B25] px-4 py-6 text-sm text-[#6EE7B7] sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-medium text-[#86EFAC]">Clearwell Hydration Tracker</span>
          <span>Data stored locally in your browser</span>
        </div>
      </footer>

      <CustomLogModal
        isOpen={isCustomModalOpen}
        unit={config.unit}
        initialDrinkType={selectedDrinkType}
        selectedDateLabel={selectedDateLabel}
        isToday={isSelectedToday}
        onClose={() => setIsCustomModalOpen(false)}
        onSubmit={handleAddEntry}
      />
    </div>
  );
}
