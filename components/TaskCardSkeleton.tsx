'use client';

// Shimmer skeleton that mimics a TaskCard shape
export default function TaskCardSkeleton() {
  return (
    <div className="surface rounded-2xl p-5 flex items-start gap-4">
      {/* Checkbox circle */}
      <div
        className="shimmer mt-0.5 flex-shrink-0 w-5 h-5 rounded-full"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2.5">
        {/* Title row */}
        <div className="flex items-center justify-between gap-3">
          <div className="shimmer h-3.5 rounded-full" style={{ width: '60%' }} aria-hidden="true" />
          <div className="shimmer h-5 w-20 rounded-full flex-shrink-0" aria-hidden="true" />
        </div>

        {/* Description */}
        <div className="shimmer h-3 rounded-full" style={{ width: '85%' }} aria-hidden="true" />
        <div className="shimmer h-3 rounded-full" style={{ width: '50%' }} aria-hidden="true" />

        {/* Due date */}
        <div className="shimmer h-3 w-36 rounded-full" aria-hidden="true" />
      </div>
    </div>
  );
}
