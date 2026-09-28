"use client";

/**
 * @file OffTopicBanner.tsx
 * @description Courteous, explanatory banner shown when a query is outside
 * the Quranic reflection and spiritual guidance domain (e.g. coding, betting, or trivial trivia).
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { APP_CONFIG } from '../config/appConfig';

interface OffTopicBannerProps {
  message?: string;
  onSelectSuggestion: (query: string) => void;
}

export const OffTopicBanner: React.FC<OffTopicBannerProps> = ({
  message,
  onSelectSuggestion,
}) => {
  return (
    <section
      aria-label="Unsupported Query Fallback"
      className="p-8 rounded-3xl bg-amber-500/10 border-2 border-amber-600/30 dark:border-amber-500/30 text-center space-y-4"
    >
      <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto">
        <AlertCircle className="w-6 h-6" />
      </div>

      <div className="space-y-2 max-w-lg mx-auto">
        <h3 className="text-lg font-bold text-amber-950 dark:text-amber-100">
          Off-Topic or Non-Reflective Request
        </h3>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {message ||
            'Hidaya is dedicated strictly to source-grounded Quranic reflection for human emotions, life situations, and character growth. We do not provide sports odds, technical coding, mathematical trivia, or binding fatwas.'}
        </p>
      </div>

      <div className="pt-2">
        <p className="text-xs font-semibold text-amber-900 dark:text-amber-300 uppercase tracking-wider mb-3">
          Try exploring these verified life contemplation themes instead:
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {APP_CONFIG.CURATED_SUGGESTIONS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onSelectSuggestion(item.query)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-emerald-950 border border-amber-600/30 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900 transition-colors cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
