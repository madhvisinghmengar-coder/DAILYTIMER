import React from 'react';
import { CheckCircle2, Clock, Droplets } from 'lucide-react';
import {
  DailySummary,
  formatVolume,
  PaceEvaluation,
  Unit,
} from '../utils/hydration';

interface HydrationVesselProps {
  summary: DailySummary;
  unit: Unit;
  pace: PaceEvaluation | null;
  streak: number;
  selectedDateLabel: string;
  isToday: boolean;
  onBackToToday?: () => void;
}

export const HydrationVessel: React.FC<HydrationVesselProps> = ({
  summary,
  unit,
  pace,
  streak,
  selectedDateLabel,
  isToday,
  onBackToToday,
}) => {
  const chamberTop = 28;
  const chamberHeight = 224;
  const fillFraction = summary.clampedPercentage / 100;
  const translateY =
    summary.totalMl === 0
      ? chamberHeight + 16
      : Math.round((1 - fillFraction) * chamberHeight);

  const ticks = [
    { pct: 100, y: 28, label: '100%' },
    { pct: 75, y: 84, label: '75%' },
    { pct: 50, y: 140, label: '50%' },
    { pct: 25, y: 196, label: '25%' },
  ];

  const statusTextColor =
    summary.isGoalReached
      ? 'text-[#39FF14]'
      : pace?.status === 'behind'
        ? 'text-amber-300'
        : 'text-[#6EE7B7]';

  return (
    <section
      aria-labelledby="daily-progress-heading"
      className="rounded-2xl border border-[#1E462C] bg-[#0A170F] p-6 sm:p-8 shadow-[0_0_32px_rgba(57,255,20,0.06)]"
      data-testid="hydration-vessel-panel"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#4ADE80]">
            {isToday ? 'Today' : selectedDateLabel}
            <span className="mx-1.5" aria-hidden="true">
              ·
            </span>
            <span>Daily Hydration Target</span>
          </p>
          <h1
            id="daily-progress-heading"
            className="mt-1 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl text-balance"
          >
            {isToday ? 'Stay steadily hydrated' : `Log for ${selectedDateLabel}`}
          </h1>
        </div>

        {!isToday && onBackToToday && (
          <button
            type="button"
            onClick={onBackToToday}
            className="min-h-[42px] rounded-xl border border-[#255736] bg-[#0F2417] px-3.5 py-2 text-sm font-semibold text-[#86EFAC] transition-colors hover:border-[#39FF14]/60 hover:text-[#39FF14] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39FF14]"
          >
            Return to Today
          </button>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 items-center gap-6 sm:grid-cols-12">
        {/* Bespoke Animated Glass Carafe / Vessel */}
        <div className="flex justify-center sm:col-span-5">
          <div className="relative flex flex-col items-center">
            <svg
              viewBox="0 0 186 280"
              className="h-64 w-44 sm:h-68 sm:w-48"
              role="img"
              aria-label={`Water intake vessel filled to ${summary.percentage} percent (${formatVolume(summary.totalMl, unit)} of ${formatVolume(summary.goalMl, unit)})`}
            >
              <defs>
                <clipPath id="vessel-chamber-clip">
                  <rect x="30" y="28" width="112" height="224" rx="22" />
                </clipPath>
                <linearGradient id="water-fill-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={summary.isGoalReached ? '#6BFF4D' : '#39FF14'} />
                  <stop offset="100%" stopColor={summary.isGoalReached ? '#22C55E' : '#15803D'} />
                </linearGradient>
                <linearGradient id="water-surface-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#B8FF9E" stopOpacity="0.65" />
                  <stop offset="100%" stopColor="#39FF14" stopOpacity="0.15" />
                </linearGradient>
              </defs>

              {/* Dark mineral glass fill */}
              <rect
                x="30"
                y="28"
                width="112"
                height="224"
                rx="22"
                fill="#06100A"
              />

              {/* Clipped rising water column animated via compositor transform */}
              <g clipPath="url(#vessel-chamber-clip)">
                <g
                  style={{
                    transform: `translateY(${translateY}px)`,
                    opacity: summary.totalMl === 0 ? 0 : 1,
                    transition:
                      'transform 500ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms ease-out',
                  }}
                >
                  <path
                    d="M 30 8 Q 58 0, 86 8 T 142 8 L 142 250 L 30 250 Z"
                    transform={`translate(0, ${chamberTop - 6})`}
                    fill="url(#water-surface-gradient)"
                  />
                  <path
                    d="M 30 6 Q 58 12, 86 6 T 142 6 L 142 250 L 30 250 Z"
                    transform={`translate(0, ${chamberTop - 4})`}
                    fill="url(#water-fill-gradient)"
                  />
                </g>
              </g>

              {/* Outer glass vessel contour */}
              <rect
                x="30"
                y="28"
                width="112"
                height="224"
                rx="22"
                fill="none"
                stroke="#2B643E"
                strokeWidth="2.5"
              />

              {/* Subtle vertical glass highlight */}
              <line
                x1="42"
                y1="46"
                x2="42"
                y2="234"
                stroke="#86EFAC"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.22"
              />

              {/* Graduated measurement ticks */}
              {ticks.map((tick) => {
                const isReached = summary.percentage >= tick.pct;
                return (
                  <g key={tick.pct}>
                    <line
                      x1="126"
                      y1={tick.y}
                      x2="140"
                      y2={tick.y}
                      stroke={isReached ? '#39FF14' : '#3B7A54'}
                      strokeWidth="1.75"
                      strokeLinecap="round"
                    />
                    <text
                      x="147"
                      y={tick.y + 4}
                      fontSize="11.5"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="500"
                      fill={isReached ? '#39FF14' : '#6EE7B7'}
                    >
                      {tick.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Tabular Primary Metrics & Pacing */}
        <div className="flex flex-col justify-center sm:col-span-7">
          <div className="flex items-baseline gap-2.5">
            <span
              className="font-mono text-5xl font-semibold tracking-tight text-[#39FF14] tabular-nums sm:text-6xl"
              data-testid="daily-total-value"
            >
              {formatVolume(summary.totalMl, unit)}
            </span>
          </div>

          <p className="mt-2 font-mono text-base text-[#86EFAC] tabular-nums">
            of {formatVolume(summary.goalMl, unit)} daily goal
          </p>

          {/* Clean single-row progress bar */}
          <div className="mt-5">
            <div className="flex items-center justify-between text-sm font-medium">
              <span className="font-mono tabular-nums text-white">
                {summary.percentage}% complete
              </span>
              <span className="font-mono tabular-nums text-[#6EE7B7]">
                {summary.isGoalReached
                  ? `+${formatVolume(summary.overTargetMl, unit)} over goal`
                  : `${formatVolume(summary.remainingMl, unit)} left`}
              </span>
            </div>
            <div
              className="mt-2.5 h-3 w-full overflow-hidden rounded-full bg-[#12291A]"
              role="progressbar"
              aria-valuenow={summary.clampedPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Daily water intake progress"
            >
              <div
                className={`h-full rounded-full transition-transform duration-500 ease-out origin-left ${
                  summary.isGoalReached
                    ? 'bg-[#6BFF4D] shadow-[0_0_12px_rgba(107,255,77,0.55)]'
                    : 'bg-[#39FF14] shadow-[0_0_12px_rgba(57,255,20,0.45)]'
                }`}
                style={{
                  transform: `scaleX(${summary.clampedPercentage / 100})`,
                }}
              />
            </div>
          </div>

          {/* Unboxed status & streak metadata with hairline separator */}
          <div className="mt-6 space-y-3 border-t border-[#183823] pt-5 text-base">
            {isToday && pace && (
              <div className={`flex items-center gap-2 font-medium ${statusTextColor}`}>
                {summary.isGoalReached ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                ) : (
                  <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
                )}
                <span>{pace.message}</span>
              </div>
            )}

            {!isToday && (
              <div className={`flex items-center gap-2 font-medium ${statusTextColor}`}>
                {summary.isGoalReached ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                ) : (
                  <Droplets className="h-4 w-4 shrink-0" aria-hidden="true" />
                )}
                <span>
                  {summary.isGoalReached
                    ? `Goal reached on ${selectedDateLabel}`
                    : `${formatVolume(summary.remainingMl, unit)} short of daily target`}
                </span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 text-sm text-[#6EE7B7]">
              <span className="font-mono tabular-nums text-[#A7F3D0]">
                {summary.entryCount} {summary.entryCount === 1 ? 'drink' : 'drinks'} logged
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums text-[#39FF14]">
                {streak} {streak === 1 ? 'day' : 'days'} streak
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
