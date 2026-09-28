"use client";

/**
 * @file EntryModeTabs.tsx
 * @description Tab navigation for the 3 core guidance entry modes:
 * 1. In This Moment (immediate emotions/crisis)
 * 2. Big Questions (existential purpose/suffering)
 * 3. Character & Growth (moral cultivation/virtues)
 * Also includes the trigger for the "Unsure what you need" spiritual compass.
 */

import React from 'react';
import { Compass, ArrowRight } from 'lucide-react';
import { EntryMode, Language } from '../types';

interface EntryModeTabsProps {
  activeMode: EntryMode;
  onSelectMode: (mode: EntryMode) => void;
  onOpenUnsureModal: () => void;
  language: Language;
}

export const EntryModeTabs: React.FC<EntryModeTabsProps> = ({
  activeMode,
  onSelectMode,
  onOpenUnsureModal,
  language,
}) => {
  return (
    <section aria-label="Guidance Entry Modes" className="space-y-3">
      {/* 3 Entry Modes Navigation Tabs */}
      <div className="flex p-1.5 rounded-2xl bg-emerald-900/5 dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-800/30 max-w-2xl mx-auto shadow-xs">
        <button
          type="button"
          onClick={() => onSelectMode('moment')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer text-center ${
            activeMode === 'moment'
              ? 'bg-emerald-800 text-white dark:bg-emerald-700 shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-300'
          }`}
          aria-selected={activeMode === 'moment'}
          role="tab"
        >
          <span className="block font-bold">
            {language === 'sv' ? '1. I stunden' : language === 'fr' ? '1. En ce moment' : '1. In This Moment'}
          </span>
          <span
            className={`text-[10px] hidden sm:block ${
              activeMode === 'moment' ? 'text-emerald-100' : 'text-slate-400'
            }`}
          >
            {language === 'sv'
              ? 'Känslor & situationer'
              : language === 'fr'
              ? 'Émotions & situations'
              : 'Emotions & Situations'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSelectMode('questions')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer text-center ${
            activeMode === 'questions'
              ? 'bg-emerald-800 text-white dark:bg-emerald-700 shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-300'
          }`}
          aria-selected={activeMode === 'questions'}
          role="tab"
        >
          <span className="block font-bold">
            {language === 'sv' ? '2. Stora frågor' : language === 'fr' ? '2. Grandes questions' : '2. Big Questions'}
          </span>
          <span
            className={`text-[10px] hidden sm:block ${
              activeMode === 'questions' ? 'text-emerald-100' : 'text-slate-400'
            }`}
          >
            {language === 'sv'
              ? 'Syfte, rättvisa, död'
              : language === 'fr'
              ? 'Sens, justice, mort'
              : 'Purpose, Justice, Death'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSelectMode('growth')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer text-center ${
            activeMode === 'growth'
              ? 'bg-emerald-800 text-white dark:bg-emerald-700 shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-300'
          }`}
          aria-selected={activeMode === 'growth'}
          role="tab"
        >
          <span className="block font-bold">
            {language === 'sv' ? '3. Karaktär & växande' : language === 'fr' ? '3. Caractère & élévation' : '3. Character & Growth'}
          </span>
          <span
            className={`text-[10px] hidden sm:block ${
              activeMode === 'growth' ? 'text-emerald-100' : 'text-slate-400'
            }`}
          >
            {language === 'sv'
              ? 'Tålamod, ödmjukhet, gott tal'
              : language === 'fr'
              ? 'Patience, humilité, bonté'
              : 'Patience, Humility, Speech'}
          </span>
        </button>
      </div>

      {/* "I don't know what I need" helper button */}
      <div className="text-center">
        <button
          type="button"
          onClick={onOpenUnsureModal}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-600/30 transition-all cursor-pointer shadow-2xs"
        >
          <Compass className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>
            {language === 'sv'
              ? 'Osäker på vad du behöver? Låt Hidaya guida ditt hjärta'
              : language === 'fr'
              ? 'Vous ne savez pas par où commencer ? Laissez Hidaya vous guider'
              : 'Unsure where to start? Let Hidaya guide your heart'}
          </span>
          <ArrowRight className="w-3 h-3 text-amber-600 dark:text-amber-400" />
        </button>
      </div>
    </section>
  );
};
