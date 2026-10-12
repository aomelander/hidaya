"use client";

/**
 * @file src/components/Header.tsx
 * @description X / Instagram inspired sticky top navigation header for Hidaya.
 * Houses Brand Wordmark, Integrated Compact Search Bar with Live Suggestion Popover,
 * Global Audio Play/Pause trigger, and Preferences action button.
 */

import React, { useState, useRef } from 'react';
import { BookOpen, SlidersHorizontal, Search, X } from 'lucide-react';
import { Language, QuickPill } from '../types';
import { getDictionary } from '../lib/i18n/dictionaries';
import { VoiceSearchButton } from './VoiceSearchButton';
import { SearchSuggestionsPopover } from './SearchSuggestionsPopover';

export interface HeaderProps {
  language: Language;
  onLanguageChange?: (lang: Language) => void;
  onSelectHome?: () => void;
  onOpenPreferences?: () => void;
  isPreferencesOpen?: boolean;
  // Search Bar Integration (X-Style)
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  onSubmitSearch?: (e: React.FormEvent) => void;
  isAnalyzing?: boolean;
  isListening?: boolean;
  onToggleVoice?: () => void;
  speechError?: string | null;
  onVoiceTranscript?: (transcript: string) => void;
  onSelectPill?: (pill: QuickPill) => void;
  onSelectTodayFocus?: (passageId: string) => void;
  onSelectSurah?: (surahNumber: number, ayahNumber?: number) => void;
  onSelectBookmark?: (verseId: string) => void;
  // Global Audio Play/Pause
  isGlobalPlaying?: boolean;
  onToggleGlobalPlay?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onSelectHome,
  onOpenPreferences,
  isPreferencesOpen = false,
  searchQuery = '',
  onSearchChange,
  onSubmitSearch,
  isAnalyzing = false,
  isListening = false,
  onToggleVoice,
  speechError,
  onVoiceTranscript,
  onSelectPill,
  onSelectTodayFocus,
  onSelectSurah,
  onSelectBookmark,
  isGlobalPlaying = false,
  onToggleGlobalPlay,
}) => {
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dict = getDictionary(language);

  const getSearchPlaceholder = () => {
    if (isListening) {
      return language === 'ar'
        ? 'جاري الاستماع...'
        : language === 'sv'
        ? 'Lyssnar...'
        : language === 'fr'
        ? 'Écoute en cours...'
        : 'Listening...';
    }
    if (language === 'ar') return 'ابحث عن آية، شعور، أو موضوع (مثل: 2:255، الصبر)...';
    if (language === 'sv') return 'Sök vers, känsla eller ämne (t.ex. 2:255, tålamod)...';
    if (language === 'fr') return 'Rechercher un verset, thème ou émotion (ex. 2:255, patience)...';
    return 'Search an Ayah, theme or emotion (e.g. 2:255, patience)...';
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuggestionsOpen(false);
    inputRef.current?.blur();
    onSubmitSearch?.(e);
  };

  const handleClear = () => {
    onSearchChange?.('');
    inputRef.current?.focus();
  };


  return (
    <header
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className="sticky top-0 z-40 w-full h-16 backdrop-blur-md bg-[#FAF8F5]/94 dark:bg-[#061B16]/94 border-b border-emerald-900/10 dark:border-emerald-800/30 transition-colors no-print"
    >
      <div className="max-w-5xl mx-auto px-3 sm:px-6 h-full flex items-center justify-between gap-2 sm:gap-4 relative">
        {/* Zone 1: Minimalist Brand Identity (Home / Feed Return) */}
        <button
          type="button"
          onClick={onSelectHome}
          className="inline-flex items-center gap-2 sm:gap-2.5 text-start cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B900] rounded-xl p-1 shrink-0"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#006D53] dark:bg-[#0B3027] border border-emerald-700/40 flex items-center justify-center text-[#F4B900] shadow-xs transition-transform group-hover:scale-[1.03]">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-emerald-950 dark:text-[#F5F7F2] hidden md:flex items-center gap-2 whitespace-nowrap">
            <span>Hidaya</span>
            <span className="font-arabic text-amber-700 dark:text-[#F4B900] text-base sm:text-lg font-normal">
              هِدَايَة
            </span>
          </span>
        </button>

        {/* Zone 2: X-Style Integrated Search Bar with Dropdown Suggestion Popover */}
        <div className="flex-1 max-w-xl mx-1 sm:mx-2 relative">
          <form onSubmit={handleFormSubmit} className="relative w-full">
            <div
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-white dark:bg-[#0B3027] border transition-all ${
                isSuggestionsOpen
                  ? 'border-[#006D53] dark:border-[#F4B900] ring-2 ring-[#006D53]/20 shadow-sm'
                  : 'border-emerald-900/12 dark:border-emerald-800/40 hover:border-[#006D53]/50'
              }`}
            >
              {/* Search Icon or Analyzing Spinner */}
              <div className="shrink-0 text-emerald-800 dark:text-[#F4B900]">
                {isAnalyzing ? (
                  <span className="w-4 h-4 border-2 border-[#006D53] dark:border-[#F4B900] border-t-transparent rounded-full animate-spin block" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </div>

              {/* Compact Input */}
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onFocus={() => setIsSuggestionsOpen(true)}
                onChange={(e) => {
                  onSearchChange?.(e.target.value);
                  if (!isSuggestionsOpen) setIsSuggestionsOpen(true);
                }}
                placeholder={getSearchPlaceholder()}
                className="flex-1 min-w-0 py-1 px-1 text-xs sm:text-sm bg-transparent text-slate-900 dark:text-[#F5F7F2] placeholder:text-slate-400 dark:placeholder:text-[#9BAFA7]/60 focus:outline-none placeholder:truncate"
                aria-label={dict.searchPlaceholder}
              />

              {/* Clear Button */}
              {searchQuery.trim().length > 0 && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-[#F5F7F2] transition-colors shrink-0 cursor-pointer"
                  title="Clear"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Voice Input Button */}
              {onToggleVoice && (
                <div className="shrink-0 flex items-center">
                  <VoiceSearchButton
                    locale={language}
                    isListening={isListening}
                    onToggleVoice={onToggleVoice}
                    onTranscript={(text) => {
                      onVoiceTranscript?.(text);
                      setIsSuggestionsOpen(false);
                    }}
                    errorMessage={speechError}
                    onOfferTypedSearch={() => inputRef.current?.focus()}
                  />
                </div>
              )}
            </div>
          </form>

          {/* Suggestions Dropdown Popover (Today's Focus & Quick Topics) */}
          <SearchSuggestionsPopover
            isOpen={isSuggestionsOpen}
            onClose={() => setIsSuggestionsOpen(false)}
            language={language}
            onSelectQuery={(q) => {
              onSearchChange?.(q);
              setIsSuggestionsOpen(false);
              onSubmitSearch?.({ preventDefault: () => {} } as React.FormEvent);
            }}
            onSelectPill={(pill) => {
              onSelectPill?.(pill);
              setIsSuggestionsOpen(false);
            }}
            onSelectTodayFocus={(id) => {
              onSelectTodayFocus?.(id);
              setIsSuggestionsOpen(false);
            }}
            onSelectSurah={(surahNumber, ayahNumber) => {
              onSelectSurah?.(surahNumber, ayahNumber);
              setIsSuggestionsOpen(false);
            }}
            onSelectBookmark={(verseId) => {
              onSelectBookmark?.(verseId);
              setIsSuggestionsOpen(false);
            }}
          />
        </div>

        {/* Zone 3: Preferences Action Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {onOpenPreferences && (
            <button
              type="button"
              onClick={onOpenPreferences}
              className={`min-h-[38px] px-2.5 sm:px-3.5 py-1.5 rounded-xl border transition-all inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B900] ${
                isPreferencesOpen
                  ? 'bg-[#006D53] text-white border-[#006D53] shadow-2xs'
                  : 'bg-emerald-950/5 dark:bg-[#0B3027]/80 border-emerald-900/10 dark:border-emerald-800/40 text-emerald-950 dark:text-[#F5F7F2] hover:border-[#006D53]'
              }`}
              title={dict.depthNav}
              aria-label={dict.depthNav}
              aria-pressed={isPreferencesOpen}
            >
              <SlidersHorizontal className="w-4 h-4 text-[#006D53] dark:text-[#F4B900] shrink-0" />
              <span className="hidden md:inline">{dict.depthNav}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
