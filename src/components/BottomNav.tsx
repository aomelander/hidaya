"use client";

/**
 * @file src/components/BottomNav.tsx
 * @description Unified 5-action Bottom Navigation Bar for Hidaya.
 * Sticky at the bottom on mobile (`pb-safe`) and centered as a floating bottom bar
 * on desktop screens (`max-w-md mx-auto`).
 */

import React from 'react';
import {
  Search,
  Headphones,
  Compass,
  BookMarked,
  SlidersHorizontal,
} from 'lucide-react';
import { Locale, getDictionary } from '../lib/i18n/dictionaries';

export type BottomNavTab = 'guidance' | 'audio' | 'northStar' | 'journal' | 'preferences';

export interface BottomNavProps {
  locale: Locale;
  activeTab?: BottomNavTab;
  isAudioActive?: boolean;
  isPreferencesOpen?: boolean;
  isJournalOpen?: boolean;
  bookmarkCount?: number;
  onSelectGuidance: () => void;
  onToggleAudio: () => void;
  onSelectNorthStar: () => void;
  onOpenJournal: () => void;
  onOpenPreferences: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  locale,
  activeTab = 'guidance',
  isAudioActive = false,
  isPreferencesOpen = false,
  isJournalOpen = false,
  bookmarkCount = 0,
  onSelectGuidance,
  onToggleAudio,
  onSelectNorthStar,
  onOpenJournal,
  onOpenPreferences,
}) => {
  const dict = getDictionary(locale);

  return (
    <div
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      className="fixed bottom-0 inset-x-0 z-40 pointer-events-none md:bottom-4 md:px-4 no-print"
    >
      <nav
        aria-label="Primary Bottom Navigation"
        className="pointer-events-auto w-full md:max-w-md md:mx-auto bg-[#FAF8F5]/95 dark:bg-[#071712]/95 backdrop-blur-md border-t md:border border-emerald-900/15 dark:border-emerald-800/40 md:rounded-2xl md:shadow-xl h-16 px-2 flex items-center justify-around rtl:space-x-reverse pb-safe"
      >
        {/* 1. Home / Guidance (Search & Topics) */}
        <button
          type="button"
          onClick={onSelectGuidance}
          className={`min-h-[44px] min-w-[56px] flex flex-col items-center justify-center rounded-xl px-2 py-1 transition-colors cursor-pointer ${
            activeTab === 'guidance' && !isPreferencesOpen && !isJournalOpen
              ? 'text-emerald-800 dark:text-emerald-300 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300'
          }`}
          title={dict.searchNav}
          aria-label={dict.searchNav}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[64px]">
            {dict.searchNav}
          </span>
        </button>

        {/* 2. Audio (Continuous Player) */}
        <button
          type="button"
          onClick={onToggleAudio}
          className={`min-h-[44px] min-w-[56px] flex flex-col items-center justify-center rounded-xl px-2 py-1 transition-colors cursor-pointer relative ${
            isAudioActive
              ? 'text-amber-600 dark:text-amber-400 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300'
          }`}
          title={dict.audioNav}
          aria-label={dict.audioNav}
          aria-pressed={isAudioActive}
        >
          <Headphones className="w-5 h-5" />
          {isAudioActive && (
            <span className="absolute top-1.5 end-3 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          )}
          <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[64px]">
            {dict.audioNav}
          </span>
        </button>

        {/* 3. North Star (Daily Passage) */}
        <button
          type="button"
          onClick={onSelectNorthStar}
          className={`min-h-[44px] min-w-[56px] flex flex-col items-center justify-center rounded-xl px-2 py-1 transition-colors cursor-pointer ${
            activeTab === 'northStar' && !isPreferencesOpen && !isJournalOpen
              ? 'text-amber-600 dark:text-amber-400 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300'
          }`}
          title={dict.northStarNav}
          aria-label={dict.northStarNav}
        >
          <Compass className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[68px]">
            {dict.northStarNav}
          </span>
        </button>

        {/* 4. Journal (Saved Verses & Reflections) */}
        <button
          type="button"
          onClick={onOpenJournal}
          className={`min-h-[44px] min-w-[56px] flex flex-col items-center justify-center rounded-xl px-2 py-1 transition-colors cursor-pointer relative ${
            isJournalOpen
              ? 'text-emerald-800 dark:text-emerald-300 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300'
          }`}
          title={dict.savedNav}
          aria-label={dict.savedNav}
        >
          <BookMarked className="w-5 h-5" />
          {bookmarkCount > 0 && (
            <span className="absolute top-1 end-2.5 min-w-[14px] h-3.5 px-1 bg-amber-500 text-emerald-950 text-[9px] font-bold rounded-full flex items-center justify-center">
              {bookmarkCount}
            </span>
          )}
          <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[64px]">
            {dict.savedNav}
          </span>
        </button>

        {/* 5. Preferences (Triggers Customization Sheet for Depth, Language & Theme) */}
        <button
          type="button"
          onClick={onOpenPreferences}
          className={`min-h-[44px] min-w-[56px] flex flex-col items-center justify-center rounded-xl px-2 py-1 transition-colors cursor-pointer ${
            isPreferencesOpen
              ? 'text-emerald-800 dark:text-emerald-300 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300'
          }`}
          title={dict.depthNav}
          aria-label={dict.depthNav}
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[68px]">
            {dict.depthNav}
          </span>
        </button>
      </nav>
    </div>
  );
};
