'use client';

import { useState } from 'react';
import { RotateCcw, Database } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { getUser, setUser, INITIAL_EVENTS } from '@/lib/storage';

export default function SettingsPage() {
  const user = getUser();
  const [name, setName] = useState(user?.name || 'Yash');
  const [email, setEmail] = useState(user?.email || 'yash@eventora.app');
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (user) {
      setUser({
        ...user,
        name,
        email,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  function handleResetDemo() {
    if (confirm('Reset local events data to default demo state?')) {
      localStorage.setItem('eventora_events', JSON.stringify(INITIAL_EVENTS));
      window.location.reload();
    }
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Settings</h1>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Manage your account preferences and local workspace configurations.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-slate-900">Profile Information</h2>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:bg-white focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:bg-white focus:border-violet-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="submit"
                className="rounded-full bg-violet-600 hover:bg-violet-700 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition"
              >
                {saved ? 'Saved Successfully! ✓' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <Database size={18} className="text-violet-600" />
            <h3>Storage &amp; Diagnostics</h3>
          </div>
          <p className="text-xs text-slate-500">
            Eventora is currently operating in local storage mode. All events, tasks, budget allocations, and notes are saved directly in your browser.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleResetDemo}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              <RotateCcw size={14} /> Reset to Demo Events
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

