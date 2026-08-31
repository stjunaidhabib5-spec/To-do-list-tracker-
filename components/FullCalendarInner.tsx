'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { Task } from '@/lib/types';

interface InnerProps {
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

export default function FullCalendarInner({ tasks }: InnerProps) {
  const events = tasks.map(taskToEvent);

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin] as any}
      initialView="dayGridMonth"
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek',
      }}
      events={events}
      height="auto"
      eventDisplay="block"
      eventTimeFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short' }}
      dayMaxEvents={3}
      moreLinkText={(n: number) => `+${n} more`}
      nowIndicator
    />
  );
}
