import React from 'react';
import { CupSoda, GlassWater, Milk, Plus, RotateCcw } from 'lucide-react';
import {
  DRINK_OPTIONS,
  DrinkType,
  ozToMl,
  Unit,
  VESSEL_PRESETS,
} from '../utils/hydration';

interface QuickLogPanelProps {
  unit: Unit;
  selectedDrinkType: DrinkType;
  onSelectDrinkType: (drinkType: DrinkType) => void;
  onQuickAdd: (rawAmountMl: number, label: string, drinkType: DrinkType) => void;
  onUndoLast: () => void;
  canUndo: boolean;
  onOpenCustomLog: () => void;
  selectedDateLabel: string;
  isToday: boolean;
}

export const QuickLogPanel: React.FC<QuickLogPanelProps> = ({
  unit,
  selectedDrinkType,
  onSelectDrinkType,
  onQuickAdd,
  onUndoLast,
  canUndo,
  onOpenCustomLog,
  selectedDateLabel,
  isToday,
}) => {
  const presetIcons = [GlassWater, CupSoda, Milk, Milk];
  const activeDrink =
    DRINK_OPTIONS.find((option) => option.type === selectedDrinkType) ?? DRINK_OPTIONS[0];

  return (
    <section
      aria-labelledby="quick-log-heading"
      className="rounded-2xl border border-[#1E462C] bg-[#0A170F] p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2
            id="quick-log-heading"
            className="font-display text-xl font-semibold text-white"
          >
            Quick Add {isToday ? '' : `(${selectedDateLabel})`}
          </h2>
          <p className="mt-0.5 text-sm text-[#6EE7B7]">
            One tap to log a container
            <span className="mx-1.5" aria-hidden="true">
              ·
            </span>
            <span className="text-[#39FF14]">{activeDrink.label}</span>
            {activeDrink.hydrationFactor < 1 && (
              <>
                <span className="mx-1.5" aria-hidden="true">
                  ·
                </span>
                <span>{Math.round(activeDrink.hydrationFactor * 100)}% effective</span>
              </>
            )}
          </p>
        </div>

        {canUndo && (
          <button
            type="button"
            onClick={onUndoLast}
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-[#255736] bg-[#0F2417] px-3.5 py-2 text-sm font-medium text-[#86EFAC] transition-colors hover:border-[#39FF14]/60 hover:text-[#39FF14] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39FF14]"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>Undo Last</span>
          </button>
        )}
      </div>

      {/* Drink Type Segmented Selector */}
      <div
        className="mt-4 flex flex-nowrap items-center gap-1 overflow-x-auto rounded-xl border border-[#183823] bg-[#060F0A] p-1"
        role="group"
        aria-label="Beverage type"
      >
        {DRINK_OPTIONS.map((drink) => {
          const isSelected = drink.type === selectedDrinkType;
          const shortLabel =
            drink.type === 'water'
              ? 'Water'
              : drink.type === 'sparkling'
                ? 'Sparkling'
                : drink.type === 'tea'
                  ? 'Herbal Tea'
                  : drink.label;
          return (
            <button
              key={drink.type}
              type="button"
              onClick={() => onSelectDrinkType(drink.type)}
              aria-pressed={isSelected}
              aria-label={drink.label}
              className={`min-h-[40px] flex-1 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#39FF14] ${
                isSelected
                  ? 'bg-[#39FF14] font-bold text-[#04140A]'
                  : 'text-[#86EFAC] hover:text-white'
              }`}
            >
              {shortLabel}
            </button>
          );
        })}
      </div>

      {/* Preset Vessel Buttons */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {VESSEL_PRESETS.map((preset, idx) => {
          const Icon = presetIcons[idx] ?? GlassWater;
          const amountMl = unit === 'oz' ? ozToMl(preset.amountOz) : preset.amountMl;
          const displayAmount =
            unit === 'oz' ? `${preset.amountOz} fl oz` : `${preset.amountMl} ml`;
          const entryLabel =
            selectedDrinkType === 'water'
              ? preset.label
              : `${activeDrink.label} (${preset.label})`;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onQuickAdd(amountMl, entryLabel, selectedDrinkType)}
              className="group flex min-h-[92px] flex-col items-start justify-between rounded-xl border border-[#1E462C] bg-[#0E2015] p-3.5 text-left transition-colors duration-150 hover:border-[#39FF14]/70 hover:bg-[#132B1C] active:scale-[0.99] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39FF14]"
            >
              <div className="flex w-full items-center justify-between">
                <Icon
                  className="h-4 w-4 text-[#39FF14] transition-colors group-hover:text-[#7BFF61]"
                  aria-hidden="true"
                />
                <Plus
                  className="h-4 w-4 text-[#6EE7B7] transition-colors group-hover:text-[#39FF14]"
                  aria-hidden="true"
                />
              </div>
              <div className="mt-2">
                <div className="font-mono text-base font-semibold text-white tabular-nums">
                  +{displayAmount}
                </div>
                <div className="text-sm text-[#6EE7B7]">{preset.label}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#183823] pt-3.5">
        <span className="text-sm text-[#6EE7B7]">
          Need an exact pour or custom note?
        </span>
        <button
          type="button"
          onClick={onOpenCustomLog}
          className="min-h-[40px] text-sm font-semibold text-[#39FF14] hover:text-[#7BFF61] hover:underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39FF14] rounded"
        >
          Enter Custom Amount
        </button>
      </div>
    </section>
  );
};
