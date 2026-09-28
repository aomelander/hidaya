"use client";

import React from 'react';
import { Clock, Zap, Compass, BookOpen } from 'lucide-react';
import { SessionDepth, Language } from '../types';

interface SessionDepthSelectorProps {
  currentDepth: SessionDepth;
  onSelectDepth: (depth: SessionDepth) => void;
  language: Language;
}

interface DepthOption {
  id: SessionDepth;
  minutes: number;
  label: { en: string; sv: string; fr: string };
  badge: { en: string; sv: string; fr: string };
  description: { en: string; sv: string; fr: string };
  versesEst: { en: string; sv: string; fr: string };
  icon: React.ReactNode;
}

const DEPTH_OPTIONS: DepthOption[] = [
  {
    id: '2min',
    minutes: 2,
    label: { en: 'A Moment', sv: 'Ett ögonblick', fr: 'Un instant' },
    badge: { en: '2 min', sv: '2 min', fr: '2 min' },
    description: {
      en: '1–2 verses + quick practical anchor',
      sv: '1–2 verser + snabb praktisk förankring',
      fr: '1–2 versets + ancrage pratique immédiat',
    },
    versesEst: { en: '1–2 verses', sv: '1–2 verser', fr: '1–2 versets' },
    icon: <Zap className="w-3.5 h-3.5" />,
  },
  {
    id: '10min',
    minutes: 10,
    label: { en: 'Reflect', sv: 'Begrunda', fr: 'Réfléchir' },
    badge: { en: '10 min', sv: '10 min', fr: '10 min' },
    description: {
      en: '2–3 verses + translation + reflection prompt',
      sv: '2–3 verser + översättning + reflektion',
      fr: '2–3 versets + traduction + méditation',
    },
    versesEst: { en: '2–3 verses', sv: '2–3 verser', fr: '2–3 versets' },
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  {
    id: '30min',
    minutes: 30,
    label: { en: 'Explore', sv: 'Utforska', fr: 'Explorer' },
    badge: { en: '30 min', sv: '30 min', fr: '30 min' },
    description: {
      en: '3–5 passages + context + tafsir & recitation',
      sv: '3–5 passager + sammanhang + tafsir & recitation',
      fr: '3–5 passages + contexte + tafsir & récitation',
    },
    versesEst: { en: '3–5 passages', sv: '3–5 passager', fr: '3–5 passages' },
    icon: <Compass className="w-3.5 h-3.5" />,
  },
  {
    id: '60min',
    minutes: 60,
    label: { en: 'Deep Study', sv: 'Djupstudie', fr: 'Étude profonde' },
    badge: { en: '60 min', sv: '60 min', fr: '60 min' },
    description: {
      en: 'Full passages + comparative tafsir + root words',
      sv: 'Fullständiga passager + jämförande tafsir + rotord',
      fr: 'Passages complets + tafsir comparatif + racines',
    },
    versesEst: { en: 'Full theme study', sv: 'Hel temastudie', fr: 'Étude thématique' },
    icon: <BookOpen className="w-3.5 h-3.5" />,
  },
];

export const SessionDepthSelector: React.FC<SessionDepthSelectorProps> = ({
  currentDepth,
  onSelectDepth,
  language,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>
            {language === 'sv'
              ? 'Välj din tidsram (Sessionens djup)'
              : language === 'fr'
              ? 'Choisissez votre durée de méditation'
              : 'Choose Your Depth (Session Duration)'}
          </span>
        </span>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          {DEPTH_OPTIONS.find((d) => d.id === currentDepth)?.versesEst[language]}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {DEPTH_OPTIONS.map((opt) => {
          const isSelected = currentDepth === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onSelectDepth(opt.id)}
              className={`flex flex-col text-left p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-900 text-white border-emerald-800 shadow-md ring-2 ring-emerald-600/30 dark:bg-emerald-800 dark:border-emerald-600'
                  : 'bg-white dark:bg-emerald-950/40 border-slate-200 dark:border-emerald-800/30 text-slate-700 dark:text-slate-200 hover:border-emerald-500 dark:hover:border-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-emerald-800 text-emerald-100 dark:bg-emerald-700'
                      : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                  }`}
                >
                  {opt.icon}
                  <span>{opt.badge[language]}</span>
                </span>
                <span
                  className={`text-[10px] ${
                    isSelected ? 'text-emerald-200' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {opt.versesEst[language]}
                </span>
              </div>

              <div
                className={`text-xs font-bold mt-1 ${
                  isSelected ? 'text-white' : 'text-slate-900 dark:text-slate-100'
                }`}
              >
                {opt.label[language]}
              </div>

              <p
                className={`text-[10px] leading-snug line-clamp-2 mt-0.5 ${
                  isSelected ? 'text-emerald-100/90' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {opt.description[language]}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
