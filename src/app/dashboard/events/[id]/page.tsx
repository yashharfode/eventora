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
  Square,
  CheckSquare,
  Sparkles,
  FileText,
  Download,
  Copy,
  Check,
  UserPlus,
  ShieldCheck
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import BudgetPlanningView from '@/components/events/BudgetPlanningView';
import TimelineTasksView from '@/components/events/TimelineTasksView';
import VendorsDirectoryView from '@/components/events/VendorsDirectoryView';
import { getEventById, saveEvent, toggleTaskCompletion, type StoredEvent } from '@/lib/storage';
import { generateEventMarkdownReport, generateBudgetCSV } from '@/features/planning/export';
import { type MemberRole, validateCollaboratorInvite } from '@/features/planning/collaboration';

type Collaborator = {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
};

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
  const [copiedReport, setCopiedReport] = useState(false);

  // Collaborator management state
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    { id: 'c-1', name: 'Yash Harfode', email: 'yash@eventora.app', role: 'owner' },
    { id: 'c-2', name: 'Event Coordinator', email: 'coordinator@eventora.app', role: 'admin' },
    { id: 'c-3', name: 'Family Lead', email: 'family@eventora.app', role: 'editor' },
  ]);
  const [newCollabEmail, setNewCollabEmail] = useState('');
  const [newCollabRole, setNewCollabRole] = useState<MemberRole>('editor');
  const [collabError, setCollabError] = useState('');

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

  function handleDownloadMarkdown() {
    if (!event) return;
    const report = generateEventMarkdownReport(event);
    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-blueprint.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleDownloadCSV() {
    if (!event) return;
    const csv = generateBudgetCSV(event);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-budget.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleCopyReport() {
    if (!event) return;
    const report = generateEventMarkdownReport(event);
    navigator.clipboard.writeText(report);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  }

  function handleAddCollaborator(e: React.FormEvent) {
    e.preventDefault();
    setCollabError('');
    if (!newCollabEmail || !newCollabEmail.includes('@')) {
      setCollabError('Please provide a valid email address.');
      return;
    }

    const validation = validateCollaboratorInvite('owner', newCollabRole);
    if (!validation.allowed) {
      setCollabError(validation.reason || 'Permission denied.');
      return;
    }

    const newMember: Collaborator = {
      id: `collab-${Date.now()}`,
      name: newCollabEmail.split('@')[0],
      email: newCollabEmail,
      role: newCollabRole,
    };

    setCollaborators((prev) => [...prev, newMember]);
    setNewCollabEmail('');
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
              {tab === 'guests' ? 'Collaborators & Guests' : tab === 'documents' ? 'Reports & Exports' : tab}
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
              {/* Left Column: Next Upcoming Tasks & Recent Activity */}
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
                    {tasks.slice(0, 4).map((task) => (
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
                    {(event.activities || []).map((act) => (
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

              {/* Right Column: Budget Overview Donut Widget */}
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

                {/* AI Co-Planner Tip */}
                <div className="rounded-3xl bg-slate-950 p-6 text-white space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-violet-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-violet-300">
                      Co-Planner Tip
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {(event.ai_insights || [])[0] || 'Keep track of vendor payment schedules to ensure smooth coordination.'}
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

        {/* ---------------- 5. COLLABORATORS & GUESTS TAB ---------------- */}
        {activeTab === 'guests' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header & RSVP Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <span className="text-2xl font-black text-slate-900">{event.guest_count}</span>
                <p className="text-xs text-slate-500 font-semibold uppercase mt-1">Expected Guests</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <span className="text-2xl font-black text-emerald-600">
                  {Math.round(event.guest_count * 0.85)}
                </span>
                <p className="text-xs text-slate-500 font-semibold uppercase mt-1">Confirmed RSVPs (85%)</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <span className="text-2xl font-black text-violet-600">{collaborators.length}</span>
                <p className="text-xs text-slate-500 font-semibold uppercase mt-1">Active Team Collaborators</p>
              </div>
            </div>

            {/* Team Collaborators with RBAC */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck size={20} className="text-violet-600" />
                    Team Access &amp; Collaborator Roles
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Role-Based Access Control: Owner, Admin, Editor, and Viewer permissions.
                  </p>
                </div>
              </div>

              {/* Invite Form */}
              <form onSubmit={handleAddCollaborator} className="flex flex-wrap items-center gap-3 pt-2">
                <input
                  type="email"
                  value={newCollabEmail}
                  onChange={(e) => setNewCollabEmail(e.target.value)}
                  placeholder="collaborator@example.com"
                  className="flex-1 min-w-[240px] bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 outline-none focus:border-violet-500"
                />
                <select
                  value={newCollabRole}
                  onChange={(e) => setNewCollabRole(e.target.value as MemberRole)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 outline-none"
                >
                  <option value="editor">Editor (Can edit budget &amp; tasks)</option>
                  <option value="admin">Admin (Full management)</option>
                  <option value="viewer">Viewer (Read-only)</option>
                </select>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition"
                >
                  <UserPlus size={14} /> Invite Collaborator
                </button>
              </form>

              {collabError && (
                <p className="text-xs text-rose-600 font-medium">{collabError}</p>
              )}

              {/* Members List */}
              <div className="divide-y divide-slate-100 border-t border-slate-100 pt-3">
                {collaborators.map((c) => (
                  <div key={c.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-500">{c.email}</p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        c.role === 'owner'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : c.role === 'admin'
                          ? 'bg-violet-100 text-violet-800 border border-violet-200'
                          : c.role === 'editor'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {c.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ---------------- 6. REPORTS & EXPORTS TAB ---------------- */}
        {activeTab === 'documents' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FileText size={20} className="text-violet-600" />
                    Event Master Reports &amp; Exports
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Generate client-ready blueprints, vendor contracts, and budget audit files.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleCopyReport}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition"
                  >
                    {copiedReport ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    {copiedReport ? 'Copied to Clipboard!' : 'Copy Markdown'}
                  </button>

                  <button
                    onClick={handleDownloadCSV}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition"
                  >
                    <Download size={14} /> Export Budget CSV
                  </button>

                  <button
                    onClick={handleDownloadMarkdown}
                    className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 hover:bg-violet-700 px-5 py-2 text-xs font-bold text-white shadow-xs transition"
                  >
                    <Download size={14} /> Download Blueprint (.md)
                  </button>
                </div>
              </div>

              {/* Preview Window of Generated Markdown */}
              <div className="bg-slate-900 text-slate-200 rounded-2xl p-5 font-mono text-xs overflow-x-auto max-h-[420px] overflow-y-auto leading-relaxed border border-slate-800">
                <pre>{generateEventMarkdownReport(event)}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
