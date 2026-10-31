import Link from 'next/link';
import { ArrowRight, CalendarDays, ChartNoAxesCombined, ShieldCheck, Sparkles } from 'lucide-react';

const features = [
  { icon: Sparkles, title: 'AI event architect', text: 'Turn a brief into a structured, editable event plan.' },
  { icon: ChartNoAxesCombined, title: 'Budget intelligence', text: 'Plan allocations and keep spending visible.' },
  { icon: CalendarDays, title: 'Adaptive timeline', text: 'Organize tasks and deadlines around the event date.' },
  { icon: ShieldCheck, title: 'Built with privacy in mind', text: 'Private workspaces and server-side access controls.' },
];

export default function HomePage() {
  return <main className="min-h-screen overflow-hidden">
    <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
      <Link href="/" className="text-2xl font-black tracking-tight">EVENTORA<span className="text-violet-600">.</span></Link>
      <Link href="/dashboard" className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">Open workspace <ArrowRight className="ml-2 inline" size={16}/></Link>
    </nav>
    <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-16 md:grid-cols-2 md:pt-24">
      <div>
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700"><Sparkles size={16}/> Your AI event co-planner</div>
        <h1 className="max-w-2xl text-5xl font-black leading-[1.05] tracking-tight md:text-7xl">Big moments deserve <span className="text-violet-600">brilliant</span> planning.</h1>
        <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">From weddings to neighborhood gatherings, bring your budget, timeline, vendors and ideas into one thoughtful workspace.</p>
        <div className="mt-9 flex flex-wrap gap-3"><Link href="/dashboard" className="rounded-full bg-violet-600 px-7 py-4 font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-700">Plan an event <ArrowRight className="ml-2 inline" size={18}/></Link><a href="#features" className="rounded-full border border-slate-300 bg-white px-7 py-4 font-bold text-slate-800 hover:bg-slate-50">Explore features</a></div>
        <p className="mt-5 text-xs text-slate-500">AI-generated suggestions are starting points. Verify quotes, availability and local requirements before booking.</p>
      </div>
      <div className="relative rounded-[2rem] border border-white bg-white p-5 shadow-2xl shadow-violet-100">
        <div className="rounded-3xl bg-gradient-to-br from-violet-700 via-indigo-700 to-slate-900 p-7 text-white">
          <div className="flex items-center justify-between"><span className="text-sm font-semibold text-violet-200">YOUR NEXT BIG MOMENT</span><span className="rounded-full bg-white/15 px-3 py-1 text-xs">AI PLAN</span></div>
          <h2 className="mt-12 text-3xl font-bold">A celebration<br/>that feels like you.</h2>
          <p className="mt-3 max-w-xs text-sm leading-6 text-violet-100">One clear plan. A budget you can trust. Fewer last-minute surprises.</p>
          <div className="mt-10 grid grid-cols-3 gap-2">{[['01','Ideas'],['02','Budget'],['03','Timeline']].map(([n,t])=><div key={n} className="rounded-2xl bg-white/10 p-3"><div className="text-xs text-violet-200">{n}</div><div className="mt-2 font-semibold">{t}</div></div>)}</div>
        </div>
        <div className="absolute -bottom-5 -left-5 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl"><div className="text-xs text-slate-500">Planning, simplified</div><div className="mt-1 font-bold text-slate-900">One workspace. Every detail.</div></div>
      </div>
    </section>
    <section id="features" className="border-t border-slate-200 bg-white py-20"><div className="mx-auto max-w-7xl px-6"><p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-600">Everything in sync</p><h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">From first idea to final checklist.</h2><div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{features.map(({icon:Icon,title,text})=><article key={title} className="rounded-3xl border border-slate-200 p-6 transition hover:-translate-y-1 hover:shadow-xl"><div className="inline-flex rounded-2xl bg-violet-50 p-3 text-violet-700"><Icon size={23}/></div><h3 className="mt-5 text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></article>)}</div></div></section>
    <footer className="mx-auto max-w-7xl px-6 py-8 text-sm text-slate-500">© {new Date().getFullYear()} EVENTORA. Plan smarter. Celebrate better.</footer>
  </main>;
}
