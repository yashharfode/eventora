'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  Store,
  Calendar as CalendarIcon,
  CheckSquare,
  PieChart,
  Sparkles,
  Settings,
  Search,
  Bell,
  Menu,
  X,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { getUser, removeUser, type User } from '@/lib/storage';
import VoiceCoPlannerModal from '@/components/voice/VoiceCoPlannerModal';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Events', href: '/dashboard/events', icon: CalendarDays },
  { name: 'Vendors', href: '/dashboard/vendors', icon: Store },
  { name: 'Calendar', href: '/dashboard/calendar', icon: CalendarIcon },
  { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
  { name: 'Budget', href: '/dashboard/budget', icon: PieChart },
  { name: 'AI Assistant', href: '/dashboard/assistant', icon: Sparkles },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setUser(getUser());
    setMounted(true);
  }, []);

  function handleLogout() {
    removeUser();
    router.push('/login');
  }

  const displayName = mounted && user?.name ? user.name : 'Yash';
  const displayEmail = mounted && user?.email ? user.email : 'yash@eventora.app';
  const displayAvatar =
    mounted && user?.avatar
      ? user.avatar
      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#111827] text-slate-300 border-r border-slate-800 shrink-0 sticky top-0 h-screen select-none">
        {/* Professional Brand Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/80">
          <Logo href="/dashboard" size="md" variant="dark" subtitleText="AI EVENT CO-PILOT" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span>{item.name}</span>
                {isActive && <ChevronRight size={14} className="ml-auto opacity-70" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <img
              src={displayAvatar}
              alt={displayName}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-violet-500/30"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate" suppressHydrationWarning>
                {displayName}
              </p>
              <p className="text-xs text-slate-400 truncate" suppressHydrationWarning>
                {displayEmail}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800/80 transition"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-64 bg-[#111827] text-slate-300 flex flex-col h-full z-10 p-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <Logo href="/dashboard" size="sm" variant="dark" subtitleText="AI EVENT CO-PILOT" />
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 py-4 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                      isActive ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 p-3 text-sm text-red-400 hover:bg-slate-800 rounded-xl"
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-lg">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={20} />
            </button>
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search events, vendors, tasks..."
                className="w-full bg-slate-50 border border-slate-200 rounded-full pl-10 pr-4 py-2 text-sm text-slate-700 placeholder-slate-400 outline-none focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-50 transition"
              />
            </div>
          </div>

          {/* Right Header: Greeting & Profile */}
          <div className="flex items-center gap-3 sm:gap-5">
            <button
              title="Notifications"
              className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-violet-600 ring-2 ring-white" />
            </button>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            <Link href="/dashboard" className="flex items-center gap-3 pl-1">
              <div className="hidden sm:block text-right">
                <p className="text-xs text-slate-400 font-medium leading-none">Welcome back</p>
                <p className="text-sm font-bold text-slate-900 leading-tight mt-0.5" suppressHydrationWarning>
                  {displayName}
                </p>
              </div>
              <img
                src={displayAvatar}
                alt={displayName}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-violet-600/20 shadow-sm"
              />
            </Link>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1">
          {children}
        </div>

        {/* Intelligent Voice AI Co-Planner Modal */}
        <VoiceCoPlannerModal currentEventId={pathname?.match(/\/dashboard\/events\/([^/]+)/)?.[1]} />
      </div>
    </div>
  );
}
