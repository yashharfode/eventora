'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, Users, MapPin, ArrowRight, Plus, Sparkles } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { getEvents, type StoredEvent } from '@/lib/storage';

export default function MyEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<StoredEvent[]>([]);

  useEffect(() => {
    setEvents(getEvents());
  }, []);

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">My Events</h1>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              View and manage all active, ideation, and planned events.
            </p>
          </div>

          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-violet-700 transition"
          >
            <Plus size={16} /> Create Event
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div
              key={event.id}
              onClick={() => router.push(`/dashboard/events/${event.id}`)}
              className="group cursor-pointer rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="h-44 w-full overflow-hidden bg-slate-100 relative">
                <img
                  src={event.cover_image}
                  alt={event.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="rounded-full bg-violet-600/90 text-white px-3 py-1 text-xs font-bold capitalize backdrop-blur-md">
                    {event.status}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-violet-600 tracking-wider">
                    {event.event_type}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">{event.name}</h3>
                </div>

                <div className="space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" />
                    <span>{event.event_date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-slate-400" />
                    <span>{event.guest_count} guests</span>
                    <span className="text-slate-300">•</span>
                    <MapPin size={14} className="text-slate-400" />
                    <span>{event.location}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-black text-slate-900">
                    {new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: event.currency,
                      maximumFractionDigits: 0,
                    }).format(event.budget_minor / 100)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-violet-600">
                    Open <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

