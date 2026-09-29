"use client";

import React, { useEffect } from 'react';
import {
  X,
  SlidersHorizontal,
  Clock,
  BookOpen,
  Layers,
  Type,
  Eye,
  Check,
  RotateCcw,
} from 'lucide-react';
import {
  Language,
  ExplanationDepth,
  SessionDepth,
  LifeSphere,
  PerspectiveMode,
} from '../types';
import { SessionDepthSelector } from './SessionDepthSelector';
import { ExplanationDepthSelector } from './ExplanationDepthSelector';
import { SphereFilter } from './SphereFilter';

interface CustomizationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  // Session & Depth State
  sessionDepth: SessionDepth;
  onSessionDepthChange: (depth: SessionDepth) => void;
  explanationDepth: ExplanationDepth;
  onExplanationDepthChange: (depth: ExplanationDepth) => void;
  // Sphere filter
  activeSphere: LifeSphere;
  onSphereChange: (sphere: LifeSphere) => void;
  // Accessibility & Reading Preferences
  arabicScale: number;
  onArabicScaleChange: (scale: number) => void;
  showTransliteration: boolean;
  onToggleTransliteration: () => void;
  isHighContrast: boolean;
  onToggleHighContrast: () => void;
  // Perspective Mode
  perspectiveMode: PerspectiveMode;
  onTogglePerspective: () => void;
}

const UI_TEXT: Record<
  Language,
  {
    title: string;
    subtitle: string;
    sessionTab: string;
    explanationTab: string;
    spheresTab: string;
    readingTab: string;
    done: string;
    reset: string;
    arabicSize: string;
    translit: string;
    highContrast: string;
    perspective: string;
    devotional: string;
    inquirer: string;
  }
> = {
  en: {
    title: 'Preferences & Contemplation Depth',
    subtitle: 'Customize your session duration, exegesis level, and reading comfort.',
    sessionTab: 'Session Length',
    explanationTab: 'Explanation Depth',
    spheresTab: 'Life Spheres',
    readingTab: 'Reading & Typography',
    done: 'Apply & Return',
    reset: 'Reset Defaults',
    arabicSize: 'Arabic Text Scale',
    translit: 'Phonetic Transliteration',
    highContrast: 'High Contrast Mode',
    perspective: 'Perspective View',
    devotional: 'Devotional (Spiritual Reflection)',
    inquirer: 'Inquirer (Historical Context)',
  },
  sv: {
    title: 'Inställningar & Reflektionsdjup',
    subtitle: 'Anpassa din sessionstid, förklaringsnivå och läskomfort.',
    sessionTab: 'Sessionens längd',
    explanationTab: 'Förklaringsdjup',
    spheresTab: 'Livsområden',
    readingTab: 'Text & Tillgänglighet',
    done: 'Tillämpa och stäng',
    reset: 'Återställ',
    arabicSize: 'Arabisk textstorlek',
    translit: 'Fonetisk translitterering',
    highContrast: 'Hög kontrast',
    perspective: 'Perspektiv',
    devotional: 'Troende (Andlig reflektion)',
    inquirer: 'Nyfiken (Historiskt sammanhang)',
  },
  fr: {
    title: 'Préférences & Profondeur de Méditation',
    subtitle: 'Ajustez la durée de votre session, le niveau de tafsir et le confort visuel.',
    sessionTab: 'Durée de la session',
    explanationTab: "Niveau d'explication",
    spheresTab: 'Sphères de vie',
    readingTab: 'Typographie & Accessibilité',
    done: 'Appliquer et fermer',
    reset: 'Réinitialiser',
    arabicSize: 'Taille du texte arabe',
    translit: 'Translittération phonétique',
    highContrast: 'Contraste élevé',
    perspective: 'Perspective',
    devotional: 'Dévotionnel (Méditation)',
    inquirer: 'Curieux (Contexte historique)',
  },
  ar: {
    title: 'إعدادات الجلسة وعمق التدبر',
    subtitle: 'خصص مدة جلسة التدبر، ومستوى التفسير، وخصائص القراءة المريحة.',
    sessionTab: 'مدة الجلسة',
    explanationTab: 'عمق التفسير',
    spheresTab: 'مجالات الحياة',
    readingTab: 'الخط والإتاحة',
    done: 'تطبيق وإغلاق',
    reset: 'إعادة ضبط',
    arabicSize: 'حجم الرسم العثماني',
    translit: 'اللفظ اللاتيني',
    highContrast: 'تباين عالٍ',
    perspective: 'طبيعة العرض',
    devotional: 'تدبري إيماني',
    inquirer: 'سياقي تاريخي معرفي',
  },
};

export const CustomizationSheet: React.FC<CustomizationSheetProps> = ({
  isOpen,
  onClose,
  language,
  sessionDepth,
  onSessionDepthChange,
  explanationDepth,
  onExplanationDepthChange,
  activeSphere,
  onSphereChange,
  arabicScale,
  onArabicScaleChange,
  showTransliteration,
  onToggleTransliteration,
  isHighContrast,
  onToggleHighContrast,
  perspectiveMode,
  onTogglePerspective,
}) => {
  const t = UI_TEXT[language] || UI_TEXT.en;

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="customization-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-xl max-h-[90vh] flex flex-col bg-[#FAF8F5] dark:bg-[#081813] border-t sm:border border-emerald-900/20 dark:border-emerald-700/40 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden transition-transform animate-in slide-in-from-bottom duration-300"
      >
        {/* Mobile Grab Handle */}
        <div className="pt-3 pb-1 flex justify-center sm:hidden">
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
        </div>

        {/* Sheet Header */}
        <div className="px-5 py-3.5 border-b border-emerald-900/10 dark:border-emerald-800/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-800/10 dark:bg-emerald-700/20 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="customization-title"
                className="text-base font-bold text-emerald-950 dark:text-emerald-50 leading-tight"
              >
                {t.title}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {t.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-emerald-900/10 dark:border-emerald-700/30 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-emerald-900/5 dark:hover:bg-emerald-800/20 transition-colors cursor-pointer"
            aria-label="Close preferences"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Section 1: Session Duration */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                {t.sessionTab}
              </span>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                {sessionDepth} min
              </span>
            </div>
            <SessionDepthSelector
              currentDepth={sessionDepth}
              onSelectDepth={onSessionDepthChange}
              language={language}
            />
          </div>

          {/* Section 2: Explanation & Exegesis Depth */}
          <div className="space-y-2.5 pt-2 border-t border-emerald-900/10 dark:border-emerald-800/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                {t.explanationTab}
              </span>
              <span className="text-[11px] capitalize text-slate-500 dark:text-slate-400">
                {explanationDepth}
              </span>
            </div>
            <ExplanationDepthSelector
              currentDepth={explanationDepth}
              onSelectDepth={onExplanationDepthChange}
              language={language}
            />
          </div>

          {/* Section 3: Life Spheres Filter */}
          <div className="space-y-2.5 pt-2 border-t border-emerald-900/10 dark:border-emerald-800/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-600" />
                {t.spheresTab}
              </span>
            </div>
            <SphereFilter
              activeSphere={activeSphere}
              onSelectSphere={onSphereChange}
              language={language}
            />
          </div>

          {/* Section 4: Typography & Visual Accessibility */}
          <div className="space-y-3 pt-2 border-t border-emerald-900/10 dark:border-emerald-800/30">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-amber-600" />
              {t.readingTab}
            </span>

            {/* Arabic Script Scaling */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-800/30">
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {t.arabicSize}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  Scale: {Math.round(arabicScale * 100)}%
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onArabicScaleChange(Math.max(0.8, arabicScale - 0.1))}
                  className="w-9 h-9 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-emerald-900/30 font-bold text-xs hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer"
                  aria-label="Decrease text scale"
                >
                  A-
                </button>
                <button
                  onClick={() => onArabicScaleChange(1.0)}
                  className="px-2 h-9 rounded-xl border border-slate-200 dark:border-emerald-800 text-[11px] font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors flex items-center justify-center cursor-pointer"
                  title="Reset scale"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onArabicScaleChange(Math.min(1.7, arabicScale + 0.1))}
                  className="w-9 h-9 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-emerald-900/30 font-bold text-xs hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer"
                  aria-label="Increase text scale"
                >
                  A+
                </button>
              </div>
            </div>

            {/* Toggles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Transliteration Toggle */}
              <button
                onClick={onToggleTransliteration}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  showTransliteration
                    ? 'bg-emerald-900/10 dark:bg-emerald-800/30 border-emerald-600/50 text-emerald-950 dark:text-emerald-100'
                    : 'bg-white dark:bg-emerald-950/30 border-emerald-900/10 dark:border-emerald-800/30 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>
                  <p className="text-xs font-semibold">{t.translit}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {showTransliteration ? 'Active' : 'Off'}
                  </p>
                </div>
                {showTransliteration && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
              </button>

              {/* High Contrast Toggle */}
              <button
                onClick={onToggleHighContrast}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  isHighContrast
                    ? 'bg-amber-500/15 dark:bg-amber-500/20 border-amber-600/50 text-amber-950 dark:text-amber-100'
                    : 'bg-white dark:bg-emerald-950/30 border-emerald-900/10 dark:border-emerald-800/30 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>
                  <p className="text-xs font-semibold">{t.highContrast}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {isHighContrast ? 'Active' : 'Standard'}
                  </p>
                </div>
                {isHighContrast && <Eye className="w-4 h-4 text-amber-600" />}
              </button>
            </div>

            {/* Perspective Mode Switcher */}
            <div className="p-3 rounded-2xl bg-white dark:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-800/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {t.perspective}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  {perspectiveMode === 'inquirer' ? t.inquirer : t.devotional}
                </span>
              </div>
              <button
                onClick={onTogglePerspective}
                className="w-full py-2 px-3 text-xs font-semibold rounded-xl border border-emerald-900/15 dark:border-emerald-700/30 bg-emerald-900/5 dark:bg-emerald-800/20 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-900/10 transition-colors cursor-pointer text-center"
              >
                Switch to {perspectiveMode === 'inquirer' ? 'Devotional View' : 'Inquirer Perspective'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Fixed Action Button */}
        <div className="p-4 border-t border-emerald-900/10 dark:border-emerald-800/30 bg-white/60 dark:bg-emerald-950/60 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onArabicScaleChange(1.0);
              onExplanationDepthChange('context');
              onSessionDepthChange('10min');
              onSphereChange('all');
            }}
            className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            {t.reset}
          </button>

          <button
            onClick={onClose}
            className="flex-1 max-w-xs h-11 rounded-xl bg-emerald-800 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/10 transition-transform active:scale-98 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{t.done}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
