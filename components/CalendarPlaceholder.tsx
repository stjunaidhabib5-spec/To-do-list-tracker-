export default function CalendarPlaceholder() {
  /* Build a simple 7-column grid to suggest a calendar shape */
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const cells = Array.from({ length: 35 }); // 5 weeks

  return (
    <section
      id="calendar-placeholder"
      className="surface rounded-2xl p-6 flex flex-col gap-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
          📅 Calendar
        </h2>
        <span
          className="text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}
        >
          Coming in Phase 3
        </span>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {days.map(d => (
          <div
            key={d}
            className="text-center text-xs font-semibold py-1"
            style={{ color: 'var(--foreground-muted)' }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar cells — decorative skeleton */}
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((_, i) => {
          const isHighlighted = i === 10 || i === 16 || i === 22; // pseudo "tasks"
          return (
            <div
              key={i}
              className="aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-colors"
              style={{
                background: isHighlighted
                  ? 'var(--accent-subtle)'
                  : 'var(--surface-subtle)',
                color: isHighlighted
                  ? 'var(--accent)'
                  : 'var(--foreground-muted)',
              }}
              aria-hidden="true"
            >
              {i + 1 <= 31 ? i + 1 : ''}
            </div>
          );
        })}
      </div>

      {/* Overlay message */}
      <p
        className="text-center text-xs mt-1"
        style={{ color: 'var(--foreground-muted)' }}
      >
        Live tasks will populate this calendar once the database is connected in Phase 2–3.
      </p>
    </section>
  );
}
