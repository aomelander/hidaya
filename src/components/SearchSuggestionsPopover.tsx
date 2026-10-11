"use client";

/**
 * @file src/components/SearchSuggestionsPopover.tsx
 * @description X / Instagram style search suggestions popover.
 * Drops down smoothly beneath the top Header search bar on focus, presenting Today's Focus,
 * curated quick contemplation topics, and rapid search shortcuts.
 */

import React, { useEffect, useRef } from 'react';
import { Sparkles, Compass, ArrowRight, Flame, Heart, Shield, Users, Smile, HelpCircle } from 'lucide-react';
import { Language, QuickPill } from '../types';
import { getTodayNorthStar, getLocalizedText } from '../data/dailyNorthStar';
import { QUICK_CHOICE_PILLS } from '../data/quranFixtures';
import { AyahCartouche } from './AyahCartouche';

export interface SearchSuggestionsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onSelectQuery: (query: string) => void;
  onSelectPill?: (pill: QuickPill) => void;
  onSelectTodayFocus?: (passageId: string) => void;
}

const POPOVER_TEXT: Record<
  Language,
  {
    todayFocusBadge: string;
    todayFocusDesc: string;
    quickTopicsBadge: string;
    quickTopicsDesc: string;
    searchHint: string;
    viewVerseBtn: string;
  }
> = {
  fr: {
    todayFocusBadge: "🌟 Ancrage du Jour · Today's Focus",
    todayFocusDesc: "Le passage spirituel recommandé pour votre journée",
    quickTopicsBadge: "🏷️ Thèmes Rapides du Moment",
    quickTopicsDesc: "Choisissez un besoin ou une émotion pour dérouler les versets",
    searchHint: "💡 Vous pouvez aussi chercher directement par numéro (ex. 2:255, 94:5) ou mot-clé.",
    viewVerseBtn: "Découvrir ce verset",
  },
  en: {
    todayFocusBadge: "🌟 Today's Focus Anchor",
    todayFocusDesc: "Recommended spiritual passage for your day",
    quickTopicsBadge: "🏷️ Trending Contemplation Topics",
    quickTopicsDesc: "Select a life situation or emotion to begin scrolling verses",
    searchHint: "💡 You can also search directly by Ayah reference (e.g. 2:255, 94:5) or keyword.",
    viewVerseBtn: "Contemplate this Ayah",
  },
  sv: {
    todayFocusBadge: "🌟 Dagens fokus · Ledstjärna",
    todayFocusDesc: "Rekommenderad Quran-passage för din dag",
    quickTopicsBadge: "🏷️ Snabba ämnen för stunden",
    quickTopicsDesc: "Välj en livssituation eller känsla för att utforska verser",
    searchHint: "💡 Du kan också söka direkt via versnummer (t.ex. 2:255, 94:5) eller sökord.",
    viewVerseBtn: "Utforska denna vers",
  },
  ar: {
    todayFocusBadge: "🌟 إشراقة اليوم التدبرية (Today's Focus)",
    todayFocusDesc: "الآية الموصى بها لتكون بوصلة يومك ونور قلبك",
    quickTopicsBadge: "🏷️ مواضيع تدبر سريعة للموقف الحاضر",
    quickTopicsDesc: "اختر مشاعرك أو موقفك الحياتي لتنساب الآيات أمامك",
    searchHint: "💡 يمكنك أيضاً البحث برقم الآية مباشرة (مثل: 2:255 أو 94:5) أو بأي كلمة قرآنية.",
    viewVerseBtn: "تدبر هذه الآية الآن",
  },
};

// Curated high-relevance pills displayed in the popover
const CURATED_PILL_IDS = [
  'anxiety-overwhelm',
  'gratitude-praise',
  'suffering-tragedy',
  'guilt-repentance',
  'family-patience',
  'responding-to-hostility',
  'humility-daily-life',
  'purifying-speech',
];

export const SearchSuggestionsPopover: React.FC<SearchSuggestionsPopoverProps> = ({
  isOpen,
  onClose,
  language,
  onSelectQuery,
  onSelectPill,
  onSelectTodayFocus,
}) => {
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const t = POPOVER_TEXT[language] || POPOVER_TEXT.en;
  const todayStar = getTodayNorthStar();
  const localizedTodayTheme = getLocalizedText(todayStar.theme, language);
  const localizedTodayTrans =
    todayStar.translations[language]?.text || todayStar.translations.en.text;

  // Filter curated pills from data
  const curatedPills = QUICK_CHOICE_PILLS.filter((p) => CURATED_PILL_IDS.includes(p.id));

  // Close on Escape or click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className="absolute top-full start-0 end-0 mt-2 z-50 w-full max-w-3xl mx-auto rounded-3xl bg-[#FAF8F5]/98 dark:bg-[#061B16]/98 backdrop-blur-xl border border-emerald-900/15 dark:border-emerald-800/40 shadow-2xl p-4 sm:p-6 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200 no-print"
      role="dialog"
      aria-modal="false"
      aria-label="Search suggestions and Today's Focus"
    >
      {/* SECTION 1: TODAY'S FOCUS (X-style Trending Highlight) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold tracking-tight text-amber-700 dark:text-[#F4B900] uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.todayFocusBadge}</span>
          </span>
          <span className="text-[11px] text-slate-400 dark:text-[#9BAFA7] hidden sm:inline">
            {todayStar.surahNameTransliterated} {todayStar.id}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            if (onSelectTodayFocus) {
              onSelectTodayFocus(todayStar.id);
            } else {
              onSelectQuery(todayStar.id);
            }
            onClose();
          }}
          className="w-full text-start p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#0B3027] border border-amber-900/10 dark:border-amber-500/25 hover:border-[#006D53] dark:hover:border-[#F4B900] transition-all cursor-pointer group shadow-2xs hover:shadow-xs"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <AyahCartouche number={todayStar.verseNumber} size="sm" active />
                <h4 className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-[#F5F7F2] truncate group-hover:text-[#006D53] dark:group-hover:text-[#F4B900] transition-colors">
                  {todayStar.surahNameTransliterated} ({todayStar.id}) · {localizedTodayTheme}
                </h4>
              </div>
              <p
                className={`text-xs text-slate-600 dark:text-[#9BAFA7] line-clamp-2 leading-relaxed ${
                  language === 'ar' ? 'font-arabic text-sm' : 'font-serif italic'
                }`}
              >
                &ldquo;{localizedTodayTrans}&rdquo;
              </p>
            </div>

            <div className="shrink-0 p-2 rounded-xl bg-emerald-950/5 dark:bg-[#061B16] text-[#006D53] dark:text-[#F4B900] group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform">
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </div>
          </div>
        </button>
      </div>

      {/* SECTION 2: QUICK TOPICS & MOODS (Pills) */}
      <div className="space-y-2.5">
        <div>
          <span className="text-xs font-bold text-emerald-950 dark:text-[#F5F7F2]">
            {t.quickTopicsBadge}
          </span>
          <p className="text-[11px] text-slate-500 dark:text-[#9BAFA7]">
            {t.quickTopicsDesc}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {curatedPills.map((pill) => {
            const label =
              language === 'ar' && pill.labelArabic
                ? pill.labelArabic
                : pill.label;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => {
                  if (onSelectPill) {
                    onSelectPill(pill);
                  } else {
                    onSelectQuery(pill.query);
                  }
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-[#0B3027] border border-emerald-900/10 dark:border-emerald-800/40 text-slate-800 dark:text-[#F5F7F2] hover:bg-[#006D53] hover:text-white dark:hover:bg-[#006D53] dark:hover:text-white hover:border-[#006D53] transition-all cursor-pointer shadow-2xs"
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* FOOTER: SEARCH HINT */}
      <div className="pt-2 border-t border-emerald-900/10 dark:border-emerald-800/30 flex items-center justify-between text-[11px] text-slate-500 dark:text-[#9BAFA7]">
        <span>{t.searchHint}</span>
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-semibold text-emerald-900 dark:text-[#F4B900] hover:underline cursor-pointer"
        >
          Fermer ✕
        </button>
      </div>
    </div>
  );
};
