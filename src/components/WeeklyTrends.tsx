import React from 'react';
import {
  DayTrendPoint,
  formatCompactVolume,
  formatVolume,
  Unit,
} from '../utils/hydration';

interface WeeklyTrendsProps {
  days: DayTrendPoint[];
  selectedDateKey: string;
  dailyGoalMl: number;
  unit: Unit;
  streak: number;
  onSelectDate: (dateKey: string) => void;
}

export const WeeklyTrends: React.FC<WeeklyTrendsProps> = ({
  days,
  selectedDateKey,
  dailyGoalMl,
  unit,
  streak,
  onSelectDate,
}) => {
  const maxTotal = Math.max(dailyGoalMl * 1.15, ...days.map((d) => d.totalMl));
  const goalLinePercent = Math.min(95, Math.round((dailyGoalMl / maxTotal) * 100));

  const averageMl =
    days.length > 0
      ? Math.round(days.reduce((sum, d) => sum + d.totalMl, 0) / days.length)
      : 0;
  const daysMet = days.filter((d) => d.isGoalReached).length;
  const bestDayMl = days.reduce((max, d) => Math.max(max, d.totalMl), 0);

  return (
    <section
      id="history"
      aria-labelledby="weekly-trends-heading"
      className="scroll-mt-20 rounded-2xl border border-[#1E462C] bg-[#0A170F] p-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2
            id="weekly-trends-heading"
            className="font-display text-xl font-semibold text-white"
          >
            7-Day Hydration History
          </h2>
          <p className="mt-0.5 text-sm text-[#6EE7B7]">
            Select any day bar to inspect or edit entries
            <span className="mx-1.5" aria-hidden="true">
              ·
            </span>
            <span className="text-[#4ADE80]">
              Dashed line marks {formatVolume(dailyGoalMl, unit)} target
            </span>
          </p>
        </div>
      </div>

      {/* Summary KPI strip separated by hairline border */}
      <div className="mt-5 grid grid-cols-3 gap-4 border-y border-[#183823] py-4">
        <div>
          <p className="text-sm text-[#6EE7B7]">7-Day Average</p>
          <p className="mt-0.5 font-mono text-lg font-semibold text-white tabular-nums sm:text-xl">
            {formatVolume(averageMl, unit)}
          </p>
        </div>
        <div>
          <p className="text-sm text-[#6EE7B7]">Goals Met</p>
          <p className="mt-0.5 font-mono text-lg font-semibold text-[#39FF14] tabular-nums sm:text-xl">
            {daysMet} / {days.length} days
          </p>
        </div>
        <div>
          <p className="text-sm text-[#6EE7B7]">Best Day / Streak</p>
          <p className="mt-0.5 font-mono text-lg font-semibold text-white tabular-nums sm:text-xl">
            {formatCompactVolume(bestDayMl, unit)} · {streak}d
          </p>
        </div>
      </div>

      {/* Interactive 7-day vertical bar chart */}
      <div className="mt-6">
        <div
          className="grid grid-cols-7 items-end gap-1 sm:gap-2"
          role="group"
          aria-label="Last 7 days water intake chart"
        >
          {days.map((day) => {
            const isSelected = day.dateKey === selectedDateKey;
            const heightPct =
              day.totalMl > 0
                ? Math.max(6, Math.min(100, Math.round((day.totalMl / maxTotal) * 100)))
                : 0;

            return (
              <button
                key={day.dateKey}
                type="button"
                onClick={() => onSelectDate(day.dateKey)}
                aria-pressed={isSelected}
                aria-label={`${day.weekdayLabel} ${day.shortDate}: ${formatVolume(day.totalMl, unit)}, ${day.percentage}% of goal${day.isGoalReached ? ', goal reached' : ''}`}
                className={`group flex flex-col items-center rounded-xl px-0.5 py-2 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39FF14] ${
                  isSelected
                    ? 'bg-[#122B1B] ring-1 ring-[#39FF14]/60'
                    : 'hover:bg-[#0F2417]'
                }`}
              >
                <span className="mb-1.5 flex h-5 items-center font-mono text-[11px] font-medium text-[#86EFAC] tabular-nums whitespace-nowrap">
                  {day.totalMl > 0 ? formatCompactVolume(day.totalMl, unit) : '0'}
                </span>

                <div className="relative flex h-36 w-full max-w-[40px] items-end overflow-hidden rounded-lg bg-[#06100A] p-0.5">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 z-10 border-t border-dashed border-[#39FF14]/80"
                    style={{ bottom: `${goalLinePercent}%` }}
                  />
                  {heightPct > 0 && (
                    <div
                      className={`relative z-0 w-full rounded-md transition-all duration-300 ${
                        day.isGoalReached
                          ? 'bg-[#39FF14] group-hover:bg-[#6BFF4D]'
                          : isSelected
                            ? 'bg-[#22C55E]'
                            : 'bg-[#16A34A] group-hover:bg-[#22C55E]'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  )}
                </div>

                <span
                  className={`mt-2 text-sm font-semibold ${
                    isSelected ? 'text-[#39FF14]' : 'text-emerald-50'
                  }`}
                >
                  {day.isToday ? 'Today' : day.weekdayLabel}
                </span>
                <span className="font-mono text-xs text-[#6EE7B7] tabular-nums">
                  {day.shortDate}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
