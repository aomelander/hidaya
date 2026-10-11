"use client";

/**
 * @file src/components/Header.tsx
 * @description Ultra-minimalist Top Header for Hidaya.
 * Contains ONLY the Brand Logo/Wordmark on the start side (returns to Guidance)
 * and the Preferences Icon Button on the end side.
 * Language selector and TV Fullscreen mode are housed inside Preferences.
 */

import React from 'react';
import { BookOpen, SlidersHorizontal } from 'lucide-react';
import { Language } from '../types';
import { getDictionary } from '../lib/i18n/dictionaries';

export interface HeaderProps {
  language: Language;
  onLanguageChange?: (lang: Language) => void;
  onSelectHome?: () => void;
  onOpenPreferences?: () => void;
  isPreferencesOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onSelectHome,
  onOpenPreferences,
  isPreferencesOpen = false,
}) => {
  const dict = getDictionary(language);

  return (
    <header
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className="sticky top-0 z-30 w-full h-15 backdrop-blur-md bg-[#FAF8F5]/92 dark:bg-[#061B16]/92 border-b border-emerald-900/10 dark:border-emerald-800/30 transition-colors no-print"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">
        {/* Zone 1: Minimalist Brand Identity (Returns to Guidance Feed) */}
        <button
          type="button"
          onClick={onSelectHome}
          className="inline-flex items-center gap-2.5 text-start cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B900] rounded-xl p-1 -ms-1"
        >
          <div className="w-9 h-9 rounded-xl bg-[#006D53] dark:bg-[#0B3027] border border-emerald-700/40 flex items-center justify-center text-[#F4B900] shadow-xs transition-transform group-hover:scale-[1.03]">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-emerald-950 dark:text-[#F5F7F2] flex items-center gap-2 whitespace-nowrap">
            <span>Hidaya</span>
            <span className="font-arabic text-amber-700 dark:text-[#F4B900] text-lg font-normal">
              هِدَايَة
            </span>
          </span>
        </button>

        {/* Zone 2: Single Preferences Action Button */}
        <div className="flex items-center gap-2 shrink-0">
          {onOpenPreferences && (
            <button
              type="button"
              onClick={onOpenPreferences}
              className={`min-h-[42px] px-3.5 py-2 rounded-xl border transition-all inline-flex items-center gap-2 text-xs font-semibold cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B900] ${
                isPreferencesOpen
                  ? 'bg-[#006D53] text-white border-[#006D53] shadow-2xs'
                  : 'bg-emerald-950/5 dark:bg-[#0B3027]/80 border-emerald-900/10 dark:border-emerald-800/40 text-emerald-950 dark:text-[#F5F7F2] hover:border-[#006D53]'
              }`}
              title={dict.depthNav}
              aria-label={dict.depthNav}
              aria-pressed={isPreferencesOpen}
            >
              <SlidersHorizontal className="w-4 h-4 text-[#006D53] dark:text-[#F4B900] shrink-0" />
              <span>{dict.depthNav}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
