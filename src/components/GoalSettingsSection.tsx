import React, { useEffect, useState } from 'react';
import { Calculator, Check, RotateCcw, Trash2 } from 'lucide-react';
import {
  calculateRecommendedGoalMl,
  DailyGoalConfig,
  formatVolume,
  mlToOz,
  ozToMl,
  Unit,
  validateGoalAmount,
} from '../utils/hydration';

interface GoalSettingsSectionProps {
  config: DailyGoalConfig;
  onUpdateConfig: (next: DailyGoalConfig) => void;
  onResetSampleData: () => void;
  onClearAllData: () => void;
}

export const GoalSettingsSection: React.FC<GoalSettingsSectionProps> = ({
  config,
  onUpdateConfig,
  onResetSampleData,
  onClearAllData,
}) => {
  const [goalInput, setGoalInput] = useState<string>(() =>
    config.unit === 'oz'
      ? String(Math.round(mlToOz(config.dailyGoalMl)))
      : String(config.dailyGoalMl)
  );
  const [goalError, setGoalError] = useState<string | null>(null);
  const [goalSavedNotice, setGoalSavedNotice] = useState(false);

  const [weightInput, setWeightInput] = useState('70');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');
  const [exerciseMinutes, setExerciseMinutes] = useState('30');
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    setGoalInput(
      config.unit === 'oz'
        ? String(Math.round(mlToOz(config.dailyGoalMl)))
        : String(config.dailyGoalMl)
    );
    setGoalError(null);
  }, [config.dailyGoalMl, config.unit]);

  const handleUnitChange = (nextUnit: Unit) => {
    if (nextUnit === config.unit) return;
    onUpdateConfig({ ...config, unit: nextUnit });
  };

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateGoalAmount(goalInput, config.unit);
    if (!validation.valid) {
      setGoalError(validation.error);
      return;
    }
    setGoalError(null);
    onUpdateConfig({ ...config, dailyGoalMl: validation.ml });
    setGoalSavedNotice(true);
    setTimeout(() => setGoalSavedNotice(false), 2000);
  };

  const parsedWeight = Number(weightInput);
  const parsedExercise = Number(exerciseMinutes);
  const weightKg =
    Number.isFinite(parsedWeight) && parsedWeight > 0
      ? weightUnit === 'lb'
        ? parsedWeight * 0.453592
        : parsedWeight
      : 70;
  const safeExercise =
    Number.isFinite(parsedExercise) && parsedExercise >= 0 ? parsedExercise : 0;
  const recommendedMl = calculateRecommendedGoalMl(weightKg, safeExercise);
  const recommendedMlOrOz =
    config.unit === 'oz'
      ? `${Math.round(mlToOz(recommendedMl))} fl oz (${recommendedMl.toLocaleString('en-US')} ml)`
      : formatVolume(recommendedMl, 'ml');

  const formatHour = (h: number) => {
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:00 ${suffix}`;
  };

  return (
    <section
      id="goal"
      aria-labelledby="goal-settings-heading"
      className="scroll-mt-20 rounded-2xl border border-[#1E462C] bg-[#0A170F] p-6 sm:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#183823] pb-5">
        <div>
          <h2
            id="goal-settings-heading"
            className="font-display text-2xl font-bold text-white"
          >
            Daily Goal, Units & Pacing
          </h2>
          <p className="mt-1 text-base text-[#86EFAC]">
            Customize your measurement units, daily target, and daytime schedule.
          </p>
        </div>

        {/* Unit Toggle Segmented Control */}
        <div
          className="inline-flex items-center rounded-xl border border-[#183823] bg-[#060F0A] p-1"
          role="group"
          aria-label="Measurement unit"
        >
          <button
            type="button"
            onClick={() => handleUnitChange('ml')}
            aria-pressed={config.unit === 'ml'}
            className={`min-h-[40px] rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#39FF14] ${
              config.unit === 'ml'
                ? 'bg-[#39FF14] font-bold text-[#04140A]'
                : 'text-[#86EFAC] hover:text-white'
            }`}
          >
            Milliliters (ml)
          </button>
          <button
            type="button"
            onClick={() => handleUnitChange('oz')}
            aria-pressed={config.unit === 'oz'}
            className={`min-h-[40px] rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#39FF14] ${
              config.unit === 'oz'
                ? 'bg-[#39FF14] font-bold text-[#04140A]'
                : 'text-[#86EFAC] hover:text-white'
            }`}
          >
            Fluid Ounces (fl oz)
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Direct Daily Goal & Pacing Window */}
        <div className="space-y-6 lg:col-span-6">
          <form onSubmit={handleGoalSubmit} noValidate>
            <label
              htmlFor="daily-goal-input"
              className="block text-base font-semibold text-white"
            >
              Daily Hydration Goal ({config.unit === 'oz' ? 'fl oz' : 'ml'})
            </label>
            <p className="mt-0.5 text-sm text-[#6EE7B7]">
              Current target:{' '}
              <span className="font-mono font-semibold text-[#39FF14] tabular-nums">
                {formatVolume(config.dailyGoalMl, config.unit)}
              </span>
            </p>
            <div className="mt-2.5 flex items-start gap-2.5">
              <div className="relative flex-1">
                <input
                  id="daily-goal-input"
                  type="number"
                  inputMode="decimal"
                  step={config.unit === 'oz' ? '1' : '50'}
                  value={goalInput}
                  onChange={(e) => {
                    setGoalInput(e.target.value);
                    if (goalError) setGoalError(null);
                  }}
                  aria-invalid={Boolean(goalError)}
                  aria-describedby={goalError ? 'daily-goal-error' : undefined}
                  className={`block min-h-[46px] w-full rounded-xl border bg-[#06100A] px-3.5 py-2.5 pr-16 font-mono text-base text-white focus:outline-none focus:ring-2 ${
                    goalError
                      ? 'border-rose-400 focus:ring-rose-500/25'
                      : 'border-[#255736] focus:border-[#39FF14] focus:ring-[#39FF14]/25'
                  }`}
                />
                <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center font-mono text-sm text-[#6EE7B7]">
                  {config.unit === 'oz' ? 'fl oz' : 'ml'}
                </span>
              </div>
              <button
                type="submit"
                className="inline-flex min-h-[46px] items-center gap-1.5 rounded-xl bg-[#39FF14] px-4 py-2.5 text-sm font-bold text-[#04140A] transition-colors hover:bg-[#5CFF3B] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39FF14]"
              >
                {goalSavedNotice ? (
                  <>
                    <Check className="h-4 w-4" aria-hidden="true" />
                    <span>Saved</span>
                  </>
                ) : (
                  <span>Update Goal</span>
                )}
              </button>
            </div>
            {goalError && (
              <p
                id="daily-goal-error"
                role="alert"
                className="mt-1.5 text-sm font-medium text-rose-400"
              >
                {goalError}
              </p>
            )}
          </form>

          {/* Daytime Pacing Window */}
          <div className="border-t border-[#183823] pt-5">
            <h3 className="text-base font-semibold text-white">
              Daytime Pacing Window
            </h3>
            <p className="mt-0.5 text-sm text-[#6EE7B7]">
              Used to calculate whether you are ahead or behind pace throughout the day.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="wake-hour-select"
                  className="block text-sm font-medium text-[#A7F3D0]"
                >
                  Wake Time
                </label>
                <select
                  id="wake-hour-select"
                  value={config.wakeHour}
                  onChange={(e) =>
                    onUpdateConfig({ ...config, wakeHour: Number(e.target.value) })
                  }
                  className="mt-1 block min-h-[44px] w-full rounded-xl border border-[#255736] bg-[#06100A] px-3 py-2 font-mono text-sm text-white focus:border-[#39FF14] focus:outline-none focus:ring-2 focus:ring-[#39FF14]/25"
                >
                  {[5, 6, 7, 8, 9, 10, 11].map((h) => (
                    <option key={h} value={h}>
                      {formatHour(h)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="sleep-hour-select"
                  className="block text-sm font-medium text-[#A7F3D0]"
                >
                  Wind-Down Time
                </label>
                <select
                  id="sleep-hour-select"
                  value={config.sleepHour}
                  onChange={(e) =>
                    onUpdateConfig({ ...config, sleepHour: Number(e.target.value) })
                  }
                  className="mt-1 block min-h-[44px] w-full rounded-xl border border-[#255736] bg-[#06100A] px-3 py-2 font-mono text-sm text-white focus:border-[#39FF14] focus:outline-none focus:ring-2 focus:ring-[#39FF14]/25"
                >
                  {[19, 20, 21, 22, 23].map((h) => (
                    <option key={h} value={h}>
                      {formatHour(h)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Hydration Goal Calculator */}
        <div className="border-t border-[#183823] pt-6 lg:col-span-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-[#39FF14]" aria-hidden="true" />
            <h3 className="text-base font-semibold text-white">
              Hydration Goal Calculator
            </h3>
          </div>
          <p className="mt-0.5 text-sm text-[#6EE7B7]">
            Estimate a baseline daily target from body weight and daily exercise.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="calc-weight-input"
                className="block text-sm font-medium text-[#A7F3D0]"
              >
                Body Weight
              </label>
              <div className="mt-1 flex">
                <input
                  id="calc-weight-input"
                  type="number"
                  min={30}
                  max={440}
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  className="min-h-[44px] w-full rounded-l-xl border border-[#255736] bg-[#06100A] px-3 py-2 font-mono text-base text-white focus:border-[#39FF14] focus:outline-none focus:ring-2 focus:ring-[#39FF14]/25"
                />
                <button
                  type="button"
                  onClick={() =>
                    setWeightUnit((prev) => (prev === 'kg' ? 'lb' : 'kg'))
                  }
                  aria-label={`Switch weight unit, currently ${weightUnit}`}
                  className="min-h-[44px] rounded-r-xl border border-l-0 border-[#255736] bg-[#0F2417] px-3 font-mono text-sm font-semibold text-[#39FF14] hover:bg-[#163321] cursor-pointer"
                >
                  {weightUnit}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="calc-exercise-input"
                className="block text-sm font-medium text-[#A7F3D0]"
              >
                Exercise (min / day)
              </label>
              <input
                id="calc-exercise-input"
                type="number"
                min={0}
                max={300}
                step={15}
                value={exerciseMinutes}
                onChange={(e) => setExerciseMinutes(e.target.value)}
                className="mt-1 block min-h-[44px] w-full rounded-xl border border-[#255736] bg-[#06100A] px-3 py-2 font-mono text-base text-white focus:border-[#39FF14] focus:outline-none focus:ring-2 focus:ring-[#39FF14]/25"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#1E462C] bg-[#0E2015] px-4 py-3.5">
            <div>
              <p className="text-sm text-[#86EFAC]">Recommended Daily Target</p>
              <p className="mt-0.5 font-mono text-lg font-bold text-[#39FF14] tabular-nums">
                {recommendedMlOrOz}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const normalizedMl =
                  config.unit === 'oz'
                    ? ozToMl(Math.round(mlToOz(recommendedMl)))
                    : recommendedMl;
                onUpdateConfig({ ...config, dailyGoalMl: normalizedMl });
                setGoalSavedNotice(true);
                setTimeout(() => setGoalSavedNotice(false), 2000);
              }}
              className="min-h-[42px] rounded-xl border border-[#39FF14]/50 bg-[#0A170F] px-4 py-2 text-sm font-semibold text-[#39FF14] transition-colors hover:bg-[#14301E] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39FF14]"
            >
              Apply Target
            </button>
          </div>

          {/* Data Management */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#183823] pt-5">
            <span className="text-sm text-[#6EE7B7]">Local browser storage</span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onResetSampleData();
                  setConfirmClear(false);
                }}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#255736] bg-[#0F2417] px-3.5 py-2 text-sm font-medium text-[#86EFAC] transition-colors hover:border-[#39FF14]/60 hover:text-[#39FF14] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                <span>Restore Sample Week</span>
              </button>

              {!confirmClear ? (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#255736] bg-[#0F2417] px-3.5 py-2 text-sm font-medium text-rose-300 transition-colors hover:border-rose-400/60 hover:bg-rose-500/15 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  <span>Clear All Data</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      onClearAllData();
                      setConfirmClear(false);
                    }}
                    className="min-h-[40px] rounded-xl bg-rose-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-rose-700 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Confirm Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="min-h-[40px] rounded-xl border border-[#255736] bg-[#0F2417] px-3 py-2 text-sm font-medium text-[#86EFAC] hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
