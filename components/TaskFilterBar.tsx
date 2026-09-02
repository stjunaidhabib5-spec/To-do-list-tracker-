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

  // Per-category accent colours for inactive pill icons
  const accentFor = (value: FilterValue) => {
    if (value === 'Academic') return 'var(--academic)';
    if (value === 'Skill Acquisition') return 'var(--skill)';
    return 'var(--accent)';
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
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold cursor-pointer"
            style={{
              background: isActive ? 'var(--accent)' : 'var(--surface)',
              color: isActive ? '#ffffff' : accentFor(value),
              border: isActive ? '1px solid transparent' : '1px solid var(--border)',
              boxShadow: isActive
                ? '0 2px 10px rgba(99,102,241,0.35), 0 1px 3px rgba(99,102,241,0.2)'
                : 'var(--card-shadow)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease, color 0.15s ease',
            }}
            onMouseEnter={e => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--card-shadow-hover)';
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--card-shadow)';
              }
            }}
            aria-pressed={isActive}
          >
            {FILTER_ICONS[value]}
            {label}
            <span
              className="text-xs px-1.5 py-0.5 rounded-full font-bold tabular-nums"
              style={{
                background: isActive ? 'rgba(255,255,255,0.2)' : `color-mix(in srgb, ${accentFor(value)} 15%, transparent)`,
                color: isActive ? '#ffffff' : accentFor(value),
              }}
            >
              {countFor(value)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
