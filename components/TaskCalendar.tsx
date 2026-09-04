'use client';

import { useState, useEffect } from 'react';
import type { Task } from '@/lib/types';

const getNoteColor = (dayIndex: number) => {
  const colors = [
    { bg: 'bg-emerald-100', border: 'border-emerald-300', text: 'text-emerald-950' }, // 0
    { bg: 'bg-rose-100', border: 'border-rose-300', text: 'text-rose-950' }, // 1
    { bg: 'bg-amber-100', border: 'border-amber-300', text: 'text-amber-950' }, // 2
    { bg: 'bg-sky-100', border: 'border-sky-300', text: 'text-sky-950' }, // 3
  ];
  return colors[dayIndex % 4];
};

const isSameCalendarDay = (taskDateVal: any, cellDate: Date) => {
  if (!taskDateVal) return false;
  
  const taskDate = new Date(taskDateVal);
  if (isNaN(taskDate.getTime())) return false;

  // 1. Local Date Match (same year, month, day in user's local timezone)
  const matchLocal = 
    taskDate.getFullYear() === cellDate.getFullYear() &&
    taskDate.getMonth() === cellDate.getMonth() &&
    taskDate.getDate() === cellDate.getDate();

  // 2. Formatted String Match (YYYY-MM-DD)
  const formatLocal = (d: Date) => 
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  
  const matchFormatted = formatLocal(taskDate) === formatLocal(cellDate);

  // 3. Raw ISO string prefix match (in case it is stored as YYYY-MM-DD...)
  let matchRaw = false;
  if (typeof taskDateVal === 'string') {
    matchRaw = taskDateVal.startsWith(formatLocal(cellDate));
  }

  return matchLocal || matchFormatted || matchRaw;
};

interface TaskCalendarProps {
  tasks: Task[];
}

export default function TaskCalendar({ tasks }: TaskCalendarProps) {
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Sync localTasks if the tasks prop updates from server
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    const handleTasksUpdated = (event: any) => {
      if (event.detail) {
        setLocalTasks(prev => {
          const exists = prev.some(t => t.id === event.detail.id);
          return exists ? prev.map(t => t.id === event.detail.id ? event.detail : t) : [...prev, event.detail];
        });
      }
    };

    window.addEventListener('tasks-updated', handleTasksUpdated);
    return () => {
      window.removeEventListener('tasks-updated', handleTasksUpdated);
    };
  }, []);
  
  // Modals state
  const [selectedDayTasks, setSelectedDayTasks] = useState<{ year: number, month: number, date: number, tasks: Task[] } | null>(null);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<Task | null>(null);

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
  const rotations = ['rotate-[-1.5deg]', 'rotate-[1.2deg]', 'rotate-[-0.8deg]', 'rotate-[1.8deg]'];
  const lightColors = [
    'bg-emerald-100/95 border-emerald-200 text-emerald-950 hover:border-emerald-300',
    'bg-rose-100/95 border-rose-200 text-rose-950 hover:border-rose-300',
    'bg-amber-100/95 border-amber-200 text-amber-950 hover:border-amber-300',
    'bg-sky-100/95 border-sky-200 text-sky-950 hover:border-sky-300'
  ];

  for (let i = 1; i <= daysInMonth; i++) {
    const cellDateStr = toDateStr(year, month, i);
    
    const cellDateObj = new Date(year, month, i);
    
    // Find tasks for this day
    const dayTasks = localTasks.filter(t => {
      const dateVal = t.due_date || (t as any).dueDate;
      return isSameCalendarDay(dateVal, cellDateObj);
    });

    const isToday = todayStr === cellDateStr;
    const rotation = rotations[i % 4];
    const color = lightColors[i % 4];

    days.push(
      <div 
        key={`day-${i}`} 
        onClick={() => {
          if (dayTasks.length > 0) {
            setSelectedDayTasks({ year, month, date: i, tasks: dayTasks });
          }
        }}
        className={`sticky-paper rounded-xl p-3 min-h-[95px] md:min-h-[120px] flex flex-col justify-start relative cursor-pointer shadow-md backdrop-blur-md border ${rotation} ${color}`}
      >
        {/* Tape strip */}
        <div className="w-8 h-3.5 bg-white/60 border border-white/40 shadow-sm backdrop-blur-sm -top-1.5 left-1/2 -translate-x-1/2 absolute rounded-sm z-10" />

        {/* Date number */}
        <div
          className={`font-display text-lg font-bold w-7 h-7 flex items-center justify-center ${
            isToday
              ? 'rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_0_14px_rgba(99,102,241,0.6)]'
              : ''
          }`}
        >
          {i}
        </div>
        
        {/* Tasks (handwriting style) */}
        <div className="mt-1 flex flex-col gap-0.5 w-full text-left">
          {dayTasks.slice(0, 3).map(task => (
            <div 
              key={task.id}
              onClick={(e) => { e.stopPropagation(); setSelectedTaskDetail(task); }}
              className="font-handwriting text-sm leading-tight text-slate-800 dark:text-slate-900 font-semibold truncate cursor-pointer hover:text-indigo-950"
              style={{ transform: 'rotate(-1.5deg)' }}
              title={task.title}
            >
              • {task.title}
            </div>
          ))}
          {dayTasks.length > 3 && (
            <span className="font-handwriting text-xs font-bold text-slate-600" style={{ transform: 'rotate(-1.5deg)' }}>
              +{dayTasks.length - 3} more
            </span>
          )}
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
    <div id="task-calendar" className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 shadow-xl flex flex-col w-full">
      <style dangerouslySetInnerHTML={{__html: `
        .sticky-wrapper {
          perspective: 800px !important;
          overflow: visible !important;
        }
        .sticky-paper {
          transform-origin: top center !important;
          transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.3s ease !important;
          backface-visibility: hidden;
          will-change: transform, box-shadow;
        }
        .sticky-paper:hover {
          /* Flaps bottom up like real loose paper pinned at the top */
          transform: perspective(800px) rotateX(24deg) translateY(-6px) scale(1.04) !important;
          box-shadow: 0 22px 28px -6px rgba(0, 0, 0, 0.28), 0 10px 12px -4px rgba(0, 0, 0, 0.12) !important;
          z-index: 50 !important;
        }
        .dark .sticky-paper:hover {
          box-shadow: 0 24px 32px -6px rgba(0, 0, 0, 0.75), 0 0 16px rgba(6, 182, 212, 0.25) !important;
        }
      `}} />
      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="font-display tracking-wider uppercase text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          {monthNames[month]} <span className="font-normal opacity-70">{year}</span>
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={today} className="font-display tracking-wider uppercase px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-300/50 dark:border-white/10 text-slate-700 dark:text-slate-200 transition-all shadow-sm">
            Today
          </button>
          <button onClick={prevMonth} className="font-display tracking-wider uppercase px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-300/50 dark:border-white/10 text-slate-700 dark:text-slate-200 transition-all shadow-sm flex items-center justify-center" aria-label="Previous Month">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button onClick={nextMonth} className="font-display tracking-wider uppercase px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-300/50 dark:border-white/10 text-slate-700 dark:text-slate-200 transition-all shadow-sm flex items-center justify-center" aria-label="Next Month">
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
        <div className="sticky-wrapper grid grid-cols-7 gap-1 md:gap-2">
          {days}
        </div>
      </div>

      {/* Modals */}
      
      {/* Day Tasks Modal */}
      {selectedDayTasks && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 transition-opacity animate-fade-in-up"
          style={{ animationDuration: '0.2s' }}
          onClick={() => setSelectedDayTasks(null)}
        >
          {(() => {
            const noteColor = getNoteColor(selectedDayTasks.date);
            const formattedDate = new Date(selectedDayTasks.year, selectedDayTasks.month, selectedDayTasks.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            return (
              <div 
                className={`relative w-full max-w-md ${noteColor.bg} ${noteColor.border} border-2 rounded-2xl shadow-2xl p-6 select-none transition-all`}
                onClick={e => e.stopPropagation()}
              >
                {/* Frosted Scotch Tape at Top */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-7 bg-white/70 backdrop-blur-xs border border-white/50 shadow-xs rounded-xs pointer-events-none rotate-[-0.5deg]" />
                
                {/* Close Button */}
                <button 
                  onClick={() => setSelectedDayTasks(null)} 
                  className="absolute top-4 right-4 text-slate-600 hover:text-slate-900 text-xl font-bold"
                >
                  ✕
                </button>

                {/* Header */}
                <h3 className="font-handwriting text-3xl font-bold text-slate-900 tracking-wide">{formattedDate}</h3>
                <p className="font-handwriting text-lg font-medium text-slate-700 mt-0.5">
                  {selectedDayTasks.tasks.length} {selectedDayTasks.tasks.length === 1 ? 'Task' : 'Tasks'}
                </p>

                {/* Task Rows */}
                <div className="mt-4 flex flex-col gap-2.5 max-h-[60vh] overflow-y-auto pr-1 no-scrollbar">
                  {selectedDayTasks.tasks.map(task => (
                    <div 
                      key={task.id}
                      onClick={() => {
                        setSelectedTaskDetail(task);
                      }}
                      className="cursor-pointer bg-white/60 hover:bg-white/85 border border-black/5 rounded-xl p-3 flex items-center justify-between shadow-xs transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={task.is_completed} readOnly className="rounded-full text-emerald-600 focus:ring-0" />
                        <span className={`font-handwriting text-xl font-semibold text-slate-900 ${task.is_completed ? 'line-through opacity-70 text-slate-600' : ''}`}>{task.title}</span>
                      </div>
                      <span className="font-handwriting text-xs font-bold px-2.5 py-0.5 rounded-md bg-black/10 text-slate-800 tracking-wider">{task.category}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTaskDetail && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/35 transition-opacity animate-fade-in-up"
          style={{ animationDuration: '0.2s' }}
          onClick={() => setSelectedTaskDetail(null)}
        >
          {(() => {
            const dayStr = selectedTaskDetail.due_date ? String(selectedTaskDetail.due_date).split('T')[0].split('-')[2] : '1';
            const dayIndex = parseInt(dayStr, 10) || 1;
            const noteColor = getNoteColor(dayIndex);
            
            return (
              <div 
                className={`relative w-full max-w-md ${noteColor.bg} ${noteColor.border} border-2 rounded-2xl shadow-2xl p-6 select-none transition-all`}
                onClick={e => e.stopPropagation()}
              >
                {/* Frosted Scotch Tape at Top */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-7 bg-white/70 backdrop-blur-xs border border-white/50 shadow-xs rounded-xs pointer-events-none rotate-[-0.5deg]" />
                
                <button 
                  onClick={() => setSelectedTaskDetail(null)}
                  className="absolute top-4 right-4 text-slate-600 hover:text-slate-900 text-xl font-bold"
                >
                  ✕
                </button>
                
                <div className="mb-4 pr-8">
                  <h3 className="font-handwriting text-4xl font-bold text-slate-900 leading-tight">
                    {selectedTaskDetail.title}
                  </h3>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="font-handwriting text-lg font-medium text-slate-700 flex items-center gap-1.5">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                    <span>
                      {selectedTaskDetail.due_date 
                        ? new Date(String(selectedTaskDetail.due_date).split('T')[0] + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                        : 'No Date'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2.5">
                    <span className="font-handwriting text-sm font-bold px-2.5 py-0.5 rounded-md bg-black/10 text-slate-800 tracking-wide">
                      {selectedTaskDetail.category}
                    </span>
                    <span className="font-handwriting text-sm font-bold px-2.5 py-0.5 rounded-md bg-black/10 text-slate-800 tracking-wide">
                      {selectedTaskDetail.is_completed ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-handwriting text-base font-bold text-slate-700 uppercase tracking-wider mb-2">Description</h4>
                  <div className="bg-white/65 border border-black/5 rounded-xl p-4 font-handwriting text-xl text-slate-800 leading-relaxed shadow-inner min-h-[120px]">
                    {selectedTaskDetail.description || 'No description provided.'}
                  </div>
                </div>
                
              </div>
            );
          })()}
        </div>
      )}

    </div>
  );
}
