import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dark' | 'light';
  showSubtitle?: boolean;
  subtitleText?: string;
  href?: string;
}

export default function Logo({
  className = '',
  size = 'md',
  variant = 'dark',
  showSubtitle = true,
  subtitleText = 'AI EVENT ARCHITECT',
  href,
}: LogoProps) {
  const iconSizes = {
    sm: 'h-8 w-8',
    md: 'h-9 w-9',
    lg: 'h-11 w-11',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const content = (
    <div className={`flex items-center gap-3 select-none group ${className}`}>
      {/* Professional Vector Mark */}
      <div
        className={`relative ${iconSizes[size]} shrink-0 transition-transform duration-300 group-hover:scale-105`}
      >
        <svg
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          <defs>
            {/* Background Rich Gradient */}
            <linearGradient id="eventora-bg" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4F46E5" />
              <stop offset="0.5" stopColor="#7C3AED" />
              <stop offset="1" stopColor="#9333EA" />
            </linearGradient>

            {/* Core Ribbon Gradient */}
            <linearGradient id="eventora-ribbon" x1="8" y1="8" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" />
              <stop offset="0.6" stopColor="#E9D5FF" />
              <stop offset="1" stopColor="#DDD6FE" />
            </linearGradient>

            {/* Accent Spark Glow */}
            <linearGradient id="eventora-glow" x1="18" y1="12" x2="32" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FDE047" />
              <stop offset="0.7" stopColor="#F472B6" />
              <stop offset="1" stopColor="#C084FC" />
            </linearGradient>

            <filter id="shadow-filter" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#7C3AED" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Squircle Badge Base */}
          <rect
            width="44"
            height="44"
            rx="13"
            fill="url(#eventora-bg)"
          />

          {/* Precision inner glass rim */}
          <rect
            x="0.75"
            y="0.75"
            width="42.5"
            height="42.5"
            rx="12.25"
            stroke="white"
            strokeOpacity="0.25"
            strokeWidth="1.5"
          />

          {/* Interlocking Celebratory Monogram "E" with Staged Arches */}
          {/* Top Arch */}
          <path
            d="M13 15C13 13.3431 14.3431 12 16 12H28.5C29.8807 12 31 13.1193 31 14.5C31 15.8807 29.8807 17 28.5 17H18V19H26C27.1046 19 28 19.8954 28 21C28 22.1046 27.1046 23 26 23H18V27H28.5C29.8807 27 31 28.1193 31 29.5C31 30.8807 29.8807 32 28.5 32H16C14.3431 32 13 30.6569 13 29V15Z"
            fill="url(#eventora-ribbon)"
          />

          {/* Stylized Celestial Core Spark (The AI Catalyst) */}
          <path
            d="M26.5 14C26.5 17.5 29 20 32.5 20C29 20 26.5 22.5 26.5 26C26.5 22.5 24 20 20.5 20C24 20 26.5 17.5 26.5 14Z"
            fill="url(#eventora-glow)"
            filter="url(#shadow-filter)"
          />

          {/* Dynamic Ambient Accent Dot */}
          <circle cx="16" cy="14.5" r="1.5" fill="#FFFFFF" fillOpacity="0.9" />
        </svg>
      </div>

      {/* Typography */}
      <div className="flex flex-col justify-center">
        <div className="flex items-baseline">
          <span
            className={`font-black tracking-[-0.02em] font-sans ${textSizes[size]} ${
              variant === 'dark' ? 'text-white' : 'text-slate-900'
            }`}
          >
            EVENTORA
          </span>
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 ml-0.5" />
        </div>

        {showSubtitle && (
          <span
            className={`text-[9.5px] font-extrabold uppercase tracking-[0.22em] ${
              variant === 'dark' ? 'text-violet-400/90' : 'text-violet-600'
            } -mt-0.5`}
          >
            {subtitleText}
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex">
        {content}
      </Link>
    );
  }

  return content;
}
