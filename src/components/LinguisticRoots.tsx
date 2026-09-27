"use client";

import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Info,
  ExternalLink,
} from 'lucide-react';
import { LinguisticRoot, Language } from '../types';

interface LinguisticRootsProps {
  roots?: LinguisticRoot[];
  language: Language;
}

const UI_TEXT = {
  en: {
    title: "Deep Tadabbur • Arabic Linguistic Imagery",
    subtitle: "Discover the literal root imagery behind key Quranic vocabulary",
    rootLabel: "Root:",
    imageryLabel: "Literal Desert / Classical Imagery:",
    spiritualLabel: "Spiritual Application:",
    viewMore: "Explore Root Imagery",
    viewLess: "Hide Root Imagery",
  },
  sv: {
    title: "Djup Tadabbur • Arabiska Språkrötter & Bildspråk",
    subtitle: "Upptäck det konkreta bildspråket bakom Quranens nyckelbegrepp",
    rootLabel: "Rot:",
    imageryLabel: "Ursprungligt bildspråk:",
    spiritualLabel: "Andlig fördjupning:",
    viewMore: "Utforska språkrötter",
    viewLess: "Dölj språkrötter",
  },
  fr: {
    title: "Tadabbur Approfondi • Racines & Métaphores Arabes",
    subtitle: "Découvrez l'imagerie concrète derrière le vocabulaire coranique",
    rootLabel: "Racine :",
    imageryLabel: "Imagerie littérale d'origine :",
    spiritualLabel: "Portée spirituelle :",
    viewMore: "Explorer les racines linguistiques",
    viewLess: "Masquer les racines",
  },
};

export const LinguisticRoots: React.FC<LinguisticRootsProps> = ({
  roots,
  language,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  if (!roots || roots.length === 0) return null;

  const t = UI_TEXT[language] || UI_TEXT.en;

  return (
    <div className="rounded-2xl border border-emerald-900/15 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/20 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3 flex items-center justify-between text-left hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 transition-colors cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-900 dark:text-emerald-200">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>{t.title}</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-700/10 dark:bg-emerald-700/30 text-emerald-800 dark:text-emerald-300 font-bold">
            {roots.length} {roots.length === 1 ? 'Root' : 'Roots'}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
        )}
      </button>

      {isOpen && (
        <div className="p-5 border-t border-emerald-900/10 dark:border-emerald-800/30 space-y-4 animate-in fade-in duration-150">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            {t.subtitle}
          </p>

          <div className="grid grid-cols-1 gap-3">
            {roots.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white dark:bg-[#071913] border border-emerald-900/10 dark:border-emerald-700/40 shadow-xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-emerald-900/40 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-arabic text-xl text-amber-700 dark:text-amber-400 font-bold">
                      {item.termArabic}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-100">
                      ({item.termTransliterated})
                    </span>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-md font-mono text-xs font-bold bg-amber-500/10 text-amber-900 dark:text-amber-300 border border-amber-600/20">
                    {t.rootLabel} {item.root}
                  </span>
                </div>

                {/* Literal Imagery */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                    {t.imageryLabel}
                  </span>
                  <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                    {item.literalImagery[language] || item.literalImagery.en}
                  </p>
                </div>

                {/* Spiritual Application */}
                <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-emerald-900/20">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 block">
                    {t.spiritualLabel}
                  </span>
                  <p className="text-xs leading-relaxed text-slate-800 dark:text-slate-200 font-medium">
                    {item.spiritualDepth[language] || item.spiritualDepth.en}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
