import React from 'react';
import { Droplets, Trash2 } from 'lucide-react';
import { formatVolume, Unit, WaterEntry } from '../utils/hydration';

interface DailyLogListProps {
  entries: WaterEntry[];
  unit: Unit;
  selectedDateLabel: string;
  isToday: boolean;
  onDeleteEntry: (id: string) => void;
  onLogFirstGlass: () => void;
}

export const DailyLogList: React.FC<DailyLogListProps> = ({
  entries,
  unit,
  selectedDateLabel,
  isToday,
  onDeleteEntry,
  onLogFirstGlass,
}) => {
  const formatTime = (iso: string) => {
    const dt = new Date(iso);
    return dt.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <section
      aria-labelledby="daily-log-heading"
      className="rounded-2xl border border-[#1E462C] bg-[#0A170F] p-6"
    >
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h2
            id="daily-log-heading"
            className="font-display text-xl font-semibold text-white"
          >
            {isToday ? "Today's Intake Log" : `${selectedDateLabel} Log`}
          </h2>
          <p className="mt-0.5 text-sm text-[#6EE7B7]">
            <span className="font-mono tabular-nums text-[#39FF14]">{entries.length}</span>{' '}
            {entries.length === 1 ? 'recorded entry' : 'recorded entries'}
          </p>
        </div>
      </div>

      {entries.length === 0 ? (
        <div
          className="mt-5 flex flex-col items-center justify-center border-t border-[#183823] px-4 py-10 text-center"
          data-testid="empty-log-state"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#122B1B] text-[#39FF14]">
            <Droplets className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3 className="mt-3 font-display text-base font-semibold text-white">
            No drinks logged {isToday ? 'yet today' : `for ${selectedDateLabel}`}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-[#86EFAC]">
            Tap any quick-add container or log your first glass to start tracking hydration progress.
          </p>
          <button
            type="button"
            onClick={onLogFirstGlass}
            className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#39FF14] px-4 py-2 text-sm font-bold text-[#04140A] shadow-[0_0_16px_rgba(57,255,20,0.25)] transition-colors hover:bg-[#5CFF3B] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39FF14]"
          >
            Log First Glass ({unit === 'oz' ? '+8 fl oz' : '+250 ml'})
          </button>
        </div>
      ) : (
        <ul
          className="mt-4 divide-y divide-[#173522]"
          aria-label="Water intake entries"
          data-testid="daily-log-entries"
        >
          {entries.map((entry) => {
            const timeStr = formatTime(entry.timestamp);
            const effectiveFormatted = formatVolume(entry.effectiveMl, unit);
            const rawFormatted = formatVolume(entry.rawAmountMl, unit);
            const hasHydrationAdjustment = entry.effectiveMl !== entry.rawAmountMl;

            return (
              <li
                key={entry.id}
                className="flex min-h-[60px] items-center justify-between gap-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                    <span className="truncate text-base font-medium text-white">
                      {entry.label}
                    </span>
                    <span className="font-mono text-sm text-[#6EE7B7] tabular-nums">
                      {timeStr}
                    </span>
                  </div>
                  {hasHydrationAdjustment && (
                    <p className="mt-0.5 text-sm text-[#4ADE80]">
                      {rawFormatted} poured
                      <span className="mx-1.5" aria-hidden="true">
                        ·
                      </span>
                      <span>{effectiveFormatted} effective hydration</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-base font-semibold text-[#39FF14] tabular-nums">
                    +{effectiveFormatted}
                  </span>
                  <button
                    type="button"
                    onClick={() => onDeleteEntry(entry.id)}
                    aria-label={`Remove ${entry.label} (${effectiveFormatted}) logged at ${timeStr}`}
                    className="inline-flex min-h-[42px] min-w-[42px] items-center justify-center rounded-xl text-[#6EE7B7]/80 transition-colors hover:bg-rose-500/15 hover:text-rose-400 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39FF14]"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};
