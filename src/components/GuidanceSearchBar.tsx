"use client";

/**
 * @file GuidanceSearchBar.tsx
 * @description Accessible search and voice input bar for Quranic contemplation inquiries with full RTL & Arabic localization.
 */

import React from 'react';
import { Search, X } from 'lucide-react';
import { EntryMode, Language } from '../types';
import { getDictionary } from '../lib/i18n/dictionaries';
import { VoiceSearchButton } from './VoiceSearchButton';

interface GuidanceSearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isAnalyzing: boolean;
  isListening: boolean;
  speechError?: string | null;
  onToggleVoice: () => void;
  activeMode: EntryMode;
  language: Language;
  onVoiceTranscript?: (transcript: string) => void;
}

export const GuidanceSearchBar: React.FC<GuidanceSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onSubmit,
  isAnalyzing,
  isListening,
  speechError,
  onToggleVoice,
  activeMode,
  language,
  onVoiceTranscript,
}) => {
  const dict = getDictionary(language);

  const getPlaceholder = () => {
    if (isListening) {
      return language === 'ar'
        ? 'جاري الاستماع... تحدث الآن بما تشعر به'
        : language === 'sv'
        ? 'Lyssnar... säg dina tankar eller känslor nu'
        : language === 'fr'
        ? 'Écoute en cours... exprimez vos pensées maintenant'
        : 'Listening... speak your reflection now';
    }

    if (language === 'ar') {
      return activeMode === 'moment'
        ? dict.searchPlaceholder
        : activeMode === 'questions'
        ? "ما السؤال الوجودي الذي يشغل قلبك؟ (مثال: 'الحكمة من الابتلاء')..."
        : "ما هو الخلق الذي تسعى لتزكيته؟ (مثال: 'الصبر'، 'حفظ اللسان')...";
    }
    if (language === 'sv') {
      return activeMode === 'moment'
        ? dict.searchPlaceholder
        : activeMode === 'questions'
        ? "Vilken fråga väger på ditt hjärta? (t.ex. 'Varför lider vi?')..."
        : "Vilken egenskap vill du stärka? (t.ex. 'Tålamod', 'Ödmjukhet')...";
    }
    if (language === 'fr') {
      return activeMode === 'moment'
        ? dict.searchPlaceholder
        : activeMode === 'questions'
        ? "Quelle question pèse sur votre cœur ? (ex. 'Sens de la souffrance')..."
        : "Quel trait de caractère cultivez-vous ? (ex. 'Patience', 'Humilité')...";
    }
    return activeMode === 'moment'
      ? dict.searchPlaceholder
      : activeMode === 'questions'
      ? "What existential question weighs on your mind? (e.g., 'Purpose of suffering')..."
      : "What character trait are you cultivating? (e.g., 'Humility', 'Tongue control')...";
  };

  return (
    <section aria-label="Search and Voice Input" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <form onSubmit={onSubmit} className="relative max-w-3xl mx-auto">
        <div
          className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 shadow-lg rounded-2xl bg-white dark:bg-[#0A1E17] border-2 transition-all ${
            isListening
              ? 'border-red-500 ring-2 ring-red-500/20 shadow-red-500/10'
              : 'border-emerald-900/15 dark:border-emerald-800/40 focus-within:border-emerald-700 dark:focus-within:border-emerald-500 shadow-emerald-950/5'
          }`}
        >
          {/* Leading search icon */}
          <div
            className={`ps-1.5 sm:ps-2 shrink-0 transition-colors ${
              isListening ? 'text-red-500 animate-pulse' : 'text-emerald-800 dark:text-emerald-400'
            }`}
          >
            <Search className="w-5 h-5" />
          </div>

          {/* Text Input - flex-1 min-w-0 guarantees text bounds never interfere with buttons */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={getPlaceholder()}
            className="flex-1 min-w-0 py-2 sm:py-2.5 px-1.5 sm:px-2 text-sm sm:text-base bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-emerald-300/40 focus:outline-none placeholder:truncate"
            aria-label={dict.searchPlaceholder}
          />

          {/* Clear button when query is not empty */}
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors shrink-0 cursor-pointer"
              title={language === 'ar' ? 'مسح' : language === 'sv' ? 'Rensa' : language === 'fr' ? 'Effacer' : 'Clear'}
              aria-label={language === 'ar' ? 'مسح' : language === 'sv' ? 'Rensa' : language === 'fr' ? 'Effacer' : 'Clear'}
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Trailing action group: Microphone & Submit button */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Voice input button with dedicated container */}
            <div className="relative flex items-center justify-center shrink-0">
              <VoiceSearchButton
                locale={language}
                isListening={isListening}
                onToggleVoice={onToggleVoice}
                onTranscript={onVoiceTranscript}
                errorMessage={speechError}
              />
            </div>

            {/* Responsive Submit button */}
            <button
              type="submit"
              disabled={isAnalyzing}
              aria-label={isAnalyzing ? dict.seekingStatus : dict.searchButton}
              title={isAnalyzing ? dict.seekingStatus : dict.searchButton}
              className="min-h-[40px] px-3 sm:px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-2xs transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 shrink-0"
            >
              {isAnalyzing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                  <span className="hidden sm:inline">{dict.seekingStatus}</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 sm:hidden shrink-0" />
                  <span className="hidden sm:inline">{dict.searchButton}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};
