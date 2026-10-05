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
      className="sticky top-0 z-30 w-full h-14 backdrop-blur-md bg-[#FAF8F5]/90 dark:bg-[#071712]/90 border-b border-emerald-900/10 dark:border-emerald-800/30 transition-colors no-print"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-3">
        {/* Zone 1: Minimalist Brand Identity */}
        <button
          type="button"
          onClick={onSelectHome}
          className="inline-flex items-center gap-2.5 text-start cursor-pointer group focus:outline-none"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-800 dark:bg-emerald-700 flex items-center justify-center text-amber-300 shadow-2xs">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-emerald-950 dark:text-emerald-50 flex items-center gap-1.5">
            <span>Hidaya</span>
            <span className="font-arabic text-amber-600 dark:text-amber-400 text-base font-normal">
              هِدَايَة
            </span>
          </span>
        </button>

        {/* Zone 2: Clean 4-Language Switcher + Preferences Icon Button */}
        <div className="flex items-center gap-2">
          <div
            role="group"
            aria-label="Language selector"
            className="inline-flex items-center p-1 rounded-xl bg-emerald-900/5 dark:bg-emerald-950/60 border border-emerald-900/10 dark:border-emerald-800/40"
          >
            {LANGUAGES.map((lang) => {
              const active = language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => onLanguageChange(lang.code)}
                  className={`min-h-[30px] px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-emerald-800 text-white dark:bg-emerald-700 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-emerald-900 dark:hover:text-emerald-200'
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
              className={`min-h-[36px] min-w-[36px] p-2 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                isPreferencesOpen
                  ? 'bg-emerald-800 text-white border-emerald-700 dark:bg-emerald-700 shadow-2xs'
                  : 'bg-emerald-900/5 dark:bg-emerald-950/60 border-emerald-900/10 dark:border-emerald-800/40 text-slate-600 dark:text-slate-300 hover:text-emerald-900 dark:hover:text-emerald-100'
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
