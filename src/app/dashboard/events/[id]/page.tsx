'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Share2,
  Calendar,
  MapPin,
  Users2,
  CheckCircle2,
  Wallet,
  Store,
  Clock,
  Square,
  CheckSquare,
  Sparkles,
  ArrowRight,
  FileText,
  UserCheck
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import BudgetPlanningView from '@/components/events/BudgetPlanningView';
import TimelineTasksView from '@/components/events/TimelineTasksView';
import VendorsDirectoryView from '@/components/events/VendorsDirectoryView';
import { getEventById, saveEvent, toggleTaskCompletion, type StoredEvent } from '@/lib/storage';

export default function EventDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [event, setEvent] = useState<StoredEvent | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'budget' | 'vendors' | 'guests' | 'documents'>('overview');
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    const found = getEventById(resolvedParams.id);
    if (!found) {
      router.push('/dashboard');
      return;
    }
    setEvent(found);
  }, [resolvedParams.id, router]);

  if (!event) {
    return (
      <AppShell>
        <div className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent" />
            <p className="text-sm font-medium text-slate-500">Loading event workspace…</p>
          </div>
        </div>
      </AppShell>
    );
  }

  // Calculate Screen 8 Metrics with safe defaults
  const tasks = event.tasks || [];
  const vendors = event.vendors || [];
  const budgetItems = event.budget_items || [];
  const activities = event.activities || [];

  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const bookedVendors = vendors.filter((v) => v.booked).length;
  const totalVendors = vendors.length;

  const totalBudgetMinor = event.budget_minor || 0;
  const totalSpentMinor = budgetItems.reduce((acc, item) => acc + (item.spentMinor || 0), 0);
  const remainingBudgetMinor = Math.max(0, totalBudgetMinor - totalSpentMinor);

  const spentFormatted = `₹${(totalSpentMinor / 10000000).toFixed(1)}L`;
  const totalFormatted = `₹${(totalBudgetMinor / 10000000).toFixed(1)}L`;

  function handleShare() {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  }

  function handleToggleTask(taskId: string) {
    if (!event) return;
    const updated = toggleTaskCompletion(event.id, taskId);
    if (updated) {
      setEvent({ ...updated });
    }
  }

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        {/* Top Header Actions (Screen 8 Blueprint) */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/dashboard/events"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft size={16} /> Back to Events
          </Link>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700 capitalize">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {event.status}
            </span>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition"
            >
              <Share2 size={14} />
              {copiedShare ? 'Copied link!' : 'Share'}
            </button>
          </div>
        </div>

        {/* Event Title Banner */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {event.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-violet-600" />
              {event.event_date}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <MapPin size={14} className="text-violet-600" />
              {event.location}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Users2 size={14} className="text-violet-600" />
              {event.guest_count} Guests
            </span>
          </div>
        </div>

        {/* Navigation Tabs (Screen 8 Blueprint) */}
        <div className="border-b border-slate-200 flex items-center gap-2 sm:gap-6 overflow-x-auto">
          {(['overview', 'tasks', 'budget', 'vendors', 'guests', 'documents'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-xs sm:text-sm font-bold capitalize transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab
                  ? 'border-violet-600 text-violet-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ---------------- 1. OVERVIEW TAB (SCREEN 8 MAIN VIEW) ---------------- */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* 4 Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">
                  {completedTasks}/{totalTasks}
                </span>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Tasks Completed
                </p>
                <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-600 rounded-full"
                    style={{ width: `${(completedTasks / Math.max(1, totalTasks)) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">
                  {spentFormatted} <span className="text-xs text-slate-400 font-bold">/ {totalFormatted}</span>
                </span>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Budget Spent
                </p>
                <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${(totalSpentMinor / Math.max(1, totalBudgetMinor)) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">
                  {bookedVendors}/{totalVendors}
                </span>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Vendors Booked
                </p>
                <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(bookedVendors / Math.max(1, totalVendors)) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">
                  83
                </span>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Days Remaining
                </p>
                <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full w-3/4" />
                </div>
              </div>
            </div>

            {/* Split Content: Next Tasks & Budget Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column (8 cols): Next Upcoming Tasks & Recent Activity */}
              <div className="lg:col-span-8 space-y-6">
                {/* Next Upcoming Tasks */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">Next Upcoming Tasks</h3>
                    <button
                      onClick={() => setActiveTab('tasks')}
                      className="text-xs font-bold text-violet-600 hover:text-violet-800"
                    >
                      View All
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {event.tasks.slice(0, 4).map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleToggleTask(task.id)}
                        className="py-3 flex items-center justify-between text-xs sm:text-sm cursor-pointer hover:bg-slate-50/70 px-2 rounded-xl transition"
                      >
                        <div className="flex items-center gap-3">
                          <button type="button" className="text-violet-600 shrink-0">
                            {task.completed ? (
                              <CheckSquare size={18} className="text-violet-600" />
                            ) : (
                              <Square size={18} className="text-slate-300 hover:text-violet-500" />
                            )}
                          </button>
                          <span className={task.completed ? 'line-through text-slate-400 font-medium' : 'text-slate-800 font-medium'}>
                            {task.title}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-slate-400">{task.dueDate}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                  <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>
                  <div className="space-y-3">
                    {event.activities.map((act) => (
                      <div key={act.id} className="flex items-center justify-between text-xs sm:text-sm py-1.5">
                        <div className="flex items-center gap-3">
                          <span className="h-2 w-2 rounded-full bg-violet-600" />
                          <span className="text-slate-700 font-medium">{act.text}</span>
                        </div>
                        <span className="text-xs text-slate-400 font-medium shrink-0">{act.timeAgo}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column (4 cols): Budget Overview Donut Widget */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4 text-center">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">Budget Overview</h3>
                    <button
                      onClick={() => setActiveTab('budget')}
                      className="text-xs font-bold text-violet-600 hover:text-violet-800"
                    >
                      Details
                    </button>
                  </div>

                  {/* Mini Donut representation */}
                  <div className="relative inline-flex items-center justify-center my-2">
                    <div className="h-44 w-44 rounded-full border-8 border-violet-100 border-t-violet-600 border-r-indigo-500 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-slate-900">
                        ₹{(totalBudgetMinor / 10000000).toFixed(0)}L
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Total
                      </span>
                    </div>
                  </div>

                  {/* Spent vs Remaining Legend */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl">
                      <div className="flex items-center justify-center gap-1.5 text-slate-500 font-medium">
                        <span className="h-2 w-2 rounded-full bg-violet-600" />
                        <span>Spent</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 mt-1">
                        ₹{(totalSpentMinor / 10000000).toFixed(1)}L
                      </p>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl">
                      <div className="flex items-center justify-center gap-1.5 text-slate-500 font-medium">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span>Remaining</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 mt-1">
                        ₹{(remainingBudgetMinor / 10000000).toFixed(1)}L
                      </p>
                    </div>
                  </div>
                </div>

                {/* AI Assistant Quick Advice */}
                <div className="rounded-3xl bg-slate-950 p-6 text-white space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-violet-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-violet-300">
                      Co-Planner Tip
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {event.ai_insights[0] || 'Keep track of vendor payment schedules to ensure smooth coordination.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- 2. TASKS TAB (SCREEN 6) ---------------- */}
        {activeTab === 'tasks' && (
          <TimelineTasksView
            event={event}
            onTaskToggled={(updated) => setEvent({ ...updated })}
          />
        )}

        {/* ---------------- 3. BUDGET TAB (SCREEN 5) ---------------- */}
        {activeTab === 'budget' && (
          <BudgetPlanningView
            event={event}
            onUpdateEvent={(updated) => {
              saveEvent(updated);
              setEvent({ ...updated });
            }}
          />
        )}

        {/* ---------------- 4. VENDORS TAB (SCREEN 7) ---------------- */}
        {activeTab === 'vendors' && (
          <VendorsDirectoryView
            event={event}
            onVendorUpdated={(updated) => {
              saveEvent(updated);
              setEvent({ ...updated });
            }}
          />
        )}

        {/* ---------------- 5. GUESTS TAB ---------------- */}
        {activeTab === 'guests' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center space-y-4">
            <UserCheck className="mx-auto text-violet-600" size={40} />
            <h3 className="text-lg font-bold text-slate-900">Guest List &amp; RSVPs</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Total planned capacity: {event.guest_count} attendees. Digital invitation link and seating charts ready.
            </p>
            <div className="pt-2">
              <span className="inline-flex rounded-full bg-violet-50 text-violet-700 px-4 py-2 text-xs font-bold">
                RSVP Management Enabled
              </span>
            </div>
          </div>
        )}

        {/* ---------------- 6. DOCUMENTS TAB ---------------- */}
        {activeTab === 'documents' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center space-y-4">
            <FileText className="mx-auto text-violet-600" size={40} />
            <h3 className="text-lg font-bold text-slate-900">Event Contracts &amp; Notes</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              All quotes, vendor receipts, floor plans, and schedules for {event.name} are stored here securely.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}

