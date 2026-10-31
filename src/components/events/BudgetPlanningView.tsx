'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Lightbulb,
  ShieldCheck,
  PiggyBank,
  Edit3,
  Check,
  Sparkles
} from 'lucide-react';
import BudgetDonutChart from '@/components/budget/BudgetDonutChart';
import type { StoredEvent, BudgetItem } from '@/lib/storage';

export default function BudgetPlanningView({
  event,
  onUpdateEvent,
}: {
  event: StoredEvent;
  onUpdateEvent?: (updated: StoredEvent) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [items, setItems] = useState<BudgetItem[]>(event.budget_items || []);

  const totalMinor = event.budget_minor;

  const formattedTotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: event.currency,
    maximumFractionDigits: 0,
  }).format(totalMinor / 100);

  function handlePercentageChange(index: number, newPercent: number) {
    const updated = [...items];
    const percent = Math.max(1, Math.min(100, isNaN(newPercent) ? 0 : newPercent));
    updated[index] = {
      ...updated[index],
      percentage: percent,
      amountMinor: Math.round((totalMinor * percent) / 100),
    };
    setItems(updated);
  }

  function handleSaveEdit() {
    setEditing(false);
    if (onUpdateEvent) {
      onUpdateEvent({
        ...event,
        budget_items: items,
      });
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Budget Allocation ({formattedTotal})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time division across all major vendor and operational categories
          </p>
        </div>

        <button
          onClick={() => setEditing(!editing)}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition"
        >
          <Edit3 size={14} />
          {editing ? 'Close Editor' : 'Edit Budget'}
        </button>
      </div>

      {/* Main Budget Grid: Donut + Allocation List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        {/* Left: Donut Chart */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-2">
          <BudgetDonutChart items={items} totalMinor={totalMinor} currency={event.currency} size={290} />
          <p className="mt-4 text-xs font-medium text-slate-400 text-center">
            Hover over any arc segment to inspect allocation details
          </p>
        </div>

        {/* Right: Allocation Breakdown List */}
        <div className="lg:col-span-7 space-y-3">
          <div className="divide-y divide-slate-100">
            {items.map((item, index) => (
              <div key={item.category} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-semibold text-slate-800">{item.category}</span>
                </div>

                <div className="flex items-center gap-3">
                  {editing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={item.percentage}
                        onChange={(e) => handlePercentageChange(index, Number(e.target.value))}
                        className="w-14 rounded-lg border border-slate-300 px-2 py-1 text-right text-xs font-bold text-slate-900"
                      />
                      <span className="text-xs font-bold text-slate-500">%</span>
                    </div>
                  ) : (
                    <>
                      <span className="font-bold text-slate-900">
                        {new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: event.currency,
                          maximumFractionDigits: 0,
                        }).format(item.amountMinor / 100)}
                      </span>
                      <span className="text-xs font-semibold text-slate-400 w-12 text-right">
                        ({item.percentage}%)
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {editing && (
            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={handleSaveEdit}
                className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-5 py-2 text-xs font-bold text-white hover:bg-violet-700 transition"
              >
                <Check size={14} /> Save Allocation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AI Insights Card (Screen 5 Blueprint) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="text-violet-600" size={18} />
          <h3 className="text-base font-bold text-slate-900">AI Insights &amp; Optimization</h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-2xl bg-violet-50/60 border border-violet-100 p-4">
            <TrendingUp size={18} className="text-violet-600 shrink-0 mt-0.5" />
            <p className="text-xs text-violet-950 font-medium leading-relaxed">
              Catering is 30% of your budget, which is optimal for a {event.guest_count}-guest celebration.
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-amber-50/60 border border-amber-100 p-4">
            <Lightbulb size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-950 font-medium leading-relaxed">
              Consider booking venue early to get guaranteed off-peak pricing and preferred slots.
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 p-4">
            <ShieldCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-950 font-medium leading-relaxed">
              Keep 8% as emergency reserve for unexpected guest additions or logistical changes.
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-blue-50/60 border border-blue-100 p-4">
            <PiggyBank size={18} className="text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-950 font-medium leading-relaxed">
              You can save up to ~₹50,000 by choosing weekday slots or seasonal local produce menus.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
