'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Plus,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Store,
  ArrowRight,
  TrendingUp,
  MapPin,
  Trash2
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { getEvents, getUser, deleteEvent, type StoredEvent, type User } from '@/lib/storage';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<StoredEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    setEvents(getEvents());
    setLoading(false);
  }, [router]);

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

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent" />
            <p className="text-sm font-medium text-slate-500">Loading your Eventora workspace…</p>
          </div>
        </div>
      </AppShell>
    );
  }

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
        </div>

        {/* Hero Banner (Screen 1 Blueprint) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-700 via-indigo-600 to-purple-600 p-8 sm:p-10 text-white shadow-xl shadow-violet-500/10">
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-violet-100 mb-4">
              <Sparkles size={14} className="text-yellow-300" /> Powered by Eventora AI
            </div>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight">
              Plan Smarter. Celebrate Better.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-violet-100 leading-relaxed font-normal">
              Create beautiful events with the power of AI. From concept to budgeting, checklists, and vendor matching in seconds.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link
                href="/dashboard/new"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-violet-900 shadow-md hover:bg-violet-50 transition transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Plus size={18} className="text-violet-700" /> Create New Event
              </Link>
            </div>
          </div>

          {/* Decorative Glowing Shapes */}
          <div className="absolute right-0 top-0 -bottom-10 w-96 opacity-25 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-300 via-pink-400 to-transparent blur-2xl" />
          <div className="hidden md:block absolute right-12 bottom-6 text-white/20">
            <Sparkles size={160} strokeWidth={1} />
          </div>
        </div>

        {/* 4 Metrics Cards (Screen 1 Blueprint) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-slate-900">{totalUpcomingEvents}</span>
              <div className="h-10 w-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <Calendar size={20} />
              </div>
            </div>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Upcoming Events
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-slate-900">{totalTasksDueSoon}</span>
              <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock size={20} />
              </div>
            </div>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tasks Due Soon
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-emerald-600">{formattedBudget}</span>
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp size={20} />
              </div>
            </div>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Budget
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-blue-600">{totalVendorsBooked}</span>
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Store size={20} />
              </div>
            </div>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Vendors Booked
            </p>
          </div>
        </div>

        {/* "Your Events" Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Your Events</h2>
              <p className="text-xs text-slate-500 mt-0.5">Manage and track your active celebrations</p>
            </div>
            <Link
              href="/dashboard/events"
              className="text-xs font-bold text-violet-600 hover:text-violet-800 transition"
            >
              View All
            </Link>
          </div>

          {events.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Sparkles className="mx-auto text-violet-500" size={36} />
              <h3 className="mt-4 text-lg font-bold text-slate-900">No events found</h3>
              <p className="mt-1 text-sm text-slate-500">Start by creating your first celebration with AI assistance.</p>
              <Link
                href="/dashboard/new"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-violet-700"
              >
                <Plus size={16} /> Create Event
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  onClick={() => router.push(`/dashboard/events/${event.id}`)}
                  className="group relative cursor-pointer flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Event Thumbnail */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    <img
                      src={event.cover_image || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'}
                      alt={event.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold capitalize backdrop-blur-md shadow-xs ${
                          event.status === 'planning'
                            ? 'bg-emerald-500/90 text-white'
                            : 'bg-purple-600/90 text-white'
                        }`}
                      >
                        {event.status || 'planning'}
                      </span>
                    </div>

                    {/* Delete action */}
                    <button
                      onClick={(e) => handleDelete(e, event.id, event.name)}
                      title="Delete event"
                      className="absolute top-3 right-3 h-8 w-8 rounded-full bg-slate-900/60 backdrop-blur-sm text-white/80 hover:text-red-400 hover:bg-slate-900/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>

                    {/* Bottom overlay text */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <p className="text-xs font-semibold text-violet-200">{(event.event_type || 'event').toUpperCase()}</p>
                      <h3 className="text-lg font-black leading-snug truncate drop-shadow-sm">{event.name}</h3>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2 text-xs font-medium text-slate-500">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        <span>{event.event_date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-slate-400" />
                        <span>{event.guest_count} guests</span>
                        <span className="text-slate-300">•</span>
                        <MapPin size={14} className="text-slate-400" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>

                    {/* Footer Budget & View */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Budget</span>
                        <p className="text-sm font-black text-slate-800">
                          {new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: event.currency || 'INR',
                            maximumFractionDigits: 0,
                          }).format((event.budget_minor || 0) / 100)}
                        </p>
                      </div>

                      <span className="inline-flex items-center gap-1 text-xs font-bold text-violet-600 group-hover:translate-x-0.5 transition-transform">
                        Open Workspace <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
