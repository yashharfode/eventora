'use client';

import React from 'react';

interface VoiceWaveformProps {
  status: 'listening' | 'speaking' | 'thinking' | 'idle';
}

export default function VoiceWaveform({ status }: VoiceWaveformProps) {
  if (status === 'idle') return null;

  return (
    <div className="flex items-center justify-center gap-1.5 h-8 px-4 py-1.5 rounded-full bg-violet-950/80 backdrop-blur-md border border-violet-500/30 shadow-lg animate-in fade-in zoom-in-95 duration-200">
      <span className="text-[10px] font-bold uppercase tracking-wider text-violet-300 mr-2 flex items-center gap-1.5">
        <span
          className={`h-2 w-2 rounded-full ${
            status === 'listening'
              ? 'bg-red-500 animate-ping'
              : status === 'speaking'
              ? 'bg-emerald-400 animate-pulse'
              : 'bg-amber-400 animate-spin'
          }`}
        />
        {status === 'listening'
          ? 'Listening...'
          : status === 'speaking'
          ? 'Voice Co-Planner Speaking...'
          : 'Processing Plan...'}
      </span>

      {[...Array(6)].map((_, i) => (
        <span
          key={i}
          className={`w-1 rounded-full ${
            status === 'listening'
              ? 'bg-gradient-to-t from-red-400 to-pink-500'
              : status === 'speaking'
              ? 'bg-gradient-to-t from-emerald-400 to-teal-300'
              : 'bg-gradient-to-t from-amber-400 to-violet-400'
          }`}
          style={{
            height: `${12 + (i % 3) * 8}px`,
            animation: 'pulse 0.8s ease-in-out infinite alternate',
            animationDelay: `${i * 120}ms`,
          }}
        />
      ))}
    </div>
  );
}

