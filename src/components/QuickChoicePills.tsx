"use client";

/**
 * @file QuickChoicePills.tsx
 * @description Curated clickable contemplation options with compact mobile ergonomics,
 * progressive disclosure, and 100% locale synchronization (en, sv, fr, ar).
 */

import React, { useState } from 'react';
import {
  Flame,
  Feather,
  HeartCrack,
  Activity,
  SunDim,
  Compass,
  RefreshCw,
  Sparkles,
  HelpCircle,
  ShieldAlert,
  Scale,
  ShieldCheck,
  Footprints,
  MessageSquareOff,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { EntryMode, Language, QuickPill } from '../types';
import { QUICK_CHOICE_PILLS } from '../data/quranFixtures';
import { getDictionary } from '../lib/i18n/dictionaries';

/**
 * Helper function to lazily render an icon by fixture icon name.
 */
function getPillIcon(iconName: string): React.ReactNode {
  switch (iconName) {
    case 'Flame':
      return <Flame className="w-4 h-4" />;
    case 'Feather':
      return <Feather className="w-4 h-4" />;
    case 'HeartCrack':
      return <HeartCrack className="w-4 h-4" />;
    case 'Activity':
      return <Activity className="w-4 h-4" />;
    case 'SunDim':
      return <SunDim className="w-4 h-4" />;
    case 'Compass':
      return <Compass className="w-4 h-4" />;
    case 'RefreshCw':
      return <RefreshCw className="w-4 h-4" />;
    case 'Sparkles':
      return <Sparkles className="w-4 h-4" />;
    case 'HelpCircle':
      return <HelpCircle className="w-4 h-4" />;
    case 'ShieldAlert':
      return <ShieldAlert className="w-4 h-4" />;
    case 'Scale':
      return <Scale className="w-4 h-4" />;
    case 'ShieldCheck':
      return <ShieldCheck className="w-4 h-4" />;
    case 'Footprints':
      return <Footprints className="w-4 h-4" />;
    case 'MessageSquareOff':
      return <MessageSquareOff className="w-4 h-4" />;
    case 'Users':
      return <Users className="w-4 h-4" />;
    default:
      return <Sparkles className="w-4 h-4" />;
  }
}

interface QuickChoicePillsProps {
  activeMode: EntryMode;
  language?: Language;
  onSelectPill: (pill: QuickPill) => void;
}

export const QuickChoicePills: React.FC<QuickChoicePillsProps> = ({
  activeMode,
  language = 'en',
  onSelectPill,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const dict = getDictionary(language);
  const currentPills = QUICK_CHOICE_PILLS.filter((p) => p.category === activeMode);

  // Show first 4 pills by default on mobile, or all if expanded
  const displayedPills = isExpanded ? currentPills : currentPills.slice(0, 4);
  const hasMore = currentPills.length > 4;

  return (
    <div className="mt-3 max-w-3xl mx-auto">
      <div className="flex flex-wrap items-center gap-2 rtl:space-x-reverse">
        {displayedPills.map((pill) => {
          const localizedLabel =
            dict.quickPills?.[pill.id] ||
            (language === 'ar' && pill.labelArabic ? pill.labelArabic : pill.label);

          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => onSelectPill(pill)}
              className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-emerald-950/40 border border-slate-200 dark:border-emerald-800/40 text-slate-700 dark:text-slate-200 hover:border-emerald-600 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all cursor-pointer shadow-2xs active:scale-98"
            >
              <span className="text-amber-600 dark:text-amber-400 shrink-0">
                {getPillIcon(pill.iconName)}
              </span>
              <span className="truncate">{localizedLabel}</span>
            </button>
          );
        })}

        {hasMore && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-900/5 dark:hover:bg-emerald-800/20 border border-dashed border-emerald-800/20 transition-colors cursor-pointer"
            aria-expanded={isExpanded}
          >
            <span>
              {isExpanded
                ? dict.showLessPills
                : `+${currentPills.length - 4} ${dict.showMorePills}`}
            </span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
};
