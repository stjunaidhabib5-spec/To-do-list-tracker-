'use client';

import { useState } from 'react';
import type { Task } from '@/lib/types';

interface TaskCalendarProps {
  tasks: Task[];
}

export default function TaskCalendar({ tasks }: TaskCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
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
    
    // Find tasks for this day
    const dayTasks = tasks.filter(t => {
      if (!t.due_date) return false;
      const taskDateStr = String(t.due_date).split('T')[0];
      return taskDateStr === cellDateStr;
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
        className={`rounded-xl p-3 min-h-[95px] md:min-h-[120px] flex flex-col justify-start relative transition-all duration-300 ease-out cursor-pointer shadow-md backdrop-blur-md border hover:rotate-0 hover:-translate-y-2 hover:scale-[1.04] hover:shadow-2xl hover:z-30 ${rotation} ${color}`}
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
              title={task.title}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTaskDetail(task);
              }}
              className={`font-handwriting text-[15px] leading-tight text-slate-900 font-semibold tracking-wide truncate select-none pl-1 hover:text-indigo-900 transition-colors ${task.is_completed ? 'line-through opacity-60' : ''}`}
              style={{ transform: 'rotate(-1.5deg)' }}
            >
              • {task.title}
            </div>
          ))}
          {dayTasks.length > 3 && (
            <div className="font-handwriting text-[14px] font-semibold text-slate-700/80 mt-0.5 text-center" style={{ transform: 'rotate(-1.5deg)' }}>
              +{dayTasks.length - 3} more
            </div>
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
        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {days}
        </div>
      </div>

      {/* Modals */}
      
      {/* Day Tasks Modal */}
      {selectedDayTasks && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-fade-in-up"
          style={{ animationDuration: '0.2s' }}
          onClick={() => setSelectedDayTasks(null)}
        >
          <div 
            className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedDayTasks(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            <div className="mb-6">
              <h3 className="font-display tracking-wider uppercase text-2xl font-bold text-slate-900 dark:text-white">
                {new Date(selectedDayTasks.year, selectedDayTasks.month, selectedDayTasks.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                {selectedDayTasks.tasks.length} {selectedDayTasks.tasks.length === 1 ? 'Task' : 'Tasks'}
              </p>
            </div>
            
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 no-scrollbar">
              {selectedDayTasks.tasks.map(task => (
                <div 
                  key={task.id}
                  onClick={() => setSelectedTaskDetail(task)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/20 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors shadow-sm"
                >
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${task.is_completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                    {task.is_completed && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${task.is_completed ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-slate-200'}`}>
                      {task.title}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full whitespace-nowrap ${task.category === 'Academic' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'}`}>
                    {task.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTaskDetail && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-fade-in-up"
          style={{ animationDuration: '0.2s' }}
          onClick={() => setSelectedTaskDetail(null)}
        >
          <div 
            className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedTaskDetail(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            
            <div className="mb-4 pr-8">
              <span className={`inline-block mb-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${selectedTaskDetail.category === 'Academic' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'}`}>
                {selectedTaskDetail.category}
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                {selectedTaskDetail.title}
              </h3>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                <span className="font-medium">
                  {selectedTaskDetail.due_date 
                    ? new Date(String(selectedTaskDetail.due_date).split('T')[0] + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                    : 'No Date'}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${selectedTaskDetail.is_completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-500'}`}>
                    {selectedTaskDetail.is_completed && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>}
                </div>
                <span className="font-medium">{selectedTaskDetail.is_completed ? 'Completed' : 'Pending'}</span>
              </div>
            </div>

            <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50 shadow-sm">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Description</h4>
              <p className={`text-sm whitespace-pre-wrap leading-relaxed ${selectedTaskDetail.description ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500 italic'}`}>
                {selectedTaskDetail.description || 'No description provided.'}
              </p>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}
