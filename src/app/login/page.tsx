'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import { getUser, setUser } from '@/lib/storage';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // If already logged in, redirect to dashboard
    const user = getUser();
    if (user) {
      router.push('/dashboard');
    }
  }, [router]);

  async function handleLogin(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setBusy(true);
    setMessage('');

    try {
      if (!email) {
        throw new Error('Please enter your email.');
      }
      // Save user session in localStorage
      setUser({
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        email,
        name: email.split('@')[0],
      });
      router.push('/dashboard');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Login failed.');
      setBusy(false);
    }
  }

  function handleDemoLogin() {
    setUser({
      id: 'usr_demo',
      email: 'planner@eventora.local',
      name: 'Event Planner',
    });
    router.push('/dashboard');
  }

  const cls =
    'mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100';

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
      <section className="w-full max-w-md rounded-3xl border bg-white p-8 shadow-xl">
        <Logo href="/" size="md" variant="light" subtitleText="SMART EVENT PLATFORM" />
        <h1 className="mt-8 text-3xl font-black text-slate-900">Welcome back.</h1>
        <p className="mt-2 text-slate-500">Sign in to manage your events with local storage.</p>

        <form onSubmit={handleLogin} className="mt-7">
          <label className="block text-sm font-semibold">
            Email
            <input
              type="email"
              autoComplete="email"
              className={cls}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="mt-4 block text-sm font-semibold">
            Password
            <input
              type="password"
              autoComplete="current-password"
              className={cls}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {message && (
            <p role="status" className="mt-4 text-sm text-violet-700">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || !email}
            className="mt-6 w-full rounded-full bg-violet-600 px-5 py-3 font-bold text-white transition hover:bg-violet-700 disabled:opacity-50"
          >
            {busy ? 'Please wait…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs text-slate-400">or</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          type="button"
          onClick={handleDemoLogin}
          className="mt-4 w-full rounded-full border border-violet-200 bg-violet-50 px-5 py-3 font-bold text-violet-700 transition hover:bg-violet-100"
        >
          Quick Demo Login
        </button>

        <p className="mt-5 text-center text-xs text-slate-400">
          Running in local mode: your events &amp; session are saved locally in your browser.
        </p>
      </section>
    </main>
  );
}
