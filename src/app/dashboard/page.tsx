'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Plus,
  Calendar,
  Users,
  Clock,
  Store,
  ArrowRight,
  TrendingUp,
  MapPin,
  Trash2,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import {
  getEvents,
  getUser,
  deleteEvent,
  INITIAL_USER,
  INITIAL_EVENTS,
  type StoredEvent,
  type User,
} from '@/lib/storage';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(INITIAL_USER);
  const [events, setEvents] = useState<StoredEvent[]>(INITIAL_EVENTS);

  useEffect(() => {
    try {
      const currentUser = getUser() || INITIAL_USER;
      setUser(currentUser);
      const loaded = getEvents();
      if (loaded && loaded.length > 0) {
        setEvents(loaded);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  }, []);

  function handleDelete(e: React.MouseEvent, id: string, name: string) {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteEvent(id);
      setEvents(getEvents());
    }
  }

  // Calculate high-level stats with safe optional chaining
  const totalUpcomingEvents = events.length;
  const totalTasksDueSoon = events.reduce((acc, ev) => {
    const tasks = ev.tasks || [];
    return acc + tasks.filter((t) => !t.completed).length;
  }, 0);
  const totalBudgetValue = events.reduce((acc, ev) => acc + (ev.budget_minor || 0), 0);
  const totalVendorsBooked = events.reduce((acc, ev) => {
    const vendors = ev.vendors || [];
    return acc + vendors.filter((v) => v.booked).length;
  }, 0);

  const formattedBudget =
    totalBudgetValue >= 10000000
      ? `₹${(totalBudgetValue / 10000000).toFixed(1)}Cr`
      : `₹${(totalBudgetValue / 100000).toFixed(1)}L`;

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Top Greeting */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight" suppressHydrationWarning>
              Good morning, {user?.name || 'Yash'}! 👋
            </h1>
            <p className="mt-1 text-sm text-slate-500 font-medium">
              Let&apos;s make your next event unforgettable.
            </p>
          </div>

          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-sm px-5 py-3 rounded-2xl shadow-lg shadow-violet-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={18} />
            Create New Event
          </Link>
        </div>

        {/* Hero AI Planner Promo Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 p-8 text-white shadow-xl">
          <div className="relative z-10 max-w-xl space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Sparkles size={13} className="text-amber-300" />
              Powered by GenAI
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Plan Smarter. Celebrate Better.
            </h2>
            <p className="text-sm text-violet-100 font-medium">
              Create complete multi-milestone budgets, dynamic timelines, and vendor shortlists in under 60 seconds with our AI Co-Planner.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard/new"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-xs font-black uppercase tracking-wider text-violet-700 hover:bg-violet-50 transition shadow-md"
              >
                Launch AI Co-Planner
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
              <Calendar size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Upcoming Events</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{totalUpcomingEvents}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tasks Due</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{totalTasksDueSoon}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Budget</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{formattedBudget}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Store size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vendors Booked</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{totalVendorsBooked}</p>
            </div>
          </div>
        </div>

        {/* Your Events Header & Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Your Events</h3>
              <p className="text-xs text-slate-500 font-medium">Manage and review your active celebrations.</p>
            </div>
            <Link
              href="/dashboard/events"
              className="text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1"
            >
              View All
              <ArrowRight size={13} />
            </Link>
          </div>

          {events.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
              <div className="h-14 w-14 bg-violet-50 text-violet-600 rounded-full flex items-center justify-center mx-auto">
                <Calendar size={28} />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">No events found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Start by creating your first wedding, birthday or celebration with AI planning.
                </p>
              </div>
              <Link
                href="/dashboard/new"
                className="inline-flex items-center gap-2 bg-violet-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs hover:bg-violet-700 transition"
              >
                <Plus size={15} />
                Create Event
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => {
                const totalMinor = event.budget_minor || 0;
                const formattedEvBudget =
                  totalMinor >= 10000000
                    ? `₹${(totalMinor / 10000000).toFixed(1)}Cr`
                    : `₹${(totalMinor / 100000).toFixed(1)}L`;

                return (
                  <Link
                    key={event.id}
                    href={`/dashboard/events/${event.id}`}
                    className="group bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-violet-300 transition-all duration-300 flex flex-col"
                  >
                    {/* Cover image */}
                    <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                      <img
                        src={event.cover_image}
                        alt={event.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="bg-slate-900/80 backdrop-blur-md text-white font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full">
                          {event.event_type}
                        </span>
                        <span
                          className={`font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-md ${
                            event.status === 'planning'
                              ? 'bg-emerald-500/90 text-white'
                              : 'bg-amber-500/90 text-white'
                          }`}
                        >
                          {event.status}
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleDelete(e, event.id, event.name)}
                        title="Delete event"
                        className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/60 hover:bg-rose-600 text-white backdrop-blur-md transition opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h4 className="text-base font-bold text-slate-900 group-hover:text-violet-600 transition">
                          {event.name}
                        </h4>
                        <div className="mt-2 space-y-1.5 text-xs text-slate-500 font-medium">
                          <div className="flex items-center gap-2">
                            <Calendar size={13} className="text-slate-400" />
                            <span>{event.event_date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={13} className="text-slate-400" />
                            <span className="truncate">{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users size={13} className="text-slate-400" />
                            <span>{event.guest_count} guests expected</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Budget
                          </span>
                          <span className="font-extrabold text-slate-900 text-sm">
                            {formattedEvBudget}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Tasks
                          </span>
                          <span className="font-bold text-violet-600">
                            {(event.tasks || []).filter((t) => t.completed).length} / {(event.tasks || []).length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
