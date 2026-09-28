"use client";

/**
 * @file QuickChoicePills.tsx
 * @description Curated clickable contemplation pills for quick entry into common human emotional states,
 * existential queries, and character cultivation themes.
 */

import React from 'react';
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
  Filter,
} from 'lucide-react';
import { EntryMode, QuickPill } from '../types';
import { QUICK_CHOICE_PILLS } from '../data/quranFixtures';

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
  onSelectPill: (pill: QuickPill) => void;
}

export const QuickChoicePills: React.FC<QuickChoicePillsProps> = ({
  activeMode,
  onSelectPill,
}) => {
  const currentPills = QUICK_CHOICE_PILLS.filter((p) => p.category === activeMode);

  return (
    <div className="mt-4 max-w-3xl mx-auto">
      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2">
        <Filter className="w-3.5 h-3.5" />
        <span>Suggested Contemplation Paths:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {currentPills.map((pill) => (
          <button
            key={pill.id}
            type="button"
            onClick={() => onSelectPill(pill)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-emerald-950/40 border border-slate-200 dark:border-emerald-800/40 text-slate-700 dark:text-slate-200 hover:border-emerald-600 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all cursor-pointer shadow-2xs"
          >
            <span className="text-amber-600 dark:text-amber-400">
              {getPillIcon(pill.iconName)}
            </span>
            <span>{pill.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
