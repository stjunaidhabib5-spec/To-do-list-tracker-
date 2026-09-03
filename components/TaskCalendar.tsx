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
  const prevMonthDays = new Date(year, month, 0).getDate();

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
    const dayNum = prevMonthDays - firstDayOfMonth + i + 1;
    days.push(
      <div key={`empty-${i}`} className="p-2 min-h-[100px] md:min-h-[120px] rounded-xl border border-transparent">
        <div className="w-7 h-7 flex items-center justify-center text-xs font-medium text-slate-400 dark:text-slate-600 opacity-40">
          {dayNum}
        </div>
      </div>
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
      <div key={`day-${i}`} className="p-2 border border-slate-200/50 dark:border-white/[0.06] rounded-xl transition-all duration-200 hover:bg-slate-500/5 dark:hover:bg-white/[0.04] min-h-[100px] md:min-h-[120px] flex flex-col gap-1">
        <div
          className={`w-7 h-7 flex items-center justify-center ${
            isToday
              ? 'rounded-full font-bold text-xs bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_0_14px_rgba(99,102,241,0.6)]'
              : 'text-xs font-medium text-slate-700 dark:text-slate-300'
          }`}
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
    const dayNum = i + 1;
    days.push(
      <div key={`empty-end-${i}`} className="p-2 min-h-[100px] md:min-h-[120px] rounded-xl border border-transparent">
        <div className="w-7 h-7 flex items-center justify-center text-xs font-medium text-slate-400 dark:text-slate-600 opacity-40">
          {dayNum}
        </div>
      </div>
    );
  }

  return (
    <div id="task-calendar" className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 shadow-xl flex flex-col w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          {monthNames[month]} <span className="font-normal opacity-70">{year}</span>
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={today} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-300/50 dark:border-white/10 text-slate-700 dark:text-slate-200 transition-all shadow-sm">
            Today
          </button>
          <button onClick={prevMonth} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-300/50 dark:border-white/10 text-slate-700 dark:text-slate-200 transition-all shadow-sm flex items-center justify-center" aria-label="Previous Month">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button onClick={nextMonth} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-300/50 dark:border-white/10 text-slate-700 dark:text-slate-200 transition-all shadow-sm flex items-center justify-center" aria-label="Next Month">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex flex-col flex-1">
        {/* Days of week */}
        <div className="grid grid-cols-7 border-b border-slate-200/50 dark:border-white/10 pb-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-2 text-center text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-400 uppercase">
              <span className="md:hidden">{day.charAt(0)}</span>
              <span className="hidden md:inline">{day}</span>
            </div>
          ))}
        </div>
        
        {/* Calendar cells */}
        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {days}
        </div>
      </div>
    </div>
  );
}
