'use client';

import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  CheckCircle2,
  Calendar,
  Layers,
  ListFilter,
  Plus,
  Clock
} from 'lucide-react';
import type { StoredEvent, TaskItem } from '@/lib/storage';
import { toggleTaskCompletion } from '@/lib/storage';

export default function TimelineTasksView({
  event,
  onTaskToggled,
}: {
  event: StoredEvent;
  onTaskToggled?: (updated: StoredEvent) => void;
}) {
  const [viewMode, setViewMode] = useState<'list' | 'gantt' | 'calendar'>('list');
  const [tasks, setTasks] = useState<TaskItem[]>(event.tasks || []);

  function handleToggle(taskId: string) {
    const updated = toggleTaskCompletion(event.id, taskId);
    if (updated) {
      setTasks([...updated.tasks]);
      if (onTaskToggled) onTaskToggled(updated);
    }
  }

  // Group tasks by milestone
  const milestones = Array.from(new Set(tasks.map((t) => t.milestone)));

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Timeline &amp; Tasks</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {completedCount} of {tasks.length} tasks completed
          </p>
        </div>

        {/* View Switcher Pills (Screen 6 Blueprint) */}
        <div className="inline-flex rounded-full bg-white p-1 border border-slate-200 shadow-xs">
          <button
            onClick={() => setViewMode('gantt')}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              viewMode === 'gantt'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Gantt View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              viewMode === 'list'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              viewMode === 'calendar'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Calendar View
          </button>
        </div>
      </div>

      {/* ---------------- LIST VIEW ---------------- */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {milestones.map((milestone) => {
            const milestoneTasks = tasks.filter((t) => t.milestone === milestone);
            return (
              <div
                key={milestone}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4"
              >
                {/* Milestone Section Title with Dot */}
                <div className="flex items-center gap-2.5">
                  <span className="h-3 w-3 rounded-full bg-violet-600 ring-4 ring-violet-100" />
                  <h3 className="text-sm font-bold text-slate-900">{milestone}</h3>
                  <span className="text-xs text-slate-400 font-medium">
                    ({milestoneTasks.filter((t) => t.completed).length}/{milestoneTasks.length} done)
                  </span>
                </div>

                {/* Tasks under this milestone */}
                <div className="divide-y divide-slate-100">
                  {milestoneTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => handleToggle(task.id)}
                      className="py-3 flex items-center justify-between text-xs sm:text-sm cursor-pointer hover:bg-slate-50/70 px-2 rounded-xl transition"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className="text-violet-600 shrink-0"
                          aria-label={`Toggle ${task.title}`}
                        >
                          {task.completed ? (
                            <CheckSquare size={18} className="text-violet-600" />
                          ) : (
                            <Square size={18} className="text-slate-300 hover:text-violet-500" />
                          )}
                        </button>
                        <span
                          className={`font-medium transition-all ${
                            task.completed
                              ? 'line-through text-slate-400'
                              : 'text-slate-800'
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            task.priority === 'high'
                              ? 'bg-rose-50 text-rose-600'
                              : task.priority === 'medium'
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {task.priority}
                        </span>
                        <span className="text-xs font-semibold text-slate-400 w-16 text-right">
                          {task.dueDate}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ---------------- GANTT VIEW ---------------- */}
      {viewMode === 'gantt' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <p className="text-xs text-slate-400 font-medium">
            Interactive Gantt timeline progression across preparation months:
          </p>
          <div className="space-y-4 pt-2">
            {tasks.map((task, idx) => {
              const progressWidth = task.completed ? 100 : Math.max(25, 100 - task.daysBeforeEvent / 2);
              return (
                <div key={task.id} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className={task.completed ? 'line-through text-slate-400' : 'text-slate-800'}>
                      {task.title}
                    </span>
                    <span className="text-slate-400">{task.dueDate}</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        task.completed
                          ? 'bg-emerald-500'
                          : 'bg-gradient-to-r from-violet-600 to-indigo-500'
                      }`}
                      style={{ width: `${progressWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------- CALENDAR VIEW ---------------- */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs text-center space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-sm font-bold text-slate-800">Event Milestone Calendar</span>
            <span className="text-xs font-semibold text-violet-600">{event.event_date} Target</span>
          </div>
          <div className="grid grid-cols-7 gap-2 text-xs font-bold text-slate-400 pt-2">
            <span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
          </div>
          <div className="grid grid-cols-7 gap-2 pt-2">
            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={i}
                className={`h-16 rounded-xl border p-1 text-left flex flex-col justify-between ${
                  i === 14
                    ? 'border-violet-600 bg-violet-50 text-violet-900 font-bold'
                    : 'border-slate-100 bg-slate-50/50 text-slate-600'
                }`}
              >
                <span className="text-[10px] font-semibold">{i + 1}</span>
                {i === 14 && (
                  <span className="text-[9px] truncate bg-violet-600 text-white rounded px-1 py-0.5">
                    Venue Check
                  </span>
                )}
                {i === 20 && (
                  <span className="text-[9px] truncate bg-emerald-600 text-white rounded px-1 py-0.5">
                    Tasting
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

