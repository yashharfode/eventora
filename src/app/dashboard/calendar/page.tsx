'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { getEvents } from '@/lib/storage';

export default function CalendarPage() {
  const events = getEvents();
  const [currentMonth] = useState('December 2024');

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Calendar</h1>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              View upcoming event milestones, vendor tastings, and due dates.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-3 py-1.5 shadow-xs">
            <button className="p-1 hover:text-violet-600"><ChevronLeft size={16} /></button>
            <span className="text-xs font-bold text-slate-800 px-2">{currentMonth}</span>
            <button className="p-1 hover:text-violet-600"><ChevronRight size={16} /></button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 pb-3 border-b border-slate-100">
              <span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
            </div>
            <div className="grid grid-cols-7 gap-2 pt-3">
              {Array.from({ length: 31 }).map((_, i) => (
                <div
                  key={i}
                  className={`min-h-[70px] rounded-2xl border p-2 text-left flex flex-col justify-between ${
                    i === 14
                      ? 'border-violet-600 bg-violet-50 text-violet-900 font-bold'
                      : i === 9
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                      : 'border-slate-100 bg-slate-50/40 text-slate-600'
                  }`}
                >
                  <span className="text-xs font-bold">{i + 1}</span>
                  {i === 14 && (
                    <span className="text-[10px] bg-violet-600 text-white rounded-md px-1.5 py-0.5 truncate">
                      Wedding Day 💍
                    </span>
                  )}
                  {i === 9 && (
                    <span className="text-[10px] bg-emerald-600 text-white rounded-md px-1.5 py-0.5 truncate">
                      Tasting
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Scheduled Milestones</h3>
            <div className="space-y-3">
              {events.slice(0, 3).map((ev) => (
                <div key={ev.id} className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-violet-600 tracking-wider">
                    {ev.event_date}
                  </span>
                  <p className="text-sm font-bold text-slate-800">{ev.name}</p>
                  <p className="text-xs text-slate-500">{ev.location}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

