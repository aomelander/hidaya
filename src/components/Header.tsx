"use client";

/**
 * @file src/components/Header.tsx
 * @description Ultra-minimalist Top Header for Hidaya.
 * Contains only the Brand Logo/Wordmark on the start side and the 4-language switcher
 * (EN, SV, FR, عربي) on the end side. Zero clutter, zero secondary popup buttons.
 */

import React from 'react';
import { BookOpen, SlidersHorizontal } from 'lucide-react';
import { Language } from '../types';
import { getDictionary } from '../lib/i18n/dictionaries';

export interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onSelectHome?: () => void;
  onOpenPreferences?: () => void;
  isPreferencesOpen?: boolean;
}

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'sv', label: 'SV' },
  { code: 'fr', label: 'FR' },
  { code: 'ar', label: 'عربي' },
];

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  onSelectHome,
  onOpenPreferences,
  isPreferencesOpen = false,
}) => {
  const dict = getDictionary(language);

  return (
    <header
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className="sticky top-0 z-30 w-full h-16 backdrop-blur-md bg-[#FAF8F5]/92 dark:bg-[#061B16]/92 border-b border-emerald-900/10 dark:border-emerald-800/30 transition-colors no-print"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-3">
        {/* Zone 1: Minimalist Brand Identity */}
        <button
          type="button"
          onClick={onSelectHome}
          className="inline-flex items-center gap-2.5 text-start cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B900] rounded-xl p-1 -ms-1"
        >
          <div className="w-9 h-9 rounded-xl bg-[#006D53] dark:bg-[#0B3027] border border-emerald-700/40 flex items-center justify-center text-[#F4B900] shadow-xs transition-transform group-hover:scale-[1.03]">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-emerald-950 dark:text-[#F5F7F2] flex items-center gap-2">
            <span>Hidaya</span>
            <span className="font-arabic text-amber-700 dark:text-[#F4B900] text-lg font-normal">
              هِدَايَة
            </span>
          </span>
        </button>

        {/* Zone 2: Clean 4-Language Switcher + Preferences Icon Button */}
        <div className="flex items-center gap-2">
          <div
            role="group"
            aria-label="Language selector"
            className="inline-flex items-center p-1 rounded-xl bg-emerald-950/5 dark:bg-[#0B3027]/80 border border-emerald-900/10 dark:border-emerald-800/40"
          >
            {LANGUAGES.map((lang) => {
              const active = language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => onLanguageChange(lang.code)}
                  className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B900] ${
                    active
                      ? 'bg-[#006D53] text-white shadow-2xs'
                      : 'text-slate-600 dark:text-[#9BAFA7] hover:text-emerald-900 dark:hover:text-[#F5F7F2]'
                  }`}
                  aria-pressed={active}
                >
                  {lang.label}
                </button>
              );
            })}
          </div>

          {onOpenPreferences && (
            <button
              type="button"
              onClick={onOpenPreferences}
              className={`min-h-[38px] min-w-[38px] p-2 rounded-xl border transition-all flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B900] ${
                isPreferencesOpen
                  ? 'bg-[#006D53] text-white border-[#006D53] shadow-2xs'
                  : 'bg-emerald-950/5 dark:bg-[#0B3027]/80 border-emerald-900/10 dark:border-emerald-800/40 text-slate-600 dark:text-[#9BAFA7] hover:text-emerald-900 dark:hover:text-[#F5F7F2]'
              }`}
              title={dict.depthNav}
              aria-label={dict.depthNav}
              aria-pressed={isPreferencesOpen}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
