"use client";

import React from 'react';
import {
  BookOpen,
  Bookmark,
  Sun,
  Moon,
  Info,
  Type,
  Eye,
  Globe,
  SlidersHorizontal,
  Compass,
  ShieldCheck,
  FileCheck,
  Sparkles,
} from 'lucide-react';
import { Language, PerspectiveMode } from '../types';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  arabicScale: number;
  onScaleChange: (scale: number) => void;
  showTransliteration: boolean;
  onToggleTransliteration: () => void;
  isDark: boolean;
  onToggleDark: () => void;
  isHighContrast: boolean;
  onToggleHighContrast: () => void;
  bookmarkCount: number;
  onOpenBookmarks: () => void;
  onOpenDisclaimer: () => void;
  onOpenJourney?: () => void;
  onOpenLicenseRegistry?: () => void;
  onOpenEditorialConsole?: () => void;
  perspectiveMode?: PerspectiveMode;
  onTogglePerspective?: () => void;
  reflectionCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  arabicScale,
  onScaleChange,
  showTransliteration,
  onToggleTransliteration,
  isDark,
  onToggleDark,
  isHighContrast,
  onToggleHighContrast,
  bookmarkCount,
  onOpenBookmarks,
  onOpenDisclaimer,
  onOpenJourney,
  onOpenLicenseRegistry,
  onOpenEditorialConsole,
  perspectiveMode = 'devotional',
  onTogglePerspective,
  reflectionCount = 0,
}) => {
  const [showPreferencesMenu, setShowPreferencesMenu] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#FAF8F5]/90 dark:bg-[#071712]/90 border-b border-emerald-900/10 dark:border-emerald-800/30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-800 to-emerald-950 dark:from-emerald-700 dark:to-emerald-900 flex items-center justify-center text-amber-300 shadow-md shadow-emerald-900/10 border border-amber-400/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-emerald-950 dark:text-emerald-50 flex items-center gap-2">
                Hidaya
                <span className="font-arabic text-amber-600 dark:text-amber-400 text-lg font-normal">
                  هِدَايَة
                </span>
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40 dark:border-emerald-700/40">
                Demo Mode
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden xs:block">
              {language === 'ar'
                ? 'رفيق التدبر والهداية القرآنية للحياة'
                : language === 'sv'
                ? 'Quranisk vägledning och reflektionsföljeslagare'
                : language === 'fr'
                ? 'Compagnon de méditation et guidance coranique'
                : 'Quran Guidance & Reflection Companion'}
            </p>
          </div>
        </div>

        {/* Center: Disclaimer Pill */}
        <div className="hidden md:flex items-center">
          <button
            onClick={onOpenDisclaimer}
            className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-full bg-emerald-900/5 dark:bg-emerald-800/20 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-900/10 dark:hover:bg-emerald-800/30 border border-emerald-900/10 dark:border-emerald-700/30 transition-all cursor-pointer"
            title={
              language === 'ar'
                ? 'دليل للمصادر القرآنية • وليس خدمة فتاوى'
                : 'Read guidance scope & source ethics'
            }
          >
            <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>
              {language === 'ar'
                ? 'دليل إلى المصادر القرآنية • وليس خدمة فتاوى'
                : language === 'sv'
                ? 'Guide till Quraniska källor • Ej fatwa-tjänst'
                : language === 'fr'
                ? 'Guide vers les sources • Pas un service de fatwa'
                : 'Guide to Quranic sources • Not a fatwa service'}
            </span>
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Language Selector */}
          <div className="relative inline-flex items-center">
            <label htmlFor="language-select" className="sr-only">
              Select Translation Language
            </label>
            <Globe className="w-3.5 h-3.5 absolute left-2 text-slate-400 pointer-events-none" />
            <select
              id="language-select"
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              className="pl-7 pr-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-emerald-950/60 border border-slate-300 dark:border-emerald-800 text-slate-700 dark:text-slate-200 hover:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              aria-label="Translation Language"
            >
              <option value="en">English (Sahih)</option>
              <option value="sv">Svenska (Bernström)</option>
              <option value="fr">Français (Hamidullah)</option>
              <option value="ar">العربية (التفسير الميسر)</option>
            </select>
          </div>

          {/* Quick Arabic Scale Control (A- / A+) */}
          <div className="hidden lg:flex items-center bg-white dark:bg-emerald-950/60 border border-slate-300 dark:border-emerald-800 rounded-lg p-0.5">
            <button
              onClick={() => onScaleChange(Math.max(0.9, arabicScale - 0.1))}
              className="px-2 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-slate-100 dark:hover:bg-emerald-900/40 rounded transition-colors"
              title="Decrease Arabic script size"
              aria-label="Decrease Arabic script size"
            >
              A-
            </button>
            <span className="text-[10px] text-slate-400 px-1 font-mono">
              {Math.round(arabicScale * 100)}%
            </span>
            <button
              onClick={() => onScaleChange(Math.min(1.6, arabicScale + 0.1))}
              className="px-2 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-slate-100 dark:hover:bg-emerald-900/40 rounded transition-colors"
              title="Increase Arabic script size"
              aria-label="Increase Arabic script size"
            >
              A+
            </button>
          </div>

          {/* Transliteration toggle */}
          <button
            onClick={onToggleTransliteration}
            className={`hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              showTransliteration
                ? 'bg-emerald-800 text-white border-emerald-900 dark:bg-emerald-700'
                : 'bg-white dark:bg-emerald-950/60 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-emerald-800 hover:border-emerald-600'
            }`}
            title={language === 'ar' ? 'النسخ الصوتي اللاتيني' : 'Toggle phonetic transliteration'}
            aria-pressed={showTransliteration}
            aria-label="Toggle phonetic transliteration"
          >
            <Type className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'اللفظ اللاتيني' : 'Translit'}</span>
          </button>

          {/* My Journey (Contemplation Diary) Trigger */}
          {onOpenJourney && (
            <button
              onClick={onOpenJourney}
              className="relative flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-900/5 dark:bg-emerald-800/20 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-900/10 dark:hover:bg-emerald-800/30 border border-emerald-900/10 dark:border-emerald-700/30 transition-all cursor-pointer"
              title={
                language === 'ar'
                  ? 'سجل رحلتي وتدبراتي القرآنية'
                  : language === 'sv'
                  ? 'Min Resa (Quran-dagbok)'
                  : language === 'fr'
                  ? 'Mon Voyage (Journal spirituel)'
                  : 'My Journey (Contemplation Diary)'
              }
              aria-label="Open My Journey"
            >
              <Compass className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden md:inline">
                {language === 'ar' ? 'رحلتي' : language === 'sv' ? 'Min Resa' : language === 'fr' ? 'Mon Voyage' : 'My Journey'}
              </span>
              {reflectionCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-emerald-950 text-[10px] font-bold flex items-center justify-center">
                  {reflectionCount}
                </span>
              )}
            </button>
          )}

          {/* Perspective Mode Toggle (Devotional vs. Inquirer) */}
          {onTogglePerspective && (
            <button
              onClick={onTogglePerspective}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                perspectiveMode === 'inquirer'
                  ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-600/40 ring-1 ring-amber-500/30'
                  : 'bg-white dark:bg-emerald-950/60 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-emerald-800 hover:text-emerald-700'
              }`}
              title={
                perspectiveMode === 'inquirer'
                  ? 'Mode: Inquirer & Universal Ethical Lens (Active)'
                  : 'Switch to Inquirer / Non-Muslim Seeker Lens'
              }
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden lg:inline">
                {perspectiveMode === 'inquirer'
                  ? language === 'ar'
                    ? 'منظور الباحث'
                    : 'Inquirer Lens'
                  : language === 'ar'
                  ? 'منظور التدبر'
                  : 'Devotional Lens'}
              </span>
            </button>
          )}

          {/* Bookmarks Drawer Trigger */}
          <button
            onClick={onOpenBookmarks}
            className="relative p-2 rounded-lg bg-white dark:bg-emerald-950/60 border border-slate-300 dark:border-emerald-800 text-slate-700 dark:text-slate-200 hover:text-emerald-700 hover:border-emerald-600 transition-colors"
            title="Saved verses and reflections"
            aria-label={`Saved reflections (${bookmarkCount})`}
          >
            <Bookmark className="w-4 h-4" />
            {bookmarkCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-emerald-950 text-[10px] font-bold flex items-center justify-center">
                {bookmarkCount}
              </span>
            )}
          </button>

          {/* License & Theological Audit Registry Trigger */}
          {onOpenLicenseRegistry && (
            <button
              onClick={onOpenLicenseRegistry}
              className="p-2 rounded-lg bg-white dark:bg-emerald-950/60 border border-slate-300 dark:border-emerald-800 text-slate-700 dark:text-slate-200 hover:text-emerald-700 hover:border-emerald-600 transition-colors cursor-pointer"
              title={
                language === 'sv'
                  ? 'Innehållslicenser & källregister'
                  : language === 'fr'
                  ? 'Registre des licences et sources'
                  : 'Content Licenses & Sources Registry'
              }
              aria-label="Open Content License Registry"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            </button>
          )}

          {/* Editorial & Scholar Review Console Trigger */}
          {onOpenEditorialConsole && (
            <button
              onClick={onOpenEditorialConsole}
              className="p-2 rounded-lg bg-white dark:bg-emerald-950/60 border border-slate-300 dark:border-emerald-800 text-slate-700 dark:text-slate-200 hover:text-emerald-700 hover:border-emerald-600 transition-colors cursor-pointer"
              title={
                language === 'sv'
                  ? 'Redaktions- & forskargranskningskonsol'
                  : language === 'fr'
                  ? 'Console éditoriale et revue théologique'
                  : 'Scholar & Editorial Review Console'
              }
              aria-label="Open Scholar & Editorial Review Console"
            >
              <FileCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            </button>
          )}

          {/* Dark Mode toggle */}
          <button
            onClick={onToggleDark}
            className="p-2 rounded-lg bg-white dark:bg-emerald-950/60 border border-slate-300 dark:border-emerald-800 text-slate-700 dark:text-slate-200 hover:text-amber-500 hover:border-emerald-600 transition-colors"
            title={isDark ? 'Switch to warm day mode' : 'Switch to comfortable night mode'}
            aria-label={isDark ? 'Switch to warm day mode' : 'Switch to comfortable night mode'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Mobile Preferences Trigger */}
          <div className="lg:hidden relative">
            <button
              onClick={() => setShowPreferencesMenu(!showPreferencesMenu)}
              className="p-2 rounded-lg bg-white dark:bg-emerald-950/60 border border-slate-300 dark:border-emerald-800 text-slate-700 dark:text-slate-200"
              title="Display preferences"
              aria-label="Display preferences menu"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {showPreferencesMenu && (
              <div className="absolute right-0 mt-2 w-56 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-emerald-800 rounded-xl shadow-xl z-50 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Arabic Font Size</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onScaleChange(Math.max(0.9, arabicScale - 0.1))}
                      className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded"
                    >
                      -
                    </button>
                    <span className="font-mono">{Math.round(arabicScale * 100)}%</span>
                    <button
                      onClick={() => onScaleChange(Math.min(1.6, arabicScale + 0.1))}
                      className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Transliteration</span>
                  <button
                    onClick={onToggleTransliteration}
                    className={`px-2 py-0.5 rounded text-[11px] ${
                      showTransliteration ? 'bg-emerald-700 text-white' : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  >
                    {showTransliteration ? 'On' : 'Off'}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">High Contrast</span>
                  <button
                    onClick={onToggleHighContrast}
                    className={`px-2 py-0.5 rounded text-[11px] ${
                      isHighContrast ? 'bg-amber-600 text-white' : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  >
                    {isHighContrast ? 'On' : 'Off'}
                  </button>
                </div>

                <button
                  onClick={onOpenDisclaimer}
                  className="w-full text-left pt-2 border-t border-slate-200 dark:border-slate-800 text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Boundaries & Ethics</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
