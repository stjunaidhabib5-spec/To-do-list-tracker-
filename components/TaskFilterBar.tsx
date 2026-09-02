'use client';

import type { Category } from '@/lib/types';

type FilterValue = 'All' | Category;

interface TaskFilterBarProps {
  activeFilter: FilterValue;
  onFilterChange: (filter: FilterValue) => void;
  counts: { all: number; academic: number; skill: number };
}

// Inline SVG icons for each filter — no external dependency needed
const FILTER_ICONS: Record<FilterValue, React.ReactElement> = {
  'All': (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  ),
  'Academic': (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  ),
  'Skill Acquisition': (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
};

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: 'All', value: 'All' },
  { label: 'Academic', value: 'Academic' },
  { label: 'Skill Acquisition', value: 'Skill Acquisition' },
];

export default function TaskFilterBar({
  activeFilter,
  onFilterChange,
  counts,
}: TaskFilterBarProps) {
  const countFor = (value: FilterValue): number => {
    if (value === 'All') return counts.all;
    if (value === 'Academic') return counts.academic;
    return counts.skill;
  };

  const textClassFor = (value: FilterValue) => {
    if (value === 'Academic') return 'text-blue-600 dark:text-blue-400';
    if (value === 'Skill Acquisition') return 'text-purple-600 dark:text-purple-400';
    return 'text-slate-600 dark:text-slate-400';
  };

  return (
    <div
      id="task-filter-bar"
      className="flex items-center gap-2 flex-wrap"
      role="group"
      aria-label="Filter tasks by category"
    >
      {FILTERS.map(({ label, value }) => {
        const isActive = activeFilter === value;
        return (
          <button
            key={value}
            id={`filter-${value.toLowerCase().replace(' ', '-')}`}
            onClick={() => onFilterChange(value)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold cursor-pointer border shadow-sm transition-all duration-150 ${
              isActive
                ? 'bg-indigo-500 text-white border-transparent shadow-[0_2px_10px_rgba(99,102,241,0.35)]'
                : `bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:-translate-y-[1px] hover:shadow-md ${textClassFor(value)}`
            }`}
            aria-pressed={isActive}
          >
            {FILTER_ICONS[value]}
            {label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full font-bold tabular-nums ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {countFor(value)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
