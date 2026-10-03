"use client";

/**
 * @file GuidanceSearchBar.tsx
 * @description Accessible search and voice input bar for Quranic contemplation inquiries with full RTL & Arabic localization.
 */

import React from 'react';
import { Search } from 'lucide-react';
import { EntryMode, Language } from '../types';
import { getDictionary } from '../lib/i18n/dictionaries';
import { VoiceSearchButton } from './VoiceSearchButton';

interface GuidanceSearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isAnalyzing: boolean;
  isListening: boolean;
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
  onToggleVoice,
  activeMode,
  language,
  onVoiceTranscript,
}) => {
  const dict = getDictionary(language);

  const getPlaceholder = () => {
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
        <div className="relative flex items-center shadow-lg shadow-emerald-950/5 rounded-2xl overflow-hidden bg-white dark:bg-[#0A1E17] border-2 border-emerald-900/15 dark:border-emerald-800/40 focus-within:border-emerald-700 dark:focus-within:border-emerald-500 transition-all rtl:space-x-reverse">
          <div className="ps-4 pe-1 text-emerald-800 dark:text-emerald-400">
            <Search className="w-5 h-5" />
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={getPlaceholder()}
            className="w-full py-4 ps-3 pe-28 sm:pe-36 text-sm sm:text-base bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
            aria-label={dict.searchPlaceholder}
          />

          <div className="absolute end-2 flex items-center gap-1.5 rtl:space-x-reverse">
            {/* Voice input button */}
            <VoiceSearchButton
              locale={language}
              isListening={isListening}
              onToggleVoice={onToggleVoice}
              onTranscript={onVoiceTranscript}
            />

            {/* Submit button */}
            <button
              type="submit"
              disabled={isAnalyzing}
              className="px-4 py-2 ms-1 me-1 rounded-xl bg-emerald-800 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              {isAnalyzing ? dict.seekingStatus : dict.searchButton}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};
