"use client";

/**
 * @file QuickChoicePills.tsx
 * @description Compact, space-saving dropdown selector for curated contemplation topics
 * with 100% locale synchronization (en, sv, fr, ar).
 */

import React, { useState } from 'react';
import { Sparkles, ChevronDown } from 'lucide-react';
import { EntryMode, Language, QuickPill } from '../types';
import { QUICK_CHOICE_PILLS } from '../data/quranFixtures';
import { getDictionary } from '../lib/i18n/dictionaries';

interface QuickChoicePillsProps {
  activeMode: EntryMode;
  language?: Language;
  onSelectPill: (pill: QuickPill) => void;
}

const DROPDOWN_LABELS: Record<
  Language,
  {
    placeholder: string;
    momentGroup: string;
    questionsGroup: string;
    growthGroup: string;
  }
> = {
  en: {
    placeholder: 'Quick contemplation topics (select a situation or question)...',
    momentGroup: 'In This Moment',
    questionsGroup: 'Big Questions',
    growthGroup: 'Character & Growth',
  },
  sv: {
    placeholder: 'Snabbval för reflektion (välj en situation eller fråga)...',
    momentGroup: 'I stunden',
    questionsGroup: 'Stora frågor',
    growthGroup: 'Karaktär & växande',
  },
  fr: {
    placeholder: 'Thèmes rapides de méditation (choisir une situation ou question)...',
    momentGroup: 'En ce moment',
    questionsGroup: 'Grandes questions',
    growthGroup: 'Caractère & élévation',
  },
  ar: {
    placeholder: 'مواضيع تدبر سريعة (اختر موقفاً أو سؤالاً)...',
    momentGroup: 'في هذه اللحظة',
    questionsGroup: 'أسئلة كبرى',
    growthGroup: 'التزكية والخلق',
  },
};

export const QuickChoicePills: React.FC<QuickChoicePillsProps> = ({
  activeMode,
  language = 'en',
  onSelectPill,
}) => {
  const [selectedId, setSelectedId] = useState<string>('');
  const dict = getDictionary(language);
  const t = DROPDOWN_LABELS[language] || DROPDOWN_LABELS.en;

  const getLocalizedPillLabel = (pill: QuickPill) =>
    dict.quickPills?.[pill.id] ||
    (language === 'ar' && pill.labelArabic ? pill.labelArabic : pill.label);

  // Order groups so the user's preferred activeMode appears first in the dropdown
  const categoriesList: { mode: EntryMode; label: string }[] = [
    { mode: 'moment', label: t.momentGroup },
    { mode: 'questions', label: t.questionsGroup },
    { mode: 'growth', label: t.growthGroup },
  ];
  const orderedCategories = [...categoriesList].sort((a, b) =>
    a.mode === activeMode ? -1 : b.mode === activeMode ? 1 : 0
  );

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedId(id);
    const found = QUICK_CHOICE_PILLS.find((p) => p.id === id);
    if (found) {
      onSelectPill(found);
    }
  };

  return (
    <div className="max-w-3xl mx-auto" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Categorized Topic Selector */}
      <div className="relative flex items-center">
        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5 text-amber-600 dark:text-[#F4B900]">
          <Sparkles className="w-4 h-4" />
        </div>

        <select
          value={selectedId}
          onChange={handleChange}
          aria-label={t.placeholder}
          className="w-full min-h-[42px] ps-9 pe-9 py-2 rounded-xl text-xs sm:text-sm font-medium bg-[#FAF8F5] dark:bg-[#061B16]/80 border border-emerald-900/12 dark:border-emerald-800/40 text-slate-700 dark:text-[#F5F7F2] hover:border-[#006D53] focus:outline-none focus:ring-2 focus:ring-[#006D53] transition-colors appearance-none cursor-pointer truncate"
        >
          <option value="">{t.placeholder}</option>
          {QUICK_CHOICE_PILLS.map((pill) => (
            <option key={pill.id} value={pill.id}>
              {getLocalizedPillLabel(pill)}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3.5 text-slate-400 dark:text-[#9BAFA7]">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
