'use client';

import React, { useState } from 'react';

type BudgetItem = {
  category: string;
  amountMinor: number;
  percentage: number;
  color: string;
};

interface BudgetDonutChartProps {
  items: BudgetItem[];
  totalMinor: number;
  currency?: string;
  size?: number;
}

export default function BudgetDonutChart({
  items,
  totalMinor,
  currency = 'INR',
  size = 280,
}: BudgetDonutChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const radius = 90;
  const strokeWidth = 32;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Calculate cumulative percentages for donut segments
  let cumulativePercent = 0;
  const segments = items.map((item, index) => {
    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((cumulativePercent / 100) * circumference);
    cumulativePercent += item.percentage;

    return {
      ...item,
      index,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const activeItem = hoveredIndex !== null ? items[hoveredIndex] : null;

  const formattedTotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(totalMinor / 100);

  return (
    <div className="relative inline-flex flex-col items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        {/* Background track circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
        />

        {/* Dynamic Segments */}
        {segments.map((seg) => (
          <circle
            key={seg.category}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={hoveredIndex === seg.index ? strokeWidth + 4 : strokeWidth}
            strokeDasharray={seg.strokeDasharray}
            strokeDashoffset={seg.strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 cursor-pointer"
            onMouseEnter={() => setHoveredIndex(seg.index)}
            onMouseLeave={() => setHoveredIndex(null)}
          />
        ))}
      </svg>

      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
        {activeItem ? (
          <>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {activeItem.category}
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency,
                maximumFractionDigits: 0,
              }).format(activeItem.amountMinor / 100)}
            </span>
            <span className="text-xs font-bold text-violet-600 mt-0.5">
              {activeItem.percentage}% of total
            </span>
          </>
        ) : (
          <>
            <span className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {formattedTotal}
            </span>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
              Total Budget
            </span>
          </>
        )}
      </div>
    </div>
  );
}

