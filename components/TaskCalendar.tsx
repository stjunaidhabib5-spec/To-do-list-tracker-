'use client';

// FullCalendar must not be SSR-rendered — the DayTableView error occurs when
// Next.js tries to render it server-side. We guard with a client-only check.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import type { Task } from '@/lib/types';

interface TaskCalendarProps {
  tasks: Task[];
}

function taskToEvent(task: Task) {
  const isAcademic = task.category === 'Academic';
  const color   = isAcademic ? 'var(--academic)' : 'var(--skill)';
  const bgColor = isAcademic ? 'var(--academic-bg)' : 'var(--skill-bg)';
  return {
    id: task.id,
    title: task.title,
    start: task.due_date,
    allDay: false,
    backgroundColor: bgColor,
    borderColor: color,
    textColor: color,
    extendedProps: { task },
    classNames: task.is_completed ? ['fc-event-completed'] : [],
  };
}

// Lazy-load FullCalendar modules client-side only to prevent SSR crash.
// This pattern avoids next/dynamic module resolution issues entirely.
let cachedFC: any = null;

export default function TaskCalendar({ tasks }: TaskCalendarProps) {
  const [FC, setFC] = useState<any>(cachedFC);

  useEffect(() => {
    if (cachedFC) { setFC(cachedFC); return; }
    Promise.all([
      import('@fullcalendar/react'),
      import('@fullcalendar/daygrid'),
      import('@fullcalendar/timegrid'),
      import('@fullcalendar/interaction'),
    ]).then(([fcReact, dayGrid, timeGrid, interaction]) => {
      cachedFC = {
        FullCalendar: fcReact.default as any,
        dayGridPlugin: dayGrid.default,
        timeGridPlugin: timeGrid.default,
        interactionPlugin: interaction.default,
      };
      setFC(cachedFC);
    });
  }, []);

  const events = tasks.map(taskToEvent);

  return (
    <div id="task-calendar" className="task-calendar-wrapper surface rounded-2xl p-4 md:p-6">
      {!FC ? (
        <div
          className="flex items-center justify-center min-h-64"
          style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem' }}
        >
          Loading calendar…
        </div>
      ) : (
        <FC.FullCalendar
          plugins={[FC.dayGridPlugin, FC.timeGridPlugin, FC.interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek',
          }}
          buttonText={{ today: 'Today', month: 'Month', week: 'Week' }}
          events={events}
          height="auto"
          eventDisplay="block"
          eventTimeFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short' }}
          dayMaxEvents={3}
          moreLinkText={(n: number) => `+${n} more`}
          nowIndicator
        />
      )}
    </div>
  );
}
