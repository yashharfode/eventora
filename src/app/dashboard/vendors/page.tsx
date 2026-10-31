'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import VendorsDirectoryView from '@/components/events/VendorsDirectoryView';
import { getEvents, saveEvent, type StoredEvent } from '@/lib/storage';

export default function GlobalVendorsPage() {
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
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Vendors Directory</h1>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              Explore, compare, and book verified venues, caterers, photographers &amp; decorators.
            </p>
          </div>

          {events.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">Event:</span>
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
          <VendorsDirectoryView
            event={activeEvent}
            onVendorUpdated={(updated) => {
              saveEvent(updated);
              setEvents(getEvents());
            }}
          />
        )}
      </div>
    </AppShell>
  );
}

