import React from 'react';
import { Plus } from 'lucide-react';

interface TopBarProps {
  activeSection: 'today' | 'history' | 'goal';
  onNavigate: (section: 'today' | 'history' | 'goal') => void;
  onOpenCustomLog: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeSection,
  onNavigate,
  onOpenCustomLog,
}) => {
  const navItems: Array<{ id: 'today' | 'history' | 'goal'; label: string; href: string }> = [
    { id: 'today', label: 'Today', href: '#today' },
    { id: 'history', label: 'History', href: '#history' },
    { id: 'goal', label: 'Goal & Units', href: '#goal' },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-[#193B25] bg-[#07120B]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        <a
          href="#today"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('today');
          }}
          className="group inline-flex items-center gap-2.5 rounded-lg whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#39FF14]"
        >
          {/* Bespoke Clearwell Neon Droplet Emblem */}
          <svg
            viewBox="0 0 36 36"
            className="h-9 w-9 shrink-0"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="clearwell-logo-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#8BFF70" />
                <stop offset="55%" stopColor="#39FF14" />
                <stop offset="100%" stopColor="#16A34A" />
              </linearGradient>
            </defs>
            <rect
              x="1.5"
              y="1.5"
              width="33"
              height="33"
              rx="10"
              fill="#0B1E12"
              stroke="#39FF14"
              strokeOpacity="0.45"
              strokeWidth="1.5"
            />
            {/* Crisp water droplet */}
            <path
              d="M18 7.2C18 7.2 11.4 15.1 11.4 20.1C11.4 23.75 14.35 26.7 18 26.7C21.65 26.7 24.6 23.75 24.6 20.1C24.6 15.1 18 7.2 18 7.2Z"
              fill="url(#clearwell-logo-grad)"
            />
            {/* Inner specular highlight curve */}
            <path
              d="M14.7 19.6C14.7 21.75 15.85 23.3 17.55 23.75"
              fill="none"
              stroke="#051109"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.7"
            />
            {/* Subtle wellspring ripple ring */}
            <path
              d="M11 28.9C12.85 29.75 15.3 30.2 18 30.2C20.7 30.2 23.15 29.75 25 28.9"
              fill="none"
              stroke="#39FF14"
              strokeWidth="1.4"
              strokeLinecap="round"
              opacity="0.75"
            />
          </svg>
          <span className="font-display text-xl font-extrabold tracking-tight text-white">
            Clear<span className="text-[#39FF14]">well</span>
          </span>
        </a>

        <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-7">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.id);
                }}
                aria-current={isActive ? 'page' : undefined}
                className={`relative py-1 text-base font-medium whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#39FF14] rounded ${
                  isActive
                    ? 'text-[#39FF14] underline decoration-[#39FF14] decoration-2 underline-offset-8'
                    : 'text-[#86EFAC] hover:text-white hover:underline hover:decoration-[#39FF14]/50 hover:underline-offset-8'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenCustomLog}
            className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-[#39FF14] px-4 py-2 text-sm font-bold text-[#04140A] shadow-[0_0_18px_rgba(57,255,20,0.28)] transition-colors duration-150 hover:bg-[#5CFF3B] active:bg-[#2CE60D] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39FF14] cursor-pointer"
          >
            <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Log Custom</span>
          </button>
        </div>
      </div>
    </header>
  );
};
