'use client';

import type { Category } from '@/lib/types';

type FilterValue = 'All' | Category;

interface TaskFilterBarProps {
  activeFilter: FilterValue;
  onFilterChange: (filter: FilterValue) => void;
  counts: { all: number; academic: number; skill: number };
}

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
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer"
            style={{
              background: isActive ? 'var(--accent)' : 'var(--surface-subtle)',
              color: isActive ? '#ffffff' : 'var(--foreground-muted)',
              boxShadow: isActive ? '0 2px 8px rgba(99,102,241,0.35)' : 'none',
            }}
            aria-pressed={isActive}
          >
            {label}
            <span
              className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
              style={{
                background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--border)',
                color: isActive ? '#ffffff' : 'var(--foreground-muted)',
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
