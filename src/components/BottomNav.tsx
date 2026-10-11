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
  BookOpen,
  Compass,
  BookMarked,
  SlidersHorizontal,
} from 'lucide-react';
import { Locale, getDictionary } from '../lib/i18n/dictionaries';

export type BottomNavTab = 'guidance' | 'audio' | 'read' | 'northStar' | 'journal' | 'preferences';

export interface BottomNavProps {
  locale: Locale;
  activeTab?: BottomNavTab;
  isAudioActive?: boolean;
  isPreferencesOpen?: boolean;
  isJournalOpen?: boolean;
  bookmarkCount?: number;
  showReadPage?: boolean;
  showNorthStarPage?: boolean;
  onSelectGuidance: () => void;
  onToggleAudio: () => void;
  onSelectRead?: () => void;
  onSelectNorthStar: () => void;
  onOpenJournal: () => void;
  onOpenPreferences?: () => void;
}

const READ_NAV_LABELS: Record<Locale, string> = {
  en: 'Read',
  sv: 'Läs',
  fr: 'Lire',
  ar: 'القرآن',
};

export const BottomNav: React.FC<BottomNavProps> = ({
  locale,
  activeTab = 'guidance',
  isAudioActive = false,
  isPreferencesOpen = false,
  isJournalOpen = false,
  bookmarkCount = 0,
  showReadPage = true,
  showNorthStarPage = true,
  onSelectGuidance,
  onToggleAudio,
  onSelectRead,
  onSelectNorthStar,
  onOpenJournal,
  onOpenPreferences,
}) => {
  const dict = getDictionary(locale);
  const readLabel = READ_NAV_LABELS[locale] || READ_NAV_LABELS.en;

  return (
    <div
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      className="fixed bottom-0 inset-x-0 z-40 pointer-events-none md:bottom-4 md:px-4 no-print"
    >
      <nav
        aria-label="Primary Bottom Navigation"
        className="pointer-events-auto w-full md:max-w-lg md:mx-auto bg-[#FAF8F5]/95 dark:bg-[#061B16]/95 backdrop-blur-md border-t md:border border-emerald-900/15 dark:border-emerald-800/40 md:rounded-2xl md:shadow-2xl h-16 px-1.5 sm:px-2 flex items-center justify-around rtl:space-x-reverse pb-safe"
      >
        {/* 1. Guidance (Search & Topics) */}
        <button
          type="button"
          onClick={onSelectGuidance}
          aria-current={activeTab === 'guidance' && !isPreferencesOpen && !isJournalOpen ? 'page' : undefined}
          className={`min-h-[46px] min-w-[52px] flex-1 flex flex-col items-center justify-center rounded-xl px-1 py-1 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B900] ${
            activeTab === 'guidance' && !isPreferencesOpen && !isJournalOpen
              ? 'bg-[#006D53]/10 dark:bg-[#0B3027] text-[#006D53] dark:text-[#F4B900] font-semibold'
              : 'text-slate-600 dark:text-[#9BAFA7] hover:text-emerald-800 dark:hover:text-[#F5F7F2]'
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
          aria-current={isAudioActive ? 'page' : undefined}
          className={`min-h-[46px] min-w-[52px] flex-1 flex flex-col items-center justify-center rounded-xl px-1 py-1 transition-all cursor-pointer relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B900] ${
            isAudioActive
              ? 'bg-[#006D53]/10 dark:bg-[#0B3027] text-amber-700 dark:text-[#F4B900] font-semibold'
              : 'text-slate-600 dark:text-[#9BAFA7] hover:text-emerald-800 dark:hover:text-[#F5F7F2]'
          }`}
          title={dict.audioNav}
          aria-label={dict.audioNav}
          aria-pressed={isAudioActive}
        >
          <Headphones className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[64px]">
            {dict.audioNav}
          </span>
        </button>

        {/* 3. Read (Lire le Coran — Optional in Preferences) */}
        {showReadPage && onSelectRead && (
          <button
            type="button"
            onClick={onSelectRead}
            aria-current={activeTab === 'read' && !isPreferencesOpen && !isJournalOpen ? 'page' : undefined}
            className={`min-h-[46px] min-w-[52px] flex-1 flex flex-col items-center justify-center rounded-xl px-1 py-1 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B900] ${
              activeTab === 'read' && !isPreferencesOpen && !isJournalOpen
                ? 'bg-amber-500/15 dark:bg-[#0B3027] text-amber-700 dark:text-[#F4B900] font-semibold'
                : 'text-slate-600 dark:text-[#9BAFA7] hover:text-emerald-800 dark:hover:text-[#F5F7F2]'
            }`}
            title={readLabel}
            aria-label={readLabel}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[64px]">
              {readLabel}
            </span>
          </button>
        )}

        {/* 4. North Star (Daily Passage — Optional in Preferences) */}
        {showNorthStarPage && (
          <button
            type="button"
            onClick={onSelectNorthStar}
            aria-current={activeTab === 'northStar' && !isPreferencesOpen && !isJournalOpen ? 'page' : undefined}
            className={`min-h-[46px] min-w-[52px] flex-1 flex flex-col items-center justify-center rounded-xl px-1 py-1 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B900] ${
              activeTab === 'northStar' && !isPreferencesOpen && !isJournalOpen
                ? 'bg-amber-500/15 dark:bg-[#0B3027] text-amber-700 dark:text-[#F4B900] font-semibold'
                : 'text-slate-600 dark:text-[#9BAFA7] hover:text-emerald-800 dark:hover:text-[#F5F7F2]'
            }`}
            title={dict.northStarNav}
            aria-label={dict.northStarNav}
          >
            <Compass className="w-5 h-5 text-amber-600 dark:text-[#F4B900]" />
            <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[64px]">
              {dict.northStarNav}
            </span>
          </button>
        )}

        {/* 5. Journal (Saved Verses & Reflections) */}
        <button
          type="button"
          onClick={onOpenJournal}
          aria-current={isJournalOpen ? 'page' : undefined}
          className={`min-h-[46px] min-w-[52px] flex-1 flex flex-col items-center justify-center rounded-xl px-1 py-1 transition-all cursor-pointer relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B900] ${
            isJournalOpen
              ? 'bg-[#006D53]/10 dark:bg-[#0B3027] text-[#006D53] dark:text-[#F4B900] font-semibold'
              : 'text-slate-600 dark:text-[#9BAFA7] hover:text-emerald-800 dark:hover:text-[#F5F7F2]'
          }`}
          title={dict.savedNav}
          aria-label={dict.savedNav}
        >
          <BookMarked className="w-5 h-5" />
          {bookmarkCount > 0 && (
            <span className="absolute top-1 end-2 min-w-[15px] h-3.5 px-1 bg-[#F4B900] text-[#061B16] text-[9px] font-bold rounded-full flex items-center justify-center tabular-nums">
              {bookmarkCount}
            </span>
          )}
          <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[64px]">
            {dict.savedNav}
          </span>
        </button>

        {/* 6. Preferences (Settings & Depth) */}
        {onOpenPreferences && (
          <button
            type="button"
            onClick={onOpenPreferences}
            aria-current={isPreferencesOpen ? 'page' : undefined}
            className={`min-h-[46px] min-w-[52px] flex-1 flex flex-col items-center justify-center rounded-xl px-1 py-1 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B900] ${
              isPreferencesOpen
                ? 'bg-[#006D53]/10 dark:bg-[#0B3027] text-[#006D53] dark:text-[#F4B900] font-semibold'
                : 'text-slate-600 dark:text-[#9BAFA7] hover:text-emerald-800 dark:hover:text-[#F5F7F2]'
            }`}
            title={dict.depthNav}
            aria-label={dict.depthNav}
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[64px]">
              {dict.depthNav}
            </span>
          </button>
        )}
      </nav>
    </div>
  );
};
