'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Heart,
  Cake,
  Users2,
  PartyPopper,
  Calendar,
  MapPin,
  CheckCircle2,
  Circle,
  Loader2,
  ArrowRight,
  RotateCcw,
  Check,
  Wallet,
  Image as ImageIcon,
  Upload,
  X
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { saveEvent, type StoredEvent } from '@/lib/storage';

type Step = 1 | 2 | 3;

const EVENT_TYPES = [
  { id: 'wedding', label: 'Wedding', icon: Heart, desc: 'Ceremonies, banquets & receptions' },
  { id: 'birthday', label: 'Birthday', icon: Cake, desc: 'Milestones & theme celebrations' },
  { id: 'community', label: 'Community Event', icon: Users2, desc: 'Festivals, gatherings & meets' },
  { id: 'other', label: 'Other', icon: PartyPopper, desc: 'Corporate, parties & custom events' },
] as const;

export default function NewEventWizardPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Form State (Screen 2)
  const [form, setForm] = useState({
    eventType: 'wedding' as 'wedding' | 'birthday' | 'community' | 'corporate' | 'other',
    name: 'Riya & Karan Wedding',
    eventDate: '2024-12-15',
    location: 'Bhopal, Madhya Pradesh',
    guestCount: 300,
    budget: 1500000,
    preferences: 'Traditional Indian wedding with modern touch, outdoor venue, vegetarian menu, want good photography and music.',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
  });

  // AI Step 2 Progress State
  const [aiProgress, setAiProgress] = useState(15);
  const [checklistStage, setChecklistStage] = useState(0);

  // Plan Overview Tab (Screen 4)
  const [activeTab, setActiveTab] = useState<'overview' | 'themes' | 'budget' | 'timeline' | 'vendors'>('overview');
  const [generatedEvent, setGeneratedEvent] = useState<StoredEvent | null>(null);

  const checklistItems = [
    'Understanding your event requirements & visual inspiration...',
    'Analyzing visual theme colors & atmosphere...',
    'Creating detailed budget allocation with AI...',
    `Planning timeline and milestone schedule...`,
    `Matching suitable vendors in ${form.location.split(',')[0] || 'the city'}...`,
    'Finalizing personalized blueprint...',
  ];

  // Image Upload Handler
  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setForm((prev) => ({ ...prev, imageUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  }

  // Simulated & API AI Planning workflow during Step 2
  useEffect(() => {
    if (currentStep !== 2) return;

    setAiProgress(15);
    setChecklistStage(0);

    let isSubscribed = true;

    // Smooth UI progress
    const interval = setInterval(() => {
      setAiProgress((prev) => {
        if (prev >= 95) return 95;
        const next = prev + 14;
        const stage = Math.min(5, Math.floor((next / 100) * checklistItems.length));
        setChecklistStage(stage);
        return next;
      });
    }, 700);

    // Call server AI Plan API backed by OpenRouter Nemotron 3.5 Super VL
    fetch('/api/ai/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: form.eventType,
        eventDate: form.eventDate,
        location: form.location,
        guestCount: form.guestCount,
        budgetMinor: form.budget * 100,
        currency: 'INR',
        preferences: form.preferences,
        imageUrl: form.imageUrl || undefined,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!isSubscribed) return;
        setAiProgress(100);
        setChecklistStage(5);

        const plan = data.plan;

        const saved = saveEvent({
          name: form.name || `${form.eventType} Celebration`,
          event_type: form.eventType,
          event_date: form.eventDate,
          location: form.location,
          guest_count: form.guestCount,
          budget_minor: form.budget * 100,
          preferences: form.preferences,
          cover_image: form.imageUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
          status: 'planning',
          style_tag: plan?.themeIdeas?.[0]?.title || 'Custom AI Blueprint',
          summary: plan?.summary,
          theme_ideas: plan?.themeIdeas,
          budget_items: plan?.budget?.map((b: { category: string; amountMinor: number; rationale: string }, idx: number) => ({
            category: b.category,
            amountMinor: b.amountMinor,
            spentMinor: 0,
            percentage: Math.round((b.amountMinor / (form.budget * 100)) * 100) || 10,
            rationale: b.rationale,
            color: ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#6366f1', '#f43f5e'][idx % 8],
          })),
          tasks: plan?.tasks?.map((t: { title: string; daysBeforeEvent: number; priority: "low" | "medium" | "high" }, idx: number) => ({
            id: `tsk-ai-${idx}-${Date.now()}`,
            title: t.title,
            milestone: t.daysBeforeEvent > 90 ? '4-6 Months Before' : t.daysBeforeEvent > 30 ? '1-2 Months Before' : '2 Weeks Before',
            dueDate: `${t.daysBeforeEvent}d before`,
            daysBeforeEvent: t.daysBeforeEvent,
            priority: t.priority || 'medium',
            completed: false,
          })),
        });

        setTimeout(() => {
          if (!isSubscribed) return;
          setGeneratedEvent(saved);
          setCurrentStep(3);
        }, 800);
      })
      .catch((err) => {
        console.warn('API generation fallback to local heuristic:', err);
        // Fallback local save so UX never breaks
        const saved = saveEvent({
          name: form.name || `${form.eventType} Celebration`,
          event_type: form.eventType,
          event_date: form.eventDate,
          location: form.location,
          guest_count: form.guestCount,
          budget_minor: form.budget * 100,
          preferences: form.preferences,
          cover_image: form.imageUrl,
          status: 'planning',
        });
        setGeneratedEvent(saved);
        setCurrentStep(3);
      });

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  function handleStartAIPlan(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.eventDate || !form.location) return;
    setCurrentStep(2);
  }

  function handleContinueToWorkspace() {
    if (generatedEvent) {
      router.push(`/dashboard/events/${generatedEvent.id}`);
    } else {
      router.push('/dashboard');
    }
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Stepper Navigation Header */}
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2 sm:gap-4 max-w-xl w-full justify-between">
            {/* Step 1 */}
            <div className="flex items-center gap-2">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep >= 1
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {currentStep > 1 ? <Check size={14} /> : '1'}
              </div>
              <span className={`text-xs sm:text-sm font-semibold ${currentStep >= 1 ? 'text-violet-700' : 'text-slate-400'}`}>
                Basic Details
              </span>
            </div>

            <div className={`h-0.5 flex-1 mx-2 ${currentStep >= 2 ? 'bg-violet-600' : 'bg-slate-200'}`} />

            {/* Step 2 */}
            <div className="flex items-center gap-2">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep >= 2
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {currentStep > 2 ? <Check size={14} /> : '2'}
              </div>
              <span className={`text-xs sm:text-sm font-semibold ${currentStep >= 2 ? 'text-violet-700' : 'text-slate-400'}`}>
                AI Planning
              </span>
            </div>

            <div className={`h-0.5 flex-1 mx-2 ${currentStep >= 3 ? 'bg-violet-600' : 'bg-slate-200'}`} />

            {/* Step 3 */}
            <div className="flex items-center gap-2">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep === 3
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                3
              </div>
              <span className={`text-xs sm:text-sm font-semibold ${currentStep === 3 ? 'text-violet-700' : 'text-slate-400'}`}>
                Review &amp; Customize
              </span>
            </div>
          </div>
        </div>

        {/* ---------------- STEP 1: CREATE EVENT (SCREEN 2) ---------------- */}
        {currentStep === 1 && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs space-y-8 animate-in fade-in duration-300">
            <div className="text-center max-w-lg mx-auto">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Tell us about your event
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Share details and optional inspiration photos; our multimodal AI will formulate your custom plan.
              </p>
            </div>

            <form onSubmit={handleStartAIPlan} className="space-y-6 max-w-3xl mx-auto">
              {/* Event Type Cards */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Event Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {EVENT_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isSelected = form.eventType === type.id;
                    return (
                      <button
                        type="button"
                        key={type.id}
                        onClick={() => setForm((prev) => ({ ...prev, eventType: type.id }))}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                          isSelected
                            ? 'border-violet-600 bg-violet-50/60 text-violet-900 shadow-sm'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`h-11 w-11 rounded-xl flex items-center justify-center mb-2.5 ${
                            isSelected ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <Icon size={20} />
                        </div>
                        <span className="text-sm font-bold">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Event Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Riya & Karan Wedding"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-100 transition"
                />
              </div>

              {/* Event Date & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Event Date
                  </label>
                  <input
                    type="date"
                    required
                    value={form.eventDate}
                    onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-100 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    required
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. Bhopal, Madhya Pradesh"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-100 transition"
                  />
                </div>
              </div>

              {/* Guests & Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Expected Guests
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.guestCount}
                    onChange={(e) => setForm({ ...form, guestCount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-100 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Total Budget (₹)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="5000"
                    required
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-100 transition"
                  />
                </div>
              </div>

              {/* Multimodal Inspiration Image Input */}
              <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/40 p-4 sm:p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ImageIcon size={18} className="text-violet-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-violet-950">
                      Inspiration / Moodboard Image (Multimodal VLM)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-violet-200/80 text-violet-800 px-2 py-0.5 rounded-full">
                    AI Vision Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Upload a photo of your dream decor, mandap, cake, or venue. NVIDIA Nemotron Vision will analyze the colors and aesthetic.
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition"
                  >
                    <Upload size={14} /> Upload Inspiration Photo
                  </button>

                  <span className="text-xs text-slate-400">or</span>

                  <input
                    type="url"
                    placeholder="Paste image URL..."
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    className="flex-1 min-w-[220px] bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-violet-500"
                  />
                </div>

                {form.imageUrl && (
                  <div className="mt-3 relative inline-block">
                    <img
                      src={form.imageUrl}
                      alt="Inspiration Preview"
                      className="h-20 w-32 rounded-xl object-cover border border-violet-300 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, imageUrl: '' })}
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-red-600 text-xs shadow-xs"
                    >
                      <X size={10} />
                    </button>
                  </div>
                )}
              </div>

              {/* Additional Preferences */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Additional Preferences (Optional)
                </label>
                <textarea
                  rows={3}
                  value={form.preferences}
                  onChange={(e) => setForm({ ...form, preferences: e.target.value })}
                  placeholder="Traditional Indian wedding with modern touch, outdoor venue, vegetarian menu, want good photography and music."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-100 transition"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 py-4 px-6 text-base font-bold text-white shadow-lg shadow-violet-500/25 transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
              >
                <span>Generate AI Plan (with Vision)</span>
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        )}

        {/* ---------------- STEP 2: AI PLANNING (SCREEN 3) ---------------- */}
        {currentStep === 2 && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-14 shadow-xs text-center max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
            {/* Robot AI Mascot Illustration */}
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute -inset-4 bg-violet-500/20 rounded-full blur-xl animate-pulse" />
              <div className="relative h-28 w-28 rounded-3xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-xl shadow-violet-500/30">
                <Sparkles size={52} className="animate-bounce" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Our AI is creating your perfect event plan...
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Powered by NVIDIA Nemotron 3.5 Super VL &amp; OpenRouter
              </p>
            </div>

            {/* Checklist Progress Items */}
            <div className="max-w-md mx-auto space-y-3.5 text-left bg-slate-50/70 border border-slate-100 rounded-2xl p-5">
              {checklistItems.map((item, idx) => {
                const isDone = checklistStage > idx;
                const isCurrent = checklistStage === idx;
                return (
                  <div key={item} className="flex items-center gap-3">
                    {isDone ? (
                      <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 size={18} className="text-violet-600 animate-spin shrink-0" />
                    ) : (
                      <Circle size={18} className="text-slate-300 shrink-0" />
                    )}
                    <span
                      className={`text-xs sm:text-sm font-medium ${
                        isDone
                          ? 'text-slate-700'
                          : isCurrent
                          ? 'text-violet-700 font-bold'
                          : 'text-slate-400'
                      }`}
                    >
                      {item}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2 max-w-md mx-auto">
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, aiProgress)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-400">
                <span>Multimodal inference</span>
                <span>{Math.min(100, aiProgress)}%</span>
              </div>
            </div>

            {/* Tip Callout */}
            <div className="rounded-2xl bg-amber-50/80 border border-amber-200/60 p-4 text-xs text-amber-800 flex items-center justify-center gap-2">
              <span>💡</span>
              <span>NVIDIA Nemotron Super VL is analyzing your brief and photo to craft a personalized blueprint.</span>
            </div>
          </div>
        )}

        {/* ---------------- STEP 3: EVENT PLAN OVERVIEW (SCREEN 4) ---------------- */}
        {currentStep === 3 && generatedEvent && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Success Header Banner */}
            <div className="text-center max-w-xl mx-auto space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
                <span>🎉</span> Your Event Plan is Ready!
              </h1>
              <p className="text-sm text-slate-500">
                Here&apos;s a complete plan generated by AI based on your requirements.
              </p>
            </div>

            {/* Sub-tabs Navigation */}
            <div className="flex items-center justify-center overflow-x-auto pb-1">
              <div className="inline-flex rounded-full bg-white p-1 border border-slate-200 shadow-xs">
                {(['overview', 'themes', 'budget', 'timeline', 'vendors'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-full px-5 py-2 text-xs font-bold capitalize transition-all ${
                      activeTab === tab
                        ? 'bg-violet-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab === 'themes' ? 'Theme & Ideas' : tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Plan Card (Screen 4 Hero Card) */}
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8 items-center">
                {/* Event Photo Preview */}
                <div className="md:col-span-5 h-64 rounded-2xl overflow-hidden relative shadow-sm">
                  <img
                    src={generatedEvent.cover_image}
                    alt={generatedEvent.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex rounded-full bg-violet-600/90 text-white px-3 py-1 text-xs font-bold backdrop-blur-md">
                      {generatedEvent.style_tag || 'Curated Blueprint'}
                    </span>
                  </div>
                </div>

                {/* Details Breakdown */}
                <div className="md:col-span-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-violet-600">
                      AI Generated Blueprint
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">{generatedEvent.created_at.split('T')[0]}</span>
                  </div>

                  <h2 className="text-2xl font-black text-slate-900">{generatedEvent.name}</h2>

                  <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-violet-600" />
                      <span>{generatedEvent.event_date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-violet-600" />
                      <span>{generatedEvent.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users2 size={14} className="text-violet-600" />
                      <span>{generatedEvent.guest_count} Guests</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wallet size={14} className="text-violet-600" />
                      <span className="font-bold text-slate-900">
                        ₹{(generatedEvent.budget_minor / 100).toLocaleString('en-IN')} Budget
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    {generatedEvent.summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats Bar (Screen 4 Blueprint) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 text-center">
                <span className="block text-2xl font-black text-violet-600">{(generatedEvent.tasks || []).length}</span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tasks</span>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 text-center">
                <span className="block text-2xl font-black text-emerald-600">
                  ₹{((generatedEvent.budget_minor || 0) / 10000000).toFixed(1)}L
                </span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Budget</span>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 text-center">
                <span className="block text-2xl font-black text-amber-600">{(generatedEvent.budget_items || []).length}</span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Vendor Categories</span>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 text-center">
                <span className="block text-2xl font-black text-blue-600">4 Month</span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Timeline</span>
              </div>
            </div>

            {/* Sub-tab Dynamic Content Preview */}
            {activeTab === 'themes' && (
              <div className="grid gap-4 sm:grid-cols-2">
                {(generatedEvent.theme_ideas || []).map((th) => (
                  <div key={th.title} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <h3 className="font-bold text-slate-900 text-sm">{th.title}</h3>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">{th.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Step 3 Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                <RotateCcw size={14} /> Regenerate Plan
              </button>

              <button
                type="button"
                onClick={handleContinueToWorkspace}
                className="inline-flex items-center gap-2 rounded-full bg-violet-600 hover:bg-violet-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Continue to Event Workspace</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
