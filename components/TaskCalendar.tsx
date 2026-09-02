'use client';

import { useState } from 'react';
import type { Task } from '@/lib/types';

interface TaskCalendarProps {
  tasks: Task[];
}

export default function TaskCalendar({ tasks }: TaskCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const today = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  // Helper to format local date components to YYYY-MM-DD safely
  const toDateStr = (y: number, m: number, d: number) => {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  const todayStr = toDateStr(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  // Generate grid cells
  const days = [];
  
  // Padding for previous month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(
      <div key={`empty-${i}`} className="p-2 border-r border-b border-[var(--border)] bg-[var(--background)]/30 min-h-[100px] md:min-h-[120px]"></div>
    );
  }

  // Days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    const cellDateStr = toDateStr(year, month, i);
    
    // Find tasks for this day (comparing in local timezone to prevent day jumps)
    const dayTasks = tasks.filter(t => {
      const taskObj = new Date(t.due_date);
      const taskStr = toDateStr(taskObj.getFullYear(), taskObj.getMonth(), taskObj.getDate());
      return taskStr === cellDateStr;
    });

    const isToday = todayStr === cellDateStr;

    days.push(
      <div key={`day-${i}`} className="p-2 border-r border-b border-[var(--border)] min-h-[100px] md:min-h-[120px] flex flex-col gap-1 transition-colors hover:bg-[var(--foreground)]/[0.03]">
        <div
          className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full transition-colors ${
            isToday
              ? 'text-white'
              : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
          }`}
          style={isToday ? { background: 'var(--accent)' } : {}}
        >
          {i}
        </div>
        <div className="flex flex-col gap-1 mt-1 overflow-y-auto max-h-[120px] no-scrollbar">
          {dayTasks.map(task => {
            const isAcademic = task.category === 'Academic';
            return (
              <div
                key={task.id}
                className={`group/chip relative text-xs px-2 py-1 rounded-md truncate cursor-default transition-all duration-150 flex items-center gap-1 ${
                  task.is_completed ? 'opacity-40' : 'opacity-90 hover:opacity-100 hover:shadow-sm'
                }`}
                style={{
                  backgroundColor: isAcademic ? 'var(--academic-bg)' : 'var(--skill-bg)',
                  color: isAcademic ? 'var(--academic)' : 'var(--skill)',
                  borderLeft: `2px solid ${isAcademic ? 'var(--academic)' : 'var(--skill)'}`,
                }}
                title={`${task.title} · ${task.category}`}
              >
                {/* Category dot */}
                <span
                  className="flex-shrink-0 w-1.5 h-1.5 rounded-full"
                  style={{ background: isAcademic ? 'var(--academic)' : 'var(--skill)' }}
                  aria-hidden="true"
                />
                <span className={`truncate ${task.is_completed ? 'line-through' : ''}`}>
                  {task.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Calculate remaining cells to complete the grid
  const totalCells = days.length;
  const paddingEnd = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  
  for (let i = 0; i < paddingEnd; i++) {
    days.push(
      <div key={`empty-end-${i}`} className="p-2 border-r border-b border-[var(--border)] bg-[var(--background)]/30 min-h-[100px] md:min-h-[120px]"></div>
    );
  }

  return (
    <div id="task-calendar" className="task-calendar-wrapper surface rounded-2xl p-4 md:p-6 flex flex-col w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-[var(--foreground)] flex items-center gap-2">
          {monthNames[month]} <span className="text-[var(--foreground-muted)] font-normal">{year}</span>
        </h2>
        <div className="flex items-center gap-1 md:gap-2">
          <button onClick={today} className="px-3 py-1.5 text-xs md:text-sm rounded-lg hover:bg-[var(--foreground)]/5 text-[var(--foreground-muted)] transition-colors font-medium border border-transparent hover:border-[var(--border)]">
            Today
          </button>
          <div className="flex items-center rounded-lg border border-[var(--border)] overflow-hidden bg-[var(--background)]">
            <button onClick={prevMonth} className="px-2 py-1.5 md:px-3 hover:bg-[var(--foreground)]/5 transition-colors text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div className="w-px h-5 bg-[var(--border)]"></div>
            <button onClick={nextMonth} className="px-2 py-1.5 md:px-3 hover:bg-[var(--foreground)]/5 transition-colors text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 border-t border-l border-[var(--border)] rounded-lg overflow-hidden bg-[var(--background)]">
        {/* Days of week */}
        <div className="grid grid-cols-7 border-b border-[var(--border)] bg-[var(--foreground)]/5">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-2 text-center text-[10px] md:text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-wider border-r border-[var(--border)]">
              <span className="md:hidden">{day.charAt(0)}</span>
              <span className="hidden md:inline">{day}</span>
            </div>
          ))}
        </div>
        
        {/* Calendar cells */}
        <div className="grid grid-cols-7 bg-[var(--background)]">
          {days}
        </div>
      </div>
    </div>
  );
}
