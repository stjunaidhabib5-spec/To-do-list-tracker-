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
      className="surface rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 cursor-default group"
      style={{
        animationDelay: `${delay}ms`,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--glass-shadow)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
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

      {/* Accent bar at bottom */}
      <div
        className="h-0.5 rounded-full mt-auto transition-all duration-300 opacity-0 group-hover:opacity-100"
        style={{ background: `var(${accentVar})` }}
        aria-hidden="true"
      />
    </div>
  );
}
