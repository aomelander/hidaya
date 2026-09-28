"use client";

/**
 * @file GuidanceSearchBar.tsx
 * @description Accessible search and voice input bar for Quranic contemplation inquiries.
 */

import React from 'react';
import { Search, Mic, MicOff } from 'lucide-react';
import { EntryMode, Language } from '../types';

interface GuidanceSearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isAnalyzing: boolean;
  isListening: boolean;
  onToggleVoice: () => void;
  activeMode: EntryMode;
  language: Language;
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
}) => {
  const getPlaceholder = () => {
    if (language === 'sv') {
      return activeMode === 'moment'
        ? "Vad känner du? (t.ex. 'Vrede på jobbet', 'Orolig inför beslut')..."
        : activeMode === 'questions'
        ? "Vilken fråga väger på ditt hjärta? (t.ex. 'Varför lider vi?')..."
        : "Vilken egenskap vill du stärka? (t.ex. 'Tålamod', 'Ödmjukhet')...";
    }
    if (language === 'fr') {
      return activeMode === 'moment'
        ? "Que ressentez-vous ? (ex. 'Colère au travail', 'Anxiété face au futur')..."
        : activeMode === 'questions'
        ? "Quelle question pèse sur votre cœur ? (ex. 'Sens de la souffrance')..."
        : "Quel trait de caractère cultivez-vous ? (ex. 'Patience', 'Humilité')...";
    }
    return activeMode === 'moment'
      ? "What are you feeling? (e.g., 'Anger at work', 'Anxious about decisions')..."
      : activeMode === 'questions'
      ? "What existential question weighs on your mind? (e.g., 'Purpose of suffering')..."
      : "What character trait are you cultivating? (e.g., 'Humility', 'Tongue control')...";
  };

  return (
    <section aria-label="Search and Voice Input">
      <form onSubmit={onSubmit} className="relative max-w-3xl mx-auto">
        <div className="relative flex items-center shadow-lg shadow-emerald-950/5 rounded-2xl overflow-hidden bg-white dark:bg-[#0A1E17] border-2 border-emerald-900/15 dark:border-emerald-800/40 focus-within:border-emerald-700 dark:focus-within:border-emerald-500 transition-all">
          <div className="pl-4 text-emerald-800 dark:text-emerald-400">
            <Search className="w-5 h-5" />
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={getPlaceholder()}
            className="w-full py-4 pl-3 pr-24 text-sm sm:text-base bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
            aria-label="Contemplation search query"
          />

          <div className="absolute right-2 flex items-center gap-1.5">
            {/* Voice input button */}
            <button
              type="button"
              onClick={onToggleVoice}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-900/10'
              }`}
              title={isListening ? 'Listening...' : 'Search by voice'}
              aria-label={isListening ? 'Listening...' : 'Search by voice'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isAnalyzing}
              className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {isAnalyzing
                ? language === 'sv'
                  ? 'Söker...'
                  : language === 'fr'
                  ? 'Recherche...'
                  : 'Seeking...'
                : language === 'sv'
                ? 'Sök'
                : language === 'fr'
                ? 'Chercher'
                : 'Seek'}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};
