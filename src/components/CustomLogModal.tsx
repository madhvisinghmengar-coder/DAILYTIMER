import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import {
  DRINK_OPTIONS,
  DrinkType,
  Unit,
  validateCustomAmount,
} from '../utils/hydration';

interface CustomLogModalProps {
  isOpen: boolean;
  unit: Unit;
  initialDrinkType: DrinkType;
  selectedDateLabel: string;
  isToday: boolean;
  onClose: () => void;
  onSubmit: (rawAmountMl: number, label: string, drinkType: DrinkType) => void;
}

export const CustomLogModal: React.FC<CustomLogModalProps> = ({
  isOpen,
  unit,
  initialDrinkType,
  selectedDateLabel,
  isToday,
  onClose,
  onSubmit,
}) => {
  const [amountInput, setAmountInput] = useState('');
  const [drinkType, setDrinkType] = useState<DrinkType>(initialDrinkType);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setAmountInput('');
      setNote('');
      setError(null);
      setDrinkType(initialDrinkType);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialDrinkType]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateCustomAmount(amountInput, unit);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }
    const defaultLabel =
      DRINK_OPTIONS.find((d) => d.type === drinkType)?.label ?? 'Pure Water';
    onSubmit(validation.ml, note.trim() || defaultLabel, drinkType);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-xs sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-log-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md rounded-t-2xl border border-[#255736] bg-[#0A170F] p-6 shadow-2xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="custom-log-modal-title"
              className="font-display text-xl font-bold text-white"
            >
              Log Custom Intake
            </h2>
            <p className="mt-0.5 text-sm text-[#6EE7B7]">
              Recording for {isToday ? 'Today' : selectedDateLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close custom log dialog"
            className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-[#86EFAC] transition-colors hover:bg-[#14301E] hover:text-white cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39FF14]"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="custom-amount-input"
              className="block text-base font-medium text-emerald-50"
            >
              Volume ({unit === 'oz' ? 'fl oz' : 'ml'})
            </label>
            <div className="relative mt-1.5">
              <input
                ref={inputRef}
                id="custom-amount-input"
                type="number"
                inputMode="decimal"
                step={unit === 'oz' ? '0.5' : '10'}
                placeholder={unit === 'oz' ? 'e.g. 14' : 'e.g. 400'}
                value={amountInput}
                onChange={(e) => {
                  setAmountInput(e.target.value);
                  if (error) setError(null);
                }}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'custom-amount-error' : undefined}
                className={`block w-full rounded-xl border bg-[#06100A] px-4 py-3 pr-16 font-mono text-base text-white placeholder:text-[#4ADE80]/45 focus:outline-none focus:ring-2 ${
                  error
                    ? 'border-rose-400 focus:ring-rose-500/25'
                    : 'border-[#255736] focus:border-[#39FF14] focus:ring-[#39FF14]/25'
                }`}
              />
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center font-mono text-sm font-medium text-[#6EE7B7]">
                {unit === 'oz' ? 'fl oz' : 'ml'}
              </span>
            </div>
            {error && (
              <p
                id="custom-amount-error"
                role="alert"
                className="mt-1.5 text-sm font-medium text-rose-400"
              >
                {error}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="custom-drink-select"
              className="block text-base font-medium text-emerald-50"
            >
              Beverage Type
            </label>
            <select
              id="custom-drink-select"
              value={drinkType}
              onChange={(e) => setDrinkType(e.target.value as DrinkType)}
              className="mt-1.5 block min-h-[46px] w-full rounded-xl border border-[#255736] bg-[#06100A] px-3.5 py-2.5 text-base text-white focus:border-[#39FF14] focus:outline-none focus:ring-2 focus:ring-[#39FF14]/25"
            >
              {DRINK_OPTIONS.map((option) => (
                <option key={option.type} value={option.type}>
                  {option.label} ({option.note})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="custom-note-input"
              className="block text-base font-medium text-emerald-50"
            >
              Label (optional)
            </label>
            <input
              id="custom-note-input"
              type="text"
              maxLength={40}
              placeholder="e.g. Post-workout bottle"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1.5 block min-h-[46px] w-full rounded-xl border border-[#255736] bg-[#06100A] px-3.5 py-2.5 text-base text-white placeholder:text-[#4ADE80]/45 focus:border-[#39FF14] focus:outline-none focus:ring-2 focus:ring-[#39FF14]/25"
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-[#183823] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] rounded-xl border border-[#255736] bg-[#0F2417] px-4 py-2 text-sm font-medium text-[#86EFAC] transition-colors hover:text-white cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39FF14]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[44px] rounded-xl bg-[#39FF14] px-5 py-2 text-base font-bold text-[#04140A] transition-colors hover:bg-[#5CFF3B] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39FF14]"
            >
              Add Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
