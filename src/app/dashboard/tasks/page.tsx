'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import TimelineTasksView from '@/components/events/TimelineTasksView';
import { getEvents, type StoredEvent } from '@/lib/storage';

export default function GlobalTasksPage() {
  const [events, setEvents] = useState<StoredEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  useEffect(() => {
    const list = getEvents();
    setEvents(list);
    if (list.length > 0) {
      setSelectedEventId(list[0].id);
    }
  }, []);

  const activeEvent = events.find((e) => e.id === selectedEventId) || events[0];

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Timeline &amp; Tasks</h1>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              Keep every preparation milestone and deadline organized leading up to celebration day.
            </p>
          </div>

          {events.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">Active Event:</span>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="bg-white border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 text-slate-800 outline-none"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {activeEvent && (
          <TimelineTasksView
            event={activeEvent}
            onTaskToggled={() => setEvents(getEvents())}
          />
        )}
      </div>
    </AppShell>
  );
}

