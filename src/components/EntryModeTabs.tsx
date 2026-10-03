"use client";

/**
 * @file EntryModeTabs.tsx
 * @description Clean 3-tab segmented control for Guidance entry modes (Moment, Questions, Growth)
 * with zero popup triggers and full RTL & Arabic localization support.
 */

import React from 'react';
import { EntryMode, Language } from '../types';
import { getDictionary } from '../lib/i18n/dictionaries';

interface EntryModeTabsProps {
  activeMode: EntryMode;
  onSelectMode: (mode: EntryMode) => void;
  language: Language;
  onOpenUnsureModal?: () => void;
}

export const EntryModeTabs: React.FC<EntryModeTabsProps> = ({
  activeMode,
  onSelectMode,
  language,
}) => {
  const dict = getDictionary(language);

  return (
    <section
      aria-label={dict.modeTitle}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <div
        role="tablist"
        className="flex items-center p-1 rounded-2xl bg-emerald-900/5 dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-800/30 max-w-xl mx-auto rtl:space-x-reverse"
      >
        <button
          type="button"
          onClick={() => onSelectMode('moment')}
          className={`flex-1 min-h-[42px] py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer text-center whitespace-nowrap truncate ${
            activeMode === 'moment'
              ? 'bg-emerald-800 text-white dark:bg-emerald-700 shadow-2xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-300'
          }`}
          aria-selected={activeMode === 'moment'}
          role="tab"
        >
          {language === 'ar'
            ? 'في هذه اللحظة'
            : language === 'sv'
            ? 'I stunden'
            : language === 'fr'
            ? 'En ce moment'
            : 'In This Moment'}
        </button>

        <button
          type="button"
          onClick={() => onSelectMode('questions')}
          className={`flex-1 min-h-[42px] py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer text-center whitespace-nowrap truncate ${
            activeMode === 'questions'
              ? 'bg-emerald-800 text-white dark:bg-emerald-700 shadow-2xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-300'
          }`}
          aria-selected={activeMode === 'questions'}
          role="tab"
        >
          {language === 'ar'
            ? 'أسئلة كبرى'
            : language === 'sv'
            ? 'Stora frågor'
            : language === 'fr'
            ? 'Grandes questions'
            : 'Big Questions'}
        </button>

        <button
          type="button"
          onClick={() => onSelectMode('growth')}
          className={`flex-1 min-h-[42px] py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer text-center whitespace-nowrap truncate ${
            activeMode === 'growth'
              ? 'bg-emerald-800 text-white dark:bg-emerald-700 shadow-2xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-300'
          }`}
          aria-selected={activeMode === 'growth'}
          role="tab"
        >
          {language === 'ar'
            ? 'التزكية والخلق'
            : language === 'sv'
            ? 'Karaktär & växande'
            : language === 'fr'
            ? 'Caractère & élévation'
            : 'Character & Growth'}
        </button>
      </div>
    </section>
  );
};
