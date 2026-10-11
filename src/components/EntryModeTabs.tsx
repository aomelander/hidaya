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
        className="flex items-center p-1 rounded-2xl bg-[#FAF8F5] dark:bg-[#061B16]/80 border border-emerald-900/10 dark:border-emerald-800/40 w-full rtl:space-x-reverse"
      >
        <button
          type="button"
          onClick={() => onSelectMode('moment')}
          className={`flex-1 min-h-[40px] py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer text-center whitespace-nowrap truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B900] ${
            activeMode === 'moment'
              ? 'bg-[#006D53] text-white shadow-2xs'
              : 'text-slate-600 dark:text-[#9BAFA7] hover:text-emerald-900 dark:hover:text-[#F5F7F2]'
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
          className={`flex-1 min-h-[40px] py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer text-center whitespace-nowrap truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B900] ${
            activeMode === 'questions'
              ? 'bg-[#006D53] text-white shadow-2xs'
              : 'text-slate-600 dark:text-[#9BAFA7] hover:text-emerald-900 dark:hover:text-[#F5F7F2]'
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
          className={`flex-1 min-h-[40px] py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer text-center whitespace-nowrap truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B900] ${
            activeMode === 'growth'
              ? 'bg-[#006D53] text-white shadow-2xs'
              : 'text-slate-600 dark:text-[#9BAFA7] hover:text-emerald-900 dark:hover:text-[#F5F7F2]'
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
