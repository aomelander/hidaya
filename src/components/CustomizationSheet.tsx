"use client";

/**
 * @file src/components/CustomizationSheet.tsx
 * @description Preferences & Contemplation Depth view supporting dedicated inline tab rendering
 * (`inlinePage` mode with zero popups) and including an inline Offline Storage & PWA Install
 * section to manage cached Quranic passages, translations, and per-verse audio recitations.
 */

import React, { useEffect, useState } from 'react';
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
  Globe,
  Moon,
  Sun,
  Download,
  Trash2,
  WifiOff,
  Smartphone,
  Users,
  ChevronDown,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import {
  Language,
  ExplanationDepth,
  SessionDepth,
  LifeSphere,
  PerspectiveMode,
  ReaderProfile,
  EntryMode,
  PreferredScholar,
} from '../types';
import { SessionDepthSelector } from './SessionDepthSelector';
import { ExplanationDepthSelector } from './ExplanationDepthSelector';
import { SphereFilter } from './SphereFilter';
import { EntryModeTabs } from './EntryModeTabs';
import { OfflineCacheService } from '../services/offlineCacheService';
import { StorageService } from '../services/storage';
import { QURAN_FIXTURES } from '../data/quranFixtures';
import { useOfflineStatus } from '../hooks/useOfflineStatus';
import { ScholarIngestionModal } from './ScholarIngestionModal';

export interface CustomizationSheetProps {
  isOpen: boolean;
  onClose?: () => void;
  inlinePage?: boolean;
  language: Language;
  onLanguageChange?: (lang: Language) => void;
  // Theme state
  isDark?: boolean;
  onToggleDark?: () => void;
  // Reader Profile (Adult, Teen, Kids & Family)
  readerProfile?: ReaderProfile;
  onReaderProfileChange?: (profile: ReaderProfile) => void;
  // Entry Mode (In This Moment, Big Questions, Character & Growth)
  activeMode?: EntryMode;
  onEntryModeChange?: (mode: EntryMode) => void;
  // Preferred Classical Tafsir Scholar (Ibn Kathir, Al-Sa'di, Al-Muyassar)
  preferredScholar?: PreferredScholar;
  onPreferredScholarChange?: (scholar: PreferredScholar) => void;
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
  readingScale?: number;
  onReadingScaleChange?: (scale: number) => void;
  showTransliteration: boolean;
  onToggleTransliteration: () => void;
  isHighContrast: boolean;
  onToggleHighContrast: () => void;
  // Perspective Mode
  perspectiveMode: PerspectiveMode;
  onTogglePerspective: () => void;
}

const LANGUAGE_OPTIONS: { code: Language; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'sv', label: 'Swedish', native: 'Svenska' },
  { code: 'fr', label: 'French', native: 'Français' },
  { code: 'ar', label: 'Arabic', native: 'العربية' },
];

const UI_TEXT: Record<
  Language,
  {
    title: string;
    subtitle: string;
    languageTab: string;
    themeLabel: string;
    darkMode: string;
    lightMode: string;
    sessionTab: string;
    explanationTab: string;
    spheresTab: string;
    readingTab: string;
    offlineTab: string;
    offlineReadyDesc: string;
    cacheBookmarksAudioBtn: string;
    clearAudioCacheBtn: string;
    installAppBtn: string;
    iosInstallHint: string;
    done: string;
    reset: string;
    arabicSize: string;
    readingSize: string;
    translit: string;
    highContrast: string;
    perspective: string;
    devotional: string;
    inquirer: string;
  }
> = {
  en: {
    title: 'Preferences & Reading Comfort',
    subtitle: 'Customize language, theme, font sizing, and offline storage.',
    languageTab: 'Language & Appearance',
    themeLabel: 'Color Theme',
    darkMode: 'Dark Sanctuary',
    lightMode: 'Warm Parchment',
    sessionTab: 'Session Length',
    explanationTab: 'Explanation Depth',
    spheresTab: 'Life Spheres',
    readingTab: 'Reading & Typography',
    offlineTab: 'Offline Access & App Installation',
    offlineReadyDesc: 'All verified Quranic passages, translations (EN/SV/FR/AR), and Tafsir are cached for offline reading.',
    cacheBookmarksAudioBtn: 'Cache Bookmark Audio',
    clearAudioCacheBtn: 'Clear Audio Cache',
    installAppBtn: 'Install Hidaya App',
    iosInstallHint: 'On iPhone/iPad: tap Share in Safari and choose "Add to Home Screen".',
    done: 'Return to Guidance',
    reset: 'Reset Defaults',
    arabicSize: 'Arabic Text Scale',
    readingSize: 'Translation & Notes Text Scale',
    translit: 'Phonetic Transliteration',
    highContrast: 'High Contrast Mode',
    perspective: 'Perspective View',
    devotional: 'Devotional (Spiritual Reflection)',
    inquirer: 'Inquirer (Historical Context)',
  },
  sv: {
    title: 'Inställningar & Läskomfort',
    subtitle: 'Anpassa språk, tema, textstorlekar och offlinelagring.',
    languageTab: 'Språk & Utseende',
    themeLabel: 'Färgtema',
    darkMode: 'Mörkt läge',
    lightMode: 'Ljust läge',
    sessionTab: 'Sessionens längd',
    explanationTab: 'Förklaringsdjup',
    spheresTab: 'Livsområden',
    readingTab: 'Text & Tillgänglighet',
    offlineTab: 'Offlineåtkomst & Appinstallation',
    offlineReadyDesc: 'Alla verifierade Quran-passager, översättningar och Tafsir är sparade för läsning utan internet.',
    cacheBookmarksAudioBtn: 'Spara bokmärkt ljud',
    clearAudioCacheBtn: 'Rensa ljudcache',
    installAppBtn: 'Installera Hidaya-appen',
    iosInstallHint: 'På iPhone/iPad: tryck på Dela i Safari och välj "Lägg till på hemskärmen".',
    done: 'Tillbaka till vägledning',
    reset: 'Återställ',
    arabicSize: 'Arabisk textstorlek',
    readingSize: 'Textstorlek för översättning & anteckningar',
    translit: 'Fonetisk translitterering',
    highContrast: 'Hög kontrast',
    perspective: 'Perspektiv',
    devotional: 'Troende (Andlig reflektion)',
    inquirer: 'Nyfiken (Historiskt sammanhang)',
  },
  fr: {
    title: 'Préférences & Confort Visuel',
    subtitle: 'Ajustez la langue, le thème, la taille des polices et le mode hors-ligne.',
    languageTab: 'Langue & Apparence',
    themeLabel: 'Thème visuel',
    darkMode: 'Mode Sombre',
    lightMode: 'Mode Clair',
    sessionTab: 'Durée de la session',
    explanationTab: "Niveau d'explication",
    spheresTab: 'Sphères de vie',
    readingTab: 'Typographie & Accessibilité',
    offlineTab: 'Accès Hors-Ligne & Installation',
    offlineReadyDesc: 'Tous les passages coraniques vérifiés, traductions et Tafsir sont mis en cache pour une lecture sans connexion.',
    cacheBookmarksAudioBtn: 'Mettre en cache les audios favoris',
    clearAudioCacheBtn: 'Vider le cache audio',
    installAppBtn: "Installer l'application Hidaya",
    iosInstallHint: 'Sur iPhone/iPad : touchez Partager dans Safari puis "Sur l’écran d’accueil".',
    done: 'Retour à la guidance',
    reset: 'Réinitialiser',
    arabicSize: 'Taille du texte arabe',
    readingSize: 'Taille du texte des traductions & notes',
    translit: 'Translittération phonétique',
    highContrast: 'Contraste élevé',
    perspective: 'Perspective',
    devotional: 'Dévotionnel (Méditation)',
    inquirer: 'Curieux (Contexte historique)',
  },
  ar: {
    title: 'الإعدادات وراحة القراءة',
    subtitle: 'خصص اللغة، والمظهر، وأحجام الخطوط، والتخزين دون اتصال.',
    languageTab: 'اللغة والمظهر',
    themeLabel: 'نمط الإضاءة',
    darkMode: 'الوضع الليلي',
    lightMode: 'الوضع النهاري',
    sessionTab: 'مدة الجلسة',
    explanationTab: 'عمق التفسير',
    spheresTab: 'مجالات الحياة',
    readingTab: 'الخط والإتاحة',
    offlineTab: 'القراءة بدون إنترنت وتثبيت التطبيق',
    offlineReadyDesc: 'جميع المقاطع القرآنية الموثقة والتراجم والتفاسير محفوظة للقراءة بدون اتصال بالإنترنت.',
    cacheBookmarksAudioBtn: 'حفظ تلاوات المفضلة',
    clearAudioCacheBtn: 'مسح ذاكرة الصوت',
    installAppBtn: 'تثبيت تطبيق هداية',
    iosInstallHint: 'على iPhone/iPad: اضغط على مشاركة في Safari ثم اختر "إضافة إلى الشاشة الرئيسية".',
    done: 'العودة إلى التوجيه',
    reset: 'إعادة ضبط',
    arabicSize: 'حجم الرسم العثماني',
    readingSize: 'حجم خط الترجمة والخواطر',
    translit: 'اللفظ اللاتيني',
    highContrast: 'تباين عالٍ',
    perspective: 'طبيعة العرض',
    devotional: 'تدبري إيماني',
    inquirer: 'سياقي تاريخي معرفي',
  },
};

const PROFILE_LABELS: Record<
  Language,
  {
    sectionTitle: string;
    adult: string;
    adultSub: string;
    teen: string;
    teenSub: string;
    kids: string;
    kidsSub: string;
  }
> = {
  en: {
    sectionTitle: 'Reader Experience (Family Profiles)',
    adult: 'Standard',
    adultSub: 'Full Tafsir & reflection',
    teen: 'Teen (13–17)',
    teenSub: 'Key takeaway & glossary',
    kids: 'Kids & Family (8+)',
    kidsSub: 'Simple story & family question',
  },
  sv: {
    sectionTitle: 'Läsupplevelse (Familjeprofiler)',
    adult: 'Standard',
    adultSub: 'Full Tafsir & reflektion',
    teen: 'Ungdom (13–17)',
    teenSub: 'Kärnbudskap & ordlista',
    kids: 'Barn & Familj (8+)',
    kidsSub: 'Enkel berättelse & familjefråga',
  },
  fr: {
    sectionTitle: 'Profil de Lecture (Famille)',
    adult: 'Standard',
    adultSub: 'Tafsir complet & méditation',
    teen: 'Ados (13–17)',
    teenSub: 'Essentiel & repères clés',
    kids: 'Enfants & Famille (8+)',
    kidsSub: 'Histoire simple & question en famille',
  },
  ar: {
    sectionTitle: 'نمط القارئ (أفراد الأسرة)',
    adult: 'الوضع الكامل',
    adultSub: 'التفسير والتدبر المعمق',
    teen: 'الشباب (١٣–١٧)',
    teenSub: 'خلاصة ملهمة ودليل مفاهيم',
    kids: 'الناشئة والأسرة (٨+)',
    kidsSub: 'قصة مبسطة وسؤال عائلي',
  },
};

const SCHOLAR_LABELS: Record<
  Language,
  {
    sectionTitle: string;
    scholars: { id: PreferredScholar; label: string; sub: string }[];
    entryModeTitle: string;
  }
> = {
  en: {
    sectionTitle: 'Preferred Classical Tafsir Scholar',
    entryModeTitle: 'Contemplation Focus (Entry Mode)',
    scholars: [
      { id: 'Ibn Kathir', label: 'Ibn Kathir', sub: 'Classical Hadith & Tradition' },
      { id: "Al-Sa'di", label: "Al-Sa'di", sub: 'Heart & Spiritual Wisdom' },
      { id: 'Al-Muyassar', label: 'Al-Muyassar', sub: 'Concise & Direct Clarity' },
      { id: "Al-Sha'rawi", label: "Al-Sha'rawi", sub: 'Tafsir Al-Shaarawi (Quranpedia Book 18)' },
    ],
  },
  sv: {
    sectionTitle: 'Föredragen Klassisk & Expert Tafsir-lärd',
    entryModeTitle: 'Reflektionsfokus (Ingångsläge)',
    scholars: [
      { id: 'Ibn Kathir', label: 'Ibn Kathir', sub: 'Klassisk tradition & kontext' },
      { id: "Al-Sa'di", label: "Al-Sa'di", sub: 'Andlig visdom & hjärtats väg' },
      { id: 'Al-Muyassar', label: 'Al-Muyassar', sub: 'Kortfattad & tydlig innebörd' },
      { id: "Al-Sha'rawi", label: "Al-Sha'rawi", sub: 'Tafsir Al-Shaarawi (Quranpedia Bok 18)' },
    ],
  },
  fr: {
    sectionTitle: 'Exégète Classique & Expert (Tafsir) Préféré',
    entryModeTitle: 'Orientation de Méditation',
    scholars: [
      { id: 'Ibn Kathir', label: 'Ibn Kathir', sub: 'Tradition classique & contexte' },
      { id: "Al-Sa'di", label: "Al-Sa'di", sub: 'Sagesse spirituelle du cœur' },
      { id: 'Al-Muyassar', label: 'Al-Muyassar', sub: 'Clarté concise & directe' },
      { id: "Al-Sha'rawi", label: "Al-Sha'rawi", sub: 'Tafsir Al-Shaarawi (Quranpedia Livre 18)' },
    ],
  },
  ar: {
    sectionTitle: 'المفسر المفضل (أمهات التفاسير المعتمدة)',
    entryModeTitle: 'مسار التدبر الافتراضي',
    scholars: [
      { id: 'Ibn Kathir', label: 'ابن كثير', sub: 'تفسير القرآن العظيم بالمأثور' },
      { id: "Al-Sa'di", label: 'السعدي', sub: 'تيسير الكريم الرحمن والمقاصد' },
      { id: 'Al-Muyassar', label: 'التفسير الميسر', sub: 'عبارة وجيزة وواضحة' },
      { id: "Al-Sha'rawi", label: 'الشعراوي', sub: 'تفسير الشعراوي (الموسوعة القرآنية - كتاب ١٨)' },
    ],
  },
};

export const CustomizationSheet: React.FC<CustomizationSheetProps> = ({
  isOpen,
  onClose,
  inlinePage = false,
  language,
  onLanguageChange,
  isDark = false,
  onToggleDark,
  readerProfile = 'adult',
  onReaderProfileChange,
  activeMode = 'moment',
  onEntryModeChange,
  preferredScholar = 'Ibn Kathir',
  onPreferredScholarChange,
  sessionDepth,
  onSessionDepthChange,
  explanationDepth,
  onExplanationDepthChange,
  activeSphere,
  onSphereChange,
  arabicScale,
  onArabicScaleChange,
  readingScale = 1.0,
  onReadingScaleChange,
  showTransliteration,
  onToggleTransliteration,
  isHighContrast,
  onToggleHighContrast,
  perspectiveMode,
  onTogglePerspective,
}) => {
  const [isCachingBookmarksAudio, setIsCachingBookmarksAudio] = useState(false);
  const [isIngestionModalOpen, setIsIngestionModalOpen] = useState(false);
  const { isOnline, stats, refreshStats, isInstallable, isInstalled, isIOS, installPWA } =
    useOfflineStatus();

  const t = UI_TEXT[language] || UI_TEXT.en;
  const pLabels = PROFILE_LABELS[language] || PROFILE_LABELS.en;
  const sLabels = SCHOLAR_LABELS[language] || SCHOLAR_LABELS.en;

  useEffect(() => {
    if (inlinePage) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, inlinePage]);

  if (!isOpen) return null;

  const handleCacheBookmarksAudio = async () => {
    if (isCachingBookmarksAudio) return;
    setIsCachingBookmarksAudio(true);
    try {
      const bookmarkIds = StorageService.getBookmarks();
      const versesToCache = QURAN_FIXTURES.filter((v) => bookmarkIds.includes(v.id));
      await OfflineCacheService.cacheAudioForVerses(versesToCache);
      await refreshStats();
    } finally {
      setIsCachingBookmarksAudio(false);
    }
  };

  const handleClearAudioCache = async () => {
    await OfflineCacheService.clearAllAudioCache();
    await refreshStats();
  };

  const sheetBody = (
    <div
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className={
        inlinePage
          ? 'w-full max-w-2xl mx-auto rounded-3xl flex flex-col bg-white dark:bg-[#0A1E17] border border-emerald-900/10 dark:border-emerald-800/40 shadow-xs overflow-hidden'
          : 'w-full max-w-xl max-h-[85vh] rounded-t-2xl overflow-y-auto flex flex-col bg-[#FAF8F5] dark:bg-[#081813] border-t border-emerald-900/20 dark:border-emerald-700/40 shadow-2xl transition-transform animate-in slide-in-from-bottom duration-300'
      }
    >
      {!inlinePage && (
        <div className="pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
        </div>
      )}

      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-emerald-900/30 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-800/10 dark:bg-emerald-700/20 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h2
              id="customization-title"
              className="text-base sm:text-lg font-bold text-emerald-950 dark:text-emerald-50 leading-tight"
            >
              {t.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.subtitle}
            </p>
          </div>
        </div>

        {!inlinePage && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-emerald-900/10 dark:border-emerald-700/30 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 cursor-pointer"
            aria-label="Close preferences"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content Body */}
      <div className="px-6 py-6 space-y-6">
        {/* Section 0: Language & Theme */}
        {(onLanguageChange || onToggleDark) && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-amber-600" />
              {t.languageTab}
            </span>

            {onLanguageChange && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {LANGUAGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => onLanguageChange(opt.code)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      language === opt.code
                        ? 'bg-emerald-800 text-white border-emerald-700 shadow-2xs'
                        : 'bg-[#FAF8F5] dark:bg-emerald-950/30 border-emerald-900/10 dark:border-emerald-800/30 text-slate-700 dark:text-slate-300 hover:border-emerald-600'
                    }`}
                  >
                    <span>{opt.native}</span>
                    {language === opt.code && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                ))}
              </div>
            )}

            {onToggleDark && (
              <button
                type="button"
                onClick={onToggleDark}
                className="w-full p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-800/30 flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <span>{t.themeLabel}</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-800 dark:text-amber-400">
                  {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  <span>{isDark ? t.darkMode : t.lightMode}</span>
                </span>
              </button>
            )}
          </div>
        )}

        {/* Section 0.5: Reader Experience (Standard, Teen 13-17, Kids & Family 8+) */}
        {onReaderProfileChange && (
          <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-emerald-900/30">
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-600" />
              {pLabels.sectionTitle}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(
                [
                  { id: 'adult' as ReaderProfile, label: pLabels.adult, sub: pLabels.adultSub },
                  { id: 'teen' as ReaderProfile, label: pLabels.teen, sub: pLabels.teenSub },
                  { id: 'kids' as ReaderProfile, label: pLabels.kids, sub: pLabels.kidsSub },
                ] as const
              ).map((prof) => {
                const active = readerProfile === prof.id;
                return (
                  <button
                    key={prof.id}
                    type="button"
                    onClick={() => onReaderProfileChange(prof.id)}
                    className={`p-3 rounded-2xl border text-start transition-all cursor-pointer ${
                      active
                        ? 'bg-emerald-800 text-white border-emerald-700 shadow-2xs'
                        : 'bg-[#FAF8F5] dark:bg-emerald-950/30 border-emerald-900/10 dark:border-emerald-800/30 text-slate-700 dark:text-slate-200 hover:border-emerald-600'
                    }`}
                  >
                    <p className="text-xs font-bold">{prof.label}</p>
                    <p
                      className={`text-[11px] mt-0.5 ${
                        active ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {prof.sub}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 0.6: Contemplation Focus (In This Moment · Big Questions · Character & Growth) */}
        {onEntryModeChange && (
          <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-emerald-900/30">
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              {sLabels.entryModeTitle}
            </span>
            <EntryModeTabs
              activeMode={activeMode}
              onSelectMode={onEntryModeChange}
              language={language}
            />
          </div>
        )}

        {/* Section 0.7: Preferred Classical Tafsir Scholar (Ibn Kathir · Al-Sa'di · Al-Muyassar) - Space-saving Dropdown */}
        {onPreferredScholarChange && (
          <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-emerald-900/30">
            <label
              htmlFor="scholar-preference-select"
              className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                {sLabels.sectionTitle}
              </span>
              <span className="text-[11px] font-normal text-amber-700 dark:text-amber-400">
                {sLabels.scholars.find((s) => s.id === preferredScholar)?.sub || ''}
              </span>
            </label>
            <div className="relative">
              <select
                id="scholar-preference-select"
                value={preferredScholar}
                onChange={(e) => onPreferredScholarChange(e.target.value as PreferredScholar)}
                className="w-full min-h-[42px] ps-3.5 pe-10 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#FAF8F5] dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-100 hover:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-colors appearance-none cursor-pointer"
              >
                {sLabels.scholars.map((sch) => (
                  <option key={sch.id} value={sch.id}>
                    {sch.label} — {sch.sub}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3.5 text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        )}

        {/* Section: Typography & Visual Accessibility */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-emerald-900/30">
          <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-amber-600" />
            {t.readingTab}
          </span>

          {/* Arabic Script Scaling */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-800/30">
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {t.arabicSize}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                {Math.round(arabicScale * 100)}%
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onArabicScaleChange(Math.max(0.8, arabicScale - 0.1))}
                className="w-9 h-9 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-emerald-900/30 font-bold text-xs flex items-center justify-center cursor-pointer"
                aria-label="Decrease text scale"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => onArabicScaleChange(1.0)}
                className="px-2.5 h-9 rounded-xl border border-slate-200 dark:border-emerald-800 text-xs text-slate-500 flex items-center justify-center cursor-pointer"
                title="Reset scale"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onArabicScaleChange(Math.min(1.7, arabicScale + 0.1))}
                className="w-9 h-9 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-emerald-900/30 font-bold text-xs flex items-center justify-center cursor-pointer"
                aria-label="Increase text scale"
              >
                A+
              </button>
            </div>
          </div>

          {/* General Reading & Translation Text Scaling */}
          {onReadingScaleChange && (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-800/30">
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {t.readingSize}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                  {Math.round(readingScale * 100)}%
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onReadingScaleChange(Math.max(0.8, readingScale - 0.1))}
                  className="w-9 h-9 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-emerald-900/30 font-bold text-xs flex items-center justify-center cursor-pointer"
                  aria-label="Decrease translation scale"
                >
                  A-
                </button>
                <button
                  type="button"
                  onClick={() => onReadingScaleChange(1.0)}
                  className="px-2.5 h-9 rounded-xl border border-slate-200 dark:border-emerald-800 text-xs text-slate-500 flex items-center justify-center cursor-pointer"
                  title="Reset translation scale"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onReadingScaleChange(Math.min(1.7, readingScale + 0.1))}
                  className="w-9 h-9 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-emerald-900/30 font-bold text-xs flex items-center justify-center cursor-pointer"
                  aria-label="Increase translation scale"
                >
                  A+
                </button>
              </div>
            </div>
          )}

          {/* Toggles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onToggleTransliteration}
              className={`p-3.5 rounded-2xl border text-start flex items-center justify-between transition-all cursor-pointer ${
                showTransliteration
                  ? 'bg-emerald-900/10 dark:bg-emerald-800/30 border-emerald-600/50 text-emerald-950 dark:text-emerald-100'
                  : 'bg-[#FAF8F5] dark:bg-emerald-950/30 border-emerald-900/10 dark:border-emerald-800/30 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div>
                <p className="text-xs font-semibold">{t.translit}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {showTransliteration ? 'On' : 'Off'}
                </p>
              </div>
              {showTransliteration && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            </button>

            <button
              type="button"
              onClick={onToggleHighContrast}
              className={`p-3.5 rounded-2xl border text-start flex items-center justify-between transition-all cursor-pointer ${
                isHighContrast
                  ? 'bg-amber-500/15 dark:bg-amber-500/20 border-amber-600/50 text-amber-950 dark:text-amber-100'
                  : 'bg-[#FAF8F5] dark:bg-emerald-950/30 border-emerald-900/10 dark:border-emerald-800/30 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div>
                <p className="text-xs font-semibold">{t.highContrast}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {isHighContrast ? 'High' : 'Standard'}
                </p>
              </div>
              {isHighContrast && <Eye className="w-4 h-4 text-amber-600" />}
            </button>
          </div>

          {/* Perspective Mode Switcher */}
          <div className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-800/30 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {t.perspective}
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                {perspectiveMode === 'inquirer' ? t.inquirer : t.devotional}
              </p>
            </div>
            <button
              type="button"
              onClick={onTogglePerspective}
              className="py-2 px-3 text-xs font-semibold rounded-xl border border-emerald-900/15 dark:border-emerald-700/30 bg-white dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-200 cursor-pointer"
            >
              {perspectiveMode === 'inquirer' ? t.devotional : t.inquirer}
            </button>
          </div>
        </div>

        {/* Section 5: Offline Storage & PWA Installation */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-emerald-900/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
              {!isOnline ? (
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
              ) : (
                <Download className="w-3.5 h-3.5 text-amber-600" />
              )}
              {t.offlineTab}
            </span>
            <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium tabular-nums">
              {stats.cachedPassagesCount} Passages · {stats.cachedAudioCount} Audio
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-800/30 space-y-3">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.offlineReadyDesc}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCacheBookmarksAudio}
                disabled={isCachingBookmarksAudio}
                className="min-h-[38px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isCachingBookmarksAudio ? '...' : t.cacheBookmarksAudioBtn}</span>
              </button>

              {stats.cachedAudioCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearAudioCache}
                  className="min-h-[38px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-emerald-800/50 bg-white dark:bg-emerald-950/50 text-slate-600 dark:text-slate-300 hover:text-red-600 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.clearAudioCacheBtn}</span>
                </button>
              )}

              {!isInstalled && isInstallable && (
                <button
                  type="button"
                  onClick={installPWA}
                  className="min-h-[38px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>{t.installAppBtn}</span>
                </button>
              )}
            </div>

            {!isInstalled && isIOS && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                {t.iosInstallHint}
              </p>
            )}
          </div>
        </div>

        {/* Section 6: Scholar Lecture Ingestion & Theological Audit Console (Step 4) */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-emerald-900/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>
                {language === 'ar'
                  ? 'تدقيق واستيراد تفاسير العلماء (المرحلة ٤)'
                  : language === 'sv'
                  ? 'Lärdas föreläsningar & AI-granskning (Steg 4)'
                  : language === 'fr'
                  ? 'Ingestion des cours de savants & audit (Étape 4)'
                  : 'Scholar Lecture Ingestion & Audit (Step 4)'}
              </span>
            </span>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
              AGENTS.md Level 3
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-800/30 space-y-3">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {language === 'ar'
                ? 'استيراد ومزامنة تفسير الشيخ محمد متولي الشعراوي الموثق (الموسوعة القرآنية - كتاب رقم ١٨) مع حفظ النص العربي الأصلي كاملاً.'
                : language === 'sv'
                ? 'Synkronisera och granska Sheikh Muhammad Metwalli Al-Sha\'rawis autentiska Tafsir (Quranpedia Bok 18) med bevarad arabisk originaltext.'
                : language === 'fr'
                ? 'Synchronisez et vérifiez le Tafsir authentique de Cheikh Muhammad Metwalli Al-Sha\'rawi (Quranpedia Livre 18) avec texte arabe intégral préservé.'
                : 'Synchronize and audit Sheikh Muhammad Metwalli Al-Sha\'rawi\'s official Tafsir dataset (Quranpedia Book 18) with verbatim Arabic preservation.'}
            </p>

            <button
              type="button"
              onClick={() => setIsIngestionModalOpen(true)}
              className="min-h-[40px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {language === 'ar'
                  ? 'فتح لوحة استيراد وتدقيق تفاسير العلماء'
                  : language === 'sv'
                  ? 'Öppna inläsnings- och granskningspanelen'
                  : language === 'fr'
                  ? 'Ouvrir la console d\'ingestion et d\'audit'
                  : 'Open Scholar Ingestion & Audit Console'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="p-5 border-t border-slate-100 dark:border-emerald-900/30 flex items-center justify-between gap-3 shrink-0">
        <button
          type="button"
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

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-5 h-11 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{t.done}</span>
          </button>
        )}
      </div>
    </div>
  );

  if (inlinePage) {
    return (
      <>
        {sheetBody}
        <ScholarIngestionModal
          isOpen={isIngestionModalOpen}
          onClose={() => setIsIngestionModalOpen(false)}
          language={language}
        />
      </>
    );
  }

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="customization-title"
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose?.();
        }}
      >
        {sheetBody}
      </div>
      <ScholarIngestionModal
        isOpen={isIngestionModalOpen}
        onClose={() => setIsIngestionModalOpen(false)}
        language={language}
      />
    </>
  );
};
