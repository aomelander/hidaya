"use client";

import React from 'react';
import { Sparkles, History, Scroll, GraduationCap } from 'lucide-react';
import { ExplanationDepth, Language } from '../types';

interface ExplanationDepthSelectorProps {
  currentDepth: ExplanationDepth;
  onSelectDepth: (depth: ExplanationDepth) => void;
  language: Language;
}

interface DepthMode {
  id: ExplanationDepth;
  label: { en: string; sv: string; fr: string; ar: string };
  sublabel: { en: string; sv: string; fr: string; ar: string };
  icon: React.ReactNode;
}

const MODES: DepthMode[] = [
  {
    id: 'simple',
    label: { en: 'Simple', sv: 'Enkel', fr: 'Simple', ar: 'ميسر' },
    sublabel: {
      en: 'Plain language takeaway (Beginner & Youth friendly)',
      sv: 'Klar och enkel sammanfattning (Lättläst för unga & nyfikna)',
      fr: 'Essentiel en langage clair (Accessible à tous)',
      ar: 'المعنى الميسر والخلاصة العملية الواضحة',
    },
    icon: <Sparkles className="w-3.5 h-3.5" />,
  },
  {
    id: 'context',
    label: { en: 'Context', sv: 'Sammanhang', fr: 'Contexte', ar: 'السياق' },
    sublabel: {
      en: 'Historical setting & causes of revelation',
      sv: 'Historisk bakgrund och uppenbarelsens orsak',
      fr: 'Circonstances et contexte de révélation',
      ar: 'السياق التاريخي وأسباب النزول الأصيلة',
    },
    icon: <History className="w-3.5 h-3.5" />,
  },
  {
    id: 'tafsir',
    label: { en: 'Classical Tafsir', sv: 'Klassisk Tafsir', fr: 'Tafsir Classique', ar: 'تفسير مأثور' },
    sublabel: {
      en: 'Exegesis from Ibn Kathir & Al-Sa\'di',
      sv: 'Kommentarer från Ibn Kathir & Al-Sa\'di',
      fr: 'Commentaires d\'Ibn Kathir & Al-Sa\'di',
      ar: 'تفسير ابن كثير والسعدي والميسر',
    },
    icon: <Scroll className="w-3.5 h-3.5" />,
  },
  {
    id: 'study',
    label: { en: 'Comparative Study', sv: 'Jämförande studie', fr: 'Étude comparative', ar: 'دراسة مقارنة' },
    sublabel: {
      en: 'Cross-scholar analysis & linguistic roots',
      sv: 'Lärda jämförelser & språkliga rotord',
      fr: 'Analyse comparative & racines linguistiques',
      ar: 'دراسة دلالية وجذور لغوية مقارنة',
    },
    icon: <GraduationCap className="w-3.5 h-3.5" />,
  },
];

export const ExplanationDepthSelector: React.FC<ExplanationDepthSelectorProps> = ({
  currentDepth,
  onSelectDepth,
  language,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-stone-100 dark:bg-emerald-950/60 border border-stone-200 dark:border-emerald-800/40">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2 py-1 flex items-center gap-1">
        <span>{language === 'ar' ? 'مستوى الشرح والبيان:' : language === 'sv' ? 'Förklaringsnivå:' : language === 'fr' ? 'Niveau d\'explication:' : 'Explanation Level:'}</span>
      </span>

      <div className="flex flex-wrap sm:flex-nowrap gap-1 w-full sm:w-auto flex-1">
        {MODES.map((mode) => {
          const isSelected = currentDepth === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onSelectDepth(mode.id)}
              title={mode.sublabel[language]}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white dark:bg-emerald-800 text-emerald-900 dark:text-emerald-50 shadow-xs border border-emerald-900/10 dark:border-emerald-600 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-900 dark:hover:text-emerald-100 hover:bg-white/50 dark:hover:bg-emerald-900/30'
              }`}
            >
              <span className={isSelected ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-400'}>
                {mode.icon}
              </span>
              <span>{mode.label[language]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
