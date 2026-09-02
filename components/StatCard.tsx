'use client';

interface StatCardProps {
  id: string;
  title: string;
  value: string | number;
  icon: string;
  accentVar: string; /* CSS variable name, e.g. '--accent' */
  delay?: number;
}

export default function StatCard({
  id,
  title,
  value,
  icon,
  accentVar,
  delay = 0,
}: StatCardProps) {
  return (
    <div
      id={id}
      className="relative surface rounded-2xl p-6 flex flex-col gap-4 cursor-default group overflow-hidden"
      style={{
        animationDelay: `${delay}ms`,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--card-shadow-hover)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--card-shadow)';
      }}
    >
      {/* Left accent stripe */}
      <div
        className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full opacity-60"
        style={{ background: `var(${accentVar})` }}
        aria-hidden="true"
      />

      {/* Icon badge */}
      <span
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
        style={{
          background: `color-mix(in srgb, var(${accentVar}) 12%, transparent)`,
          color: `var(${accentVar})`,
        }}
        aria-hidden="true"
      >
        {icon}
      </span>

      {/* Value */}
      <div>
        <p
          className="text-3xl font-bold tracking-tight"
          style={{ color: 'var(--foreground)' }}
        >
          {value}
        </p>
        <p
          className="text-sm mt-1 font-medium"
          style={{ color: 'var(--foreground-muted)' }}
        >
          {title}
        </p>
      </div>

      {/* Accent bar at bottom — slides in on hover */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all duration-300 translate-y-full group-hover:translate-y-0"
        style={{ background: `var(${accentVar})` }}
        aria-hidden="true"
      />
    </div>
  );
}
