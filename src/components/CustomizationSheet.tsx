"use client";

/**
 * @file src/components/CustomizationSheet.tsx
 * @description Accessible & Intuitive Preferences Hub tailored for all ages (kids, seniors, daily readers):
 * - Primary Essentials (Large visual cards, direct font size buttons with live Ayah preview, theme & language)
 * - Tactile, generous hitboxes (>= 48px) with visual cues
 * - Collapsible "Advanced Settings" section keeping technical parameters tidy and accessible
 */

import React, { useEffect, useState } from 'react';
import {
  SlidersHorizontal,
  BookOpen,
  Type,
  Check,
  RotateCcw,
  Globe,
  Moon,
  Sun,
  Download,
  Trash2,
  Smartphone,
  Users,
  Sparkles,
  Tv,
  Maximize2,
  Minimize2,
  Headphones,
  Repeat,
  Play,
  Layers,
  MessageCircle,
  Film,
  ShieldCheck,
  Heart,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
  Eye,
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
  VerseCardPreferences,
  ReciterId,
} from '../types';
import { OfflineCacheService } from '../services/offlineCacheService';
import { StorageService } from '../services/storage';
import { QURAN_FIXTURES } from '../data/quranFixtures';
import { AVAILABLE_RECITERS } from '../services/audioReciters';
import { APP_CONFIG } from '../config/appConfig';

export interface CustomizationSheetProps {
  isOpen: boolean;
  onClose?: () => void;
  inlinePage?: boolean;
  language: Language;
  onLanguageChange?: (lang: Language) => void;
  isDark?: boolean;
  onToggleDark?: () => void;
  readerProfile?: ReaderProfile;
  onReaderProfileChange?: (profile: ReaderProfile) => void;
  activeMode?: EntryMode;
  onEntryModeChange?: (mode: EntryMode) => void;
  preferredScholar?: PreferredScholar;
  onPreferredScholarChange?: (scholar: PreferredScholar) => void;
  sessionDepth: SessionDepth;
  onSessionDepthChange: (depth: SessionDepth) => void;
  explanationDepth: ExplanationDepth;
  onExplanationDepthChange: (depth: ExplanationDepth) => void;
  activeSphere: LifeSphere;
  onSphereChange: (sphere: LifeSphere) => void;
  arabicScale: number;
  onArabicScaleChange: (scale: number) => void;
  readingScale?: number;
  onReadingScaleChange?: (scale: number) => void;
  showTransliteration: boolean;
  onToggleTransliteration: () => void;
  isHighContrast: boolean;
  onToggleHighContrast: () => void;
  perspectiveMode: PerspectiveMode;
  onTogglePerspective: () => void;
  showReadPage?: boolean;
  onToggleShowReadPage?: () => void;
  showNorthStarPage?: boolean;
  onToggleShowNorthStarPage?: () => void;
  cardPreferences?: VerseCardPreferences;
  onCardPreferencesChange?: (updates: Partial<VerseCardPreferences>) => void;
  onToggleFullscreenTv?: () => void;
  isFullscreenActive?: boolean;
}

const LANGUAGE_OPTIONS: { code: Language; label: string; native: string; flag: string }[] = [
  { code: 'ar', label: 'Arabic', native: 'العربية', flag: '📖' },
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'sv', label: 'Swedish', native: 'Svenska', flag: '🇸🇪' },
];

const SCHOLARS: { id: PreferredScholar; label: string; sub: Record<Language, string> }[] = [
  {
    id: 'Ibn Kathir',
    label: 'Ibn Kathir',
    sub: {
      fr: 'Exégèse classique traditionnelle (XIVe s.)',
      en: 'Classical narrative & Hadith exegesis (14th c.)',
      sv: 'Klassisk traditionell tafsir (1300-talet)',
      ar: 'تفسير القرآن العظيم — ابن كثير',
    },
  },
  {
    id: "Al-Sa'di",
    label: "Al-Sa'di",
    sub: {
      fr: 'Clarté spirituelle et morale pratique',
      en: 'Accessible spiritual & ethical takeaways',
      sv: 'Tydlig andlig och praktisk vägledning',
      ar: 'تيسير الكريم الرحمن — السعدي',
    },
  },
  {
    id: 'Al-Muyassar',
    label: 'Al-Muyassar',
    sub: {
      fr: 'Sens direct et concis des versets',
      en: 'Concise, direct meaning of the verses',
      sv: 'Kortfattad och direkt versbetydelse',
      ar: 'التفسير الميسر — مجمع الملك فهد',
    },
  },
];

const ARABIC_SIZE_PRESETS = [
  { label: 'Normal', scale: 1.0, sub: '100%' },
  { label: 'Confort', scale: 1.25, sub: '125%' },
  { label: 'Grand', scale: 1.45, sub: '145%' },
  { label: 'Maxi', scale: 1.65, sub: '165%' },
];

const READING_SIZE_PRESETS = [
  { label: 'Normal', scale: 1.0, sub: '100%' },
  { label: 'Grand', scale: 1.2, sub: '120%' },
  { label: 'Maxi', scale: 1.4, sub: '140%' },
];

export const CustomizationSheet: React.FC<CustomizationSheetProps> = ({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  isDark = true,
  onToggleDark,
  readerProfile = 'adult',
  onReaderProfileChange,
  preferredScholar = 'Ibn Kathir',
  onPreferredScholarChange,
  arabicScale,
  onArabicScaleChange,
  readingScale = 1.0,
  onReadingScaleChange,
  showTransliteration,
  onToggleTransliteration,
  isHighContrast,
  onToggleHighContrast,
  cardPreferences,
  onCardPreferencesChange,
  onToggleFullscreenTv,
  isFullscreenActive = false,
}) => {
  const [reciterId, setReciterId] = useState<ReciterId>(() => StorageService.getPreferredReciter());
  const [isCachingBookmarks, setIsCachingBookmarks] = useState(false);
  const [cachedSuccess, setCachedSuccess] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const prefs: VerseCardPreferences = {
    ...StorageService.getCardPreferences(),
    ...(cardPreferences || {}),
    showTransliteration,
  };

  useEffect(() => {
    setReciterId(StorageService.getPreferredReciter());
  }, [isOpen]);

  if (!isOpen) return null;

  const updatePref = (updates: Partial<VerseCardPreferences>) => {
    StorageService.setCardPreferences(updates);
    window.dispatchEvent(new CustomEvent('hidaya-preferences-updated', { detail: updates }));
    if (updates.showTransliteration !== undefined && updates.showTransliteration !== showTransliteration) {
      onToggleTransliteration();
    }
    onCardPreferencesChange?.(updates);
  };

  const handleReciterSelect = (id: ReciterId) => {
    setReciterId(id);
    StorageService.setPreferredReciter(id);
  };

  const handleCacheBookmarkedAudio = async () => {
    setIsCachingBookmarks(true);
    try {
      const bmIds = StorageService.getBookmarks();
      const bmVerses = QURAN_FIXTURES.filter((v) => bmIds.includes(v.id));
      await OfflineCacheService.cachePassages(bmVerses);
      for (const v of bmVerses) {
        if (v.audioUrl) {
          await OfflineCacheService.toggleVerseAudioCache(v.audioUrl);
        }
      }
      setCachedSuccess(true);
      setTimeout(() => setCachedSuccess(false), 2500);
    } finally {
      setIsCachingBookmarks(false);
    }
  };

  const handleResetDefaults = () => {
    onArabicScaleChange(APP_CONFIG.DEFAULTS.ARABIC_SCALE);
    onReadingScaleChange?.(APP_CONFIG.DEFAULTS.READING_SCALE);
    onReaderProfileChange?.('adult');
    onPreferredScholarChange?.(APP_CONFIG.DEFAULTS.PREFERRED_SCHOLAR);
    handleReciterSelect(APP_CONFIG.DEFAULTS.PREFERRED_RECITER);
    updatePref(APP_CONFIG.DEFAULTS.CARD_PREFS);
    if (!isDark && onToggleDark) {
      onToggleDark();
    }
  };

  // Step adjustment helpers
  const handleStepArabicScale = (delta: number) => {
    const next = Math.min(1.7, Math.max(0.9, Number((arabicScale + delta).toFixed(2))));
    onArabicScaleChange(next);
  };

  const handleStepReadingScale = (delta: number) => {
    const current = readingScale || 1.0;
    const next = Math.min(1.5, Math.max(0.85, Number((current + delta).toFixed(2))));
    onReadingScaleChange?.(next);
  };

  const labels = {
    fr: {
      pageTitle: 'Mes Préférences de Lecture',
      pageSub: 'Adaptez l’affichage et l’écoute à votre confort en quelques touches simples.',
      backBtn: 'Lire le Coran',
      resetBtn: 'Par défaut',
      themeTitle: 'Ambiance Visuelle',
      darkModeTitle: 'Sanctuaire Sombre',
      darkModeSub: 'Reposant pour les yeux (Recommandé)',
      lightModeTitle: 'Parchemin Clair',
      lightModeSub: 'Lumineux et chaleureux',
      highContrastTitle: 'Contraste renforcé pour la vision',
      highContrastSub: 'Contours nets et visibilité maximale',
      textSizeTitle: 'Taille du Texte & Calligraphie',
      arabicTextSize: 'Texte Arabe (Coran)',
      readingTextSize: 'Traduction & Explications',
      previewTitle: 'Aperçu en direct',
      previewArabic: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
      previewTranslation: 'Au nom d’Allah, le Tout Miséricordieux, le Très Miséricordieux.',
      langTitle: 'Langue de Traduction',
      reciterTitle: 'Voix de Récitation',
      reciterSub: 'Choisissez la voix qui vous touche le plus',
      helpersTitle: 'Aides à l’Apprentissage',
      translitTitle: 'Translittération phonétique',
      translitSub: 'Lire la prononciation en lettres latines (idéal pour débuter)',
      tajweedTitle: 'Couleurs de récitation (Tajweed)',
      tajweedSub: 'Colore les règles de prononciation pour apprendre à réciter',
      advancedTitle: 'Paramètres Avancés & Audio',
      advancedSub: 'Vitesse de lecture, grand écran TV, options de mémorisation et cache hors-ligne',
      tvTitle: 'Mode Plein Écran / Télévision (LG TV, PC)',
      tvDesc: 'Agrandit la calligraphie pour une lecture à distance.',
      tvBtnActive: 'Quitter le Plein Écran TV',
      tvBtnInactive: 'Activer le Plein Écran TV',
      autoSwipeTitle: 'Lecture automatique au glissement (Swipe)',
      autoSwipeDesc: 'La récitation commence dès que vous passez au verset suivant.',
      audioSpeedLabel: 'Vitesse de récitation',
      loopVerseOpt: 'Répéter le verset en boucle',
      nextVerseOpt: 'Passer au verset suivant',
      scholarLabel: 'Exégète (Tafsir) classique',
      cacheTitle: 'Mode Hors-Ligne',
      cacheBookmarksBtn: 'Mettre en cache les versets aimés (♥)',
      cachedDone: 'Enregistré hors-ligne !',
      clearCacheBtn: 'Vider le cache',
      wordByWordTitle: 'Mode Mot-à-Mot (Coran Duo)',
      memorizationTitle: 'Mode Mémorisation interactive (Hifz)',
      thumbRailTitle: 'Boutons rapides sous le pouce',
    },
    en: {
      pageTitle: 'Reading Preferences',
      pageSub: 'Customize your text and recitation easily with simple, comfortable controls.',
      backBtn: 'Read Quran',
      resetBtn: 'Reset',
      themeTitle: 'Visual Theme',
      darkModeTitle: 'Dark Sanctuary',
      darkModeSub: 'Gentle on the eyes (Recommended)',
      lightModeTitle: 'Warm Parchment',
      lightModeSub: 'Bright & warm reading mode',
      highContrastTitle: 'High Contrast Mode',
      highContrastSub: 'Sharper borders and maximum clarity',
      textSizeTitle: 'Text Size & Typography',
      arabicTextSize: 'Arabic Quran Text',
      readingTextSize: 'Translation & Insights',
      previewTitle: 'Live Preview',
      previewArabic: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
      previewTranslation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
      langTitle: 'Translation Language',
      reciterTitle: 'Recitation Voice',
      reciterSub: 'Select the reciter that brings you peace',
      helpersTitle: 'Learning Helpers',
      translitTitle: 'Phonetic Transliteration',
      translitSub: 'Shows pronunciation in Latin script (great for beginners)',
      tajweedTitle: 'Tajweed Recitation Colors',
      tajweedSub: 'Highlights pronunciation rules on Arabic letters',
      advancedTitle: 'Advanced Settings & Audio',
      advancedSub: 'Playback speed, large-screen TV mode, memorization tools, and offline cache',
      tvTitle: 'TV Screen / Fullscreen Mode (LG TV, PC)',
      tvDesc: 'Enlarges typography for viewing across the room.',
      tvBtnActive: 'Exit TV Fullscreen',
      tvBtnInactive: 'Launch TV Fullscreen',
      autoSwipeTitle: 'Auto-Play on Swipe',
      autoSwipeDesc: 'Starts reciting as soon as you swipe to a new verse.',
      audioSpeedLabel: 'Recitation speed',
      loopVerseOpt: 'Loop current verse',
      nextVerseOpt: 'Advance to next verse',
      scholarLabel: 'Preferred Tafsir scholar',
      cacheTitle: 'Offline Reading',
      cacheBookmarksBtn: 'Download liked verses for offline listening (♥)',
      cachedDone: 'Saved offline!',
      clearCacheBtn: 'Clear cache',
      wordByWordTitle: 'Word-by-Word Mode (Quran Duo)',
      memorizationTitle: 'Interactive Memorization Mode (Hifz)',
      thumbRailTitle: 'Thumb quick-action rail',
    },
    sv: {
      pageTitle: 'Mina Läsningsinställningar',
      pageSub: 'Anpassa textstorlek och recitation enkelt med tydliga knappar.',
      backBtn: 'Läs Koranen',
      resetBtn: 'Återställ',
      themeTitle: 'Färgtema',
      darkModeTitle: 'Mörk Helgedom',
      darkModeSub: 'Skonsamt för ögonen (Rekommenderas)',
      lightModeTitle: 'Ljust Pergament',
      lightModeSub: 'Ljust och behagligt',
      highContrastTitle: 'Hög kontrast',
      highContrastSub: 'Tydligare konturer och text',
      textSizeTitle: 'Textstorlek',
      arabicTextSize: 'Arabisk Korantext',
      readingTextSize: 'Översättning & Förklaring',
      previewTitle: 'Direkt förhandsgranskning',
      previewArabic: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
      previewTranslation: 'I Guds, den Nåderikes, den Barmhärtiges namn.',
      langTitle: 'Översättningsspråk',
      reciterTitle: 'Recitatör',
      reciterSub: 'Välj rösten du föredrar',
      helpersTitle: 'Läshjälpmedel',
      translitTitle: 'Fonetisk translitterering',
      translitSub: 'Uttal i latinska bokstäver (utmärkt för nybörjare)',
      tajweedTitle: 'Tajweed-färger',
      tajweedSub: 'Färgmarkerar uttalsregler på arabiska bokstäver',
      advancedTitle: 'Avancerade Inställningar & Ljud',
      advancedSub: 'Uppspelningshastighet, TV-läge, memorering och offlinelagring',
      tvTitle: 'TV-läge / Helskärm',
      tvDesc: 'Förstorar texten för bekväm läsning på avstånd.',
      tvBtnActive: 'Avsluta TV-helskärm',
      tvBtnInactive: 'Aktivera TV-helskärm',
      autoSwipeTitle: 'Spela automatiskt vid svep',
      autoSwipeDesc: 'Startar recitation direkt vid svep till nästa vers.',
      audioSpeedLabel: 'Uppspelningshastighet',
      loopVerseOpt: 'Upprepa versen',
      nextVerseOpt: 'Nästa vers',
      scholarLabel: 'Tafsir-lärd',
      cacheTitle: 'Offlinelagring',
      cacheBookmarksBtn: 'Spara gillade verser offline (♥)',
      cachedDone: 'Sparat offline!',
      clearCacheBtn: 'Rensa cache',
      wordByWordTitle: 'Ord-för-Ord-läge',
      memorizationTitle: 'Interaktivt memoreringsläge',
      thumbRailTitle: 'Snabba tumknappar',
    },
    ar: {
      pageTitle: 'إعدادات القراءة والتلاوة',
      pageSub: 'اضبط حجم الخط والصوت بسهولة عبر أزرار واضحة ومريحة لجميع الأعمار.',
      backBtn: 'متابعة القراءة',
      resetBtn: 'الوضع الافتراضي',
      themeTitle: 'المظهر البصري',
      darkModeTitle: 'الوضع الليلي (الافتراضي)',
      darkModeSub: 'مريح للعينين أثناء القراءة المطولة',
      lightModeTitle: 'الوضع النهاري',
      lightModeSub: 'ألوان دافئة ومشرقة',
      highContrastTitle: 'تباين عالٍ ووضوح معزز',
      highContrastSub: 'حدود بارزة ومقروئية فائقة',
      textSizeTitle: 'حجم الخط والقراءة',
      arabicTextSize: 'خط المصحف الشريف (الرسم العثماني)',
      readingTextSize: 'التفسير والترجمة',
      previewTitle: 'معاينة فورية للخط',
      previewArabic: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
      previewTranslation: 'سورة الفاتحة — الآية الأولى',
      langTitle: 'لغة التراجم والمعاني',
      reciterTitle: 'صوت القارئ المفضل',
      reciterSub: 'اختر التلاوة الخاشعة التي تناسبك',
      helpersTitle: 'أدوات مساعدة للتعلّم',
      translitTitle: 'اللفظ اللاتيني (Transliteration)',
      translitSub: 'يساعد المبتدئين والأطفال على نطق الآيات بدقة',
      tajweedTitle: 'ألوان أحكام التجويد',
      tajweedSub: 'تمييز لطيف لأحكام الغنّة والإخفاء والقلقلة والمدود',
      advancedTitle: 'الإعدادات المتقدمة والتقنية',
      advancedSub: 'سرعة التلاوة، وضع شاشة التلفاز الكبيرة، التحفيظ والذاكرة المؤقتة',
      tvTitle: 'وضع شاشة التلفاز والعرض الكامل (TV)',
      tvDesc: 'يكبّر الخطوط للقراءة عن بُعد ويمنع انطفاء الشاشة.',
      tvBtnActive: 'إنهاء وضع شاشة التلفاز',
      tvBtnInactive: 'تفعيل وضع شاشة التلفاز',
      autoSwipeTitle: 'تشغيل تلقائي عند التمرير بين الآيات',
      autoSwipeDesc: 'تبدأ التلاوة فوراً عند الانتقال للآية التالية.',
      audioSpeedLabel: 'سرعة التلاوة',
      loopVerseOpt: 'تكرار نفس الآية',
      nextVerseOpt: 'الانتقال للآية التالية',
      scholarLabel: 'المفسر الكلاسيكي المعتمد',
      cacheTitle: 'القراءة بدون اتصال بالإنترنت',
      cacheBookmarksBtn: 'حفظ تلاوات الآيات المفضلة (♥) بدون إنترنت',
      cachedDone: 'تم الحفظ بدون إنترنت!',
      clearCacheBtn: 'تفريغ الذاكرة المؤقتة',
      wordByWordTitle: 'المصحف كلمة بكلمة (Duo)',
      memorizationTitle: 'وضع التحفيظ الذكي (Hifz)',
      thumbRailTitle: 'شريط الإبهام السريع',
    },
  }[language];

  // Arabic reciter voice badges
  const reciterHighlights: Record<string, { tag: string; emoji: string }> = {
    alafasy: { tag: language === 'ar' ? 'عذب ومؤثر' : 'Melodic & Reverent', emoji: '🎙️' },
    abdulbasit: { tag: language === 'ar' ? 'هادئ ومفصل' : 'Calm & Majestic', emoji: '🌟' },
    husary: { tag: language === 'ar' ? 'معلم ومتقن' : 'Educational & Crystal Clear', emoji: '✨' },
    minshawi: { tag: language === 'ar' ? 'خاشع وباكٍ' : 'Heartfelt & Tender', emoji: '🌿' },
    ghamadi: { tag: language === 'ar' ? 'سلس ومتواصل' : 'Smooth Pace', emoji: '🕊️' },
  };

  return (
    <section
      aria-label={labels.pageTitle}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className="space-y-6 pb-16 max-w-4xl mx-auto"
    >
      {/* Top Header Card */}
      <div className="p-5 sm:p-7 rounded-3xl bg-[#FBF8F1] dark:bg-[#082019] border border-emerald-900/10 dark:border-emerald-800/40 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#006D53] dark:text-[#F4B900]">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Hidaya</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-emerald-950 dark:text-[#F5F7F2]">
            {labels.pageTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#9BAFA7] max-w-xl">
            {labels.pageSub}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="min-h-[44px] px-3.5 py-2.5 rounded-xl border border-emerald-900/15 dark:border-emerald-800/40 text-xs font-semibold text-slate-600 dark:text-[#9BAFA7] hover:text-emerald-950 dark:hover:text-white inline-flex items-center gap-1.5 cursor-pointer transition-colors active:scale-95"
            title="Reset to default settings"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{labels.resetBtn}</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#006D53] hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs inline-flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>{labels.backBtn}</span>
            </button>
          )}
        </div>
      </div>

      {/* ESSENTIAL 1: THEME & CONTRAST (LARGE TOUCH CARDS) */}
      <div className="p-5 sm:p-7 rounded-3xl bg-[#FBF8F1] dark:bg-[#082019] border border-emerald-900/10 dark:border-emerald-800/40 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-emerald-950 dark:text-[#F5F7F2] flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-[#006D53]/15 dark:bg-[#0C2920] flex items-center justify-center text-[#006D53] dark:text-[#F4B900]">
              <Moon className="w-4 h-4" />
            </span>
            <span>{labels.themeTitle}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Dark Sanctuary Card */}
          <button
            type="button"
            onClick={() => {
              if (!isDark && onToggleDark) {
                onToggleDark();
              }
              document.documentElement.classList.add('dark');
              StorageService.setDarkMode(true);
            }}
            aria-pressed={isDark}
            className={`min-h-[64px] p-4 rounded-2xl border text-start transition-all cursor-pointer flex items-center justify-between gap-3 active:scale-[0.99] ${
              isDark
                ? 'bg-[#061B16] text-[#F5F7F2] border-emerald-500 shadow-sm ring-2 ring-emerald-500/30'
                : 'bg-[#F7F0E2] dark:bg-[#0C2920] text-emerald-950 dark:text-[#F5F7F2] border-emerald-900/10 dark:border-emerald-800/40 hover:border-emerald-500/50'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-950 border border-emerald-700/40 flex items-center justify-center text-[#F4B900] shrink-0 shadow-inner">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm sm:text-base font-bold flex items-center gap-2">
                  <span>{labels.darkModeTitle}</span>
                </div>
                <div className="text-xs text-[#9BAFA7] mt-0.5">
                  {labels.darkModeSub}
                </div>
              </div>
            </div>
            {isDark && (
              <div className="w-6 h-6 rounded-full bg-[#006D53] flex items-center justify-center text-white shrink-0">
                <Check className="w-4 h-4" />
              </div>
            )}
          </button>

          {/* Warm Parchment Card */}
          <button
            type="button"
            onClick={() => {
              if (isDark && onToggleDark) {
                onToggleDark();
              }
              document.documentElement.classList.remove('dark');
              StorageService.setDarkMode(false);
            }}
            aria-pressed={!isDark}
            className={`min-h-[64px] p-4 rounded-2xl border text-start transition-all cursor-pointer flex items-center justify-between gap-3 active:scale-[0.99] ${
              !isDark
                ? 'bg-amber-50 text-emerald-950 border-amber-600 shadow-sm ring-2 ring-amber-500/30'
                : 'bg-[#F7F0E2] dark:bg-[#0C2920] text-emerald-950 dark:text-[#F5F7F2] border-emerald-900/10 dark:border-emerald-800/40 hover:border-amber-500/50'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-100/80 border border-amber-400/50 flex items-center justify-center text-amber-700 shrink-0 shadow-inner">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm sm:text-base font-bold flex items-center gap-2">
                  <span>{labels.lightModeTitle}</span>
                </div>
                <div className="text-xs text-slate-600 dark:text-[#9BAFA7] mt-0.5">
                  {labels.lightModeSub}
                </div>
              </div>
            </div>
            {!isDark && (
              <div className="w-6 h-6 rounded-full bg-amber-600 flex items-center justify-center text-white shrink-0">
                <Check className="w-4 h-4" />
              </div>
            )}
          </button>
        </div>

        {/* High Contrast Toggle (Easy for Seniors) */}
        <button
          type="button"
          onClick={onToggleHighContrast}
          aria-pressed={isHighContrast}
          className={`w-full min-h-[50px] p-3.5 rounded-2xl border text-start transition-all cursor-pointer flex items-center justify-between gap-3 ${
            isHighContrast
              ? 'bg-[#006D53]/15 dark:bg-[#006D53]/30 border-[#006D53] text-emerald-950 dark:text-[#F5F7F2]'
              : 'bg-[#F7F0E2] dark:bg-[#0C2920] border-emerald-900/10 dark:border-emerald-800/40 text-slate-700 dark:text-[#9BAFA7]'
          }`}
        >
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-[#006D53] dark:text-[#F4B900] shrink-0" />
            <div>
              <span className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-[#F5F7F2]">
                {labels.highContrastTitle}
              </span>
              <p className="text-[11px] text-slate-500 dark:text-[#9BAFA7]">
                {labels.highContrastSub}
              </p>
            </div>
          </div>
          <div
            className={`w-12 h-6.5 rounded-full p-0.5 transition-colors shrink-0 flex items-center ${
              isHighContrast ? 'bg-[#006D53] justify-end' : 'bg-slate-300 dark:bg-emerald-950 justify-start'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white shadow-xs block" />
          </div>
        </button>
      </div>

      {/* ESSENTIAL 2: TEXT SIZING WITH LIVE REAL-TIME ARABIC PREVIEW */}
      <div className="p-5 sm:p-7 rounded-3xl bg-[#FBF8F1] dark:bg-[#082019] border border-emerald-900/10 dark:border-emerald-800/40 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-emerald-950 dark:text-[#F5F7F2] flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-[#006D53]/15 dark:bg-[#0C2920] flex items-center justify-center text-[#006D53] dark:text-[#F4B900]">
              <Type className="w-4 h-4" />
            </span>
            <span>{labels.textSizeTitle}</span>
          </h2>
        </div>

        {/* Live Interactive Quranic Preview Box */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#061B16] border border-emerald-900/15 dark:border-emerald-800/50 shadow-inner space-y-3 transition-all text-center">
          <div className="text-[11px] font-bold text-emerald-800/70 dark:text-emerald-400/80 uppercase tracking-wider flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#F4B900]" />
            <span>{labels.previewTitle}</span>
          </div>

          {/* Arabic Ayah Preview (scales in real time) */}
          <div
            dir="rtl"
            style={{ fontSize: `${arabicScale * 26}px`, lineHeight: 1.65 }}
            className="font-arabic text-emerald-950 dark:text-[#F5F7F2] transition-all duration-200 select-none py-1"
          >
            {labels.previewArabic}
          </div>

          {/* Translation Preview (scales in real time) */}
          <p
            dir={language === 'ar' ? 'rtl' : 'ltr'}
            style={{ fontSize: `${(readingScale || 1.0) * 15}px`, lineHeight: 1.5 }}
            className="text-slate-600 dark:text-[#9BAFA7] transition-all duration-200 italic"
          >
            {labels.previewTranslation}
          </p>
        </div>

        {/* 1. Arabic Text Size: Steppers + Preset Cards */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-emerald-950 dark:text-[#F5F7F2]">
            <span>{labels.arabicTextSize}</span>
            <span className="font-mono text-emerald-700 dark:text-[#F4B900] bg-emerald-100/50 dark:bg-emerald-950/70 px-2.5 py-0.5 rounded-full text-xs">
              {Math.round(arabicScale * 100)}%
            </span>
          </div>

          {/* Steppers A- / A+ and Direct Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleStepArabicScale(-0.1)}
              className="min-h-[48px] min-w-[48px] rounded-2xl bg-[#F7F0E2] dark:bg-[#0C2920] border border-emerald-900/10 dark:border-emerald-800/40 text-emerald-950 dark:text-white font-bold flex items-center justify-center hover:bg-emerald-100 dark:hover:bg-emerald-900/50 active:scale-95 transition-all cursor-pointer shadow-xs"
              aria-label="Decrease Arabic font size"
            >
              <Minus className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-4 gap-1.5 flex-1 w-full">
              {ARABIC_SIZE_PRESETS.map((p) => {
                const active = Math.abs(arabicScale - p.scale) < 0.08;
                return (
                  <button
                    key={p.scale}
                    type="button"
                    onClick={() => onArabicScaleChange(p.scale)}
                    aria-pressed={active}
                    className={`min-h-[48px] px-2 py-1.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center active:scale-95 ${
                      active
                        ? 'bg-[#006D53] text-white border-[#006D53] font-bold shadow-xs'
                        : 'bg-[#F7F0E2] dark:bg-[#0C2920] border-emerald-900/10 dark:border-emerald-800/40 text-emerald-950 dark:text-[#F5F7F2] hover:border-[#006D53]'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-bold">{p.label}</span>
                    <span className={`text-[10px] ${active ? 'text-emerald-100' : 'text-slate-500 dark:text-[#9BAFA7]'}`}>
                      {p.sub}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => handleStepArabicScale(0.1)}
              className="min-h-[48px] min-w-[48px] rounded-2xl bg-[#F7F0E2] dark:bg-[#0C2920] border border-emerald-900/10 dark:border-emerald-800/40 text-emerald-950 dark:text-white font-bold flex items-center justify-center hover:bg-emerald-100 dark:hover:bg-emerald-900/50 active:scale-95 transition-all cursor-pointer shadow-xs"
              aria-label="Increase Arabic font size"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Translation & Reading Text Size: Direct Buttons */}
        <div className="space-y-2.5 pt-2 border-t border-emerald-900/10 dark:border-emerald-800/40">
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-emerald-950 dark:text-[#F5F7F2]">
            <span>{labels.readingTextSize}</span>
            <span className="font-mono text-emerald-700 dark:text-[#F4B900] bg-emerald-100/50 dark:bg-emerald-950/70 px-2.5 py-0.5 rounded-full text-xs">
              {Math.round((readingScale || 1.0) * 100)}%
            </span>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleStepReadingScale(-0.1)}
              className="min-h-[48px] min-w-[48px] rounded-2xl bg-[#F7F0E2] dark:bg-[#0C2920] border border-emerald-900/10 dark:border-emerald-800/40 text-emerald-950 dark:text-white font-bold flex items-center justify-center hover:bg-emerald-100 dark:hover:bg-emerald-900/50 active:scale-95 transition-all cursor-pointer shadow-xs"
              aria-label="Decrease reading font size"
            >
              <Minus className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-3 gap-1.5 flex-1 w-full">
              {READING_SIZE_PRESETS.map((p) => {
                const active = Math.abs((readingScale || 1.0) - p.scale) < 0.08;
                return (
                  <button
                    key={p.scale}
                    type="button"
                    onClick={() => onReadingScaleChange?.(p.scale)}
                    aria-pressed={active}
                    className={`min-h-[48px] px-2 py-1.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center active:scale-95 ${
                      active
                        ? 'bg-[#006D53] text-white border-[#006D53] font-bold shadow-xs'
                        : 'bg-[#F7F0E2] dark:bg-[#0C2920] border-emerald-900/10 dark:border-emerald-800/40 text-emerald-950 dark:text-[#F5F7F2] hover:border-[#006D53]'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-bold">{p.label}</span>
                    <span className={`text-[10px] ${active ? 'text-emerald-100' : 'text-slate-500 dark:text-[#9BAFA7]'}`}>
                      {p.sub}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => handleStepReadingScale(0.1)}
              className="min-h-[48px] min-w-[48px] rounded-2xl bg-[#F7F0E2] dark:bg-[#0C2920] border border-emerald-900/10 dark:border-emerald-800/40 text-emerald-950 dark:text-white font-bold flex items-center justify-center hover:bg-emerald-100 dark:hover:bg-emerald-900/50 active:scale-95 transition-all cursor-pointer shadow-xs"
              aria-label="Increase reading font size"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* ESSENTIAL 3: LANGUAGE SELECTION (LARGE TOUCH CARDS) */}
      <div className="p-5 sm:p-7 rounded-3xl bg-[#FBF8F1] dark:bg-[#082019] border border-emerald-900/10 dark:border-emerald-800/40 shadow-xs space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-emerald-950 dark:text-[#F5F7F2] flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-[#006D53]/15 dark:bg-[#0C2920] flex items-center justify-center text-[#006D53] dark:text-[#F4B900]">
            <Globe className="w-4 h-4" />
          </span>
          <span>{labels.langTitle}</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {LANGUAGE_OPTIONS.map((opt) => {
            const active = language === opt.code;
            return (
              <button
                key={opt.code}
                type="button"
                onClick={() => onLanguageChange?.(opt.code)}
                aria-pressed={active}
                className={`min-h-[56px] p-3 rounded-2xl border text-start transition-all flex items-center justify-between cursor-pointer active:scale-95 ${
                  active
                    ? 'bg-[#006D53] text-white border-[#006D53] font-bold shadow-xs ring-2 ring-emerald-500/30'
                    : 'bg-[#F7F0E2] dark:bg-[#0C2920] border-emerald-900/10 dark:border-emerald-800/40 text-emerald-950 dark:text-[#F5F7F2] hover:border-[#006D53]'
                }`}
              >
                <div>
                  <div className="text-base font-bold flex items-center gap-1.5">
                    <span>{opt.flag}</span>
                    <span>{opt.native}</span>
                  </div>
                  <div className={`text-xs ${active ? 'text-emerald-100' : 'text-slate-500 dark:text-[#9BAFA7]'}`}>
                    {opt.label}
                  </div>
                </div>
                {active && <Check className="w-5 h-5 text-[#F4B900] shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ESSENTIAL 4: QURANIC RECITER (FRIENDLY CARDS) */}
      <div className="p-5 sm:p-7 rounded-3xl bg-[#FBF8F1] dark:bg-[#082019] border border-emerald-900/10 dark:border-emerald-800/40 shadow-xs space-y-4">
        <div className="space-y-1">
          <h2 className="text-base sm:text-lg font-bold text-emerald-950 dark:text-[#F5F7F2] flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-[#006D53]/15 dark:bg-[#0C2920] flex items-center justify-center text-[#006D53] dark:text-[#F4B900]">
              <Headphones className="w-4 h-4" />
            </span>
            <span>{labels.reciterTitle}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#9BAFA7]">{labels.reciterSub}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {AVAILABLE_RECITERS.map((r) => {
            const active = r.id === reciterId;
            const highlight = reciterHighlights[r.id];
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => handleReciterSelect(r.id)}
                aria-pressed={active}
                className={`min-h-[58px] p-3.5 rounded-2xl border text-start flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] ${
                  active
                    ? 'bg-[#006D53] text-white border-[#006D53] font-bold shadow-xs ring-2 ring-emerald-500/30'
                    : 'bg-[#F7F0E2] dark:bg-[#0C2920] border-emerald-900/10 dark:border-emerald-800/40 text-emerald-950 dark:text-[#F5F7F2] hover:border-[#006D53]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl shrink-0">{highlight?.emoji || '📖'}</span>
                  <div>
                    <div className="text-xs sm:text-sm font-bold leading-snug">{r.name}</div>
                    <div className={`text-[11px] ${active ? 'text-emerald-100' : 'text-slate-500 dark:text-[#9BAFA7]'}`}>
                      {highlight?.tag || r.style}
                    </div>
                  </div>
                </div>
                {active && <Check className="w-5 h-5 text-[#F4B900] shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ESSENTIAL 5: LEARNING HELPERS (KIDS & SENIOR-FRIENDLY TOGGLES) */}
      <div className="p-5 sm:p-7 rounded-3xl bg-[#FBF8F1] dark:bg-[#082019] border border-emerald-900/10 dark:border-emerald-800/40 shadow-xs space-y-3.5">
        <h2 className="text-base sm:text-lg font-bold text-emerald-950 dark:text-[#F5F7F2] flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-[#006D53]/15 dark:bg-[#0C2920] flex items-center justify-center text-[#006D53] dark:text-[#F4B900]">
            <BookOpen className="w-4 h-4" />
          </span>
          <span>{labels.helpersTitle}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Transliteration */}
          <button
            type="button"
            onClick={() => updatePref({ showTransliteration: !prefs.showTransliteration })}
            aria-pressed={prefs.showTransliteration}
            className={`min-h-[58px] p-3.5 rounded-2xl border text-start transition-all cursor-pointer flex items-center justify-between gap-3 ${
              prefs.showTransliteration
                ? 'bg-[#006D53]/15 dark:bg-[#006D53]/30 border-[#006D53] text-emerald-950 dark:text-[#F5F7F2]'
                : 'bg-[#F7F0E2] dark:bg-[#0C2920] border-emerald-900/10 dark:border-emerald-800/40 text-slate-700 dark:text-[#9BAFA7]'
            }`}
          >
            <div>
              <span className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-[#F5F7F2] block">
                {labels.translitTitle}
              </span>
              <p className="text-[11px] text-slate-500 dark:text-[#9BAFA7] mt-0.5">
                {labels.translitSub}
              </p>
            </div>
            <div
              className={`w-12 h-6.5 rounded-full p-0.5 transition-colors shrink-0 flex items-center ${
                prefs.showTransliteration ? 'bg-[#006D53] justify-end' : 'bg-slate-300 dark:bg-emerald-950 justify-start'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white shadow-xs block" />
            </div>
          </button>

          {/* Tajweed recitation rules */}
          <button
            type="button"
            onClick={() => updatePref({ showTajweedColors: !prefs.showTajweedColors })}
            aria-pressed={prefs.showTajweedColors}
            className={`min-h-[58px] p-3.5 rounded-2xl border text-start transition-all cursor-pointer flex items-center justify-between gap-3 ${
              prefs.showTajweedColors
                ? 'bg-[#006D53]/15 dark:bg-[#006D53]/30 border-[#006D53] text-emerald-950 dark:text-[#F5F7F2]'
                : 'bg-[#F7F0E2] dark:bg-[#0C2920] border-emerald-900/10 dark:border-emerald-800/40 text-slate-700 dark:text-[#9BAFA7]'
            }`}
          >
            <div>
              <span className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-[#F5F7F2] block">
                {labels.tajweedTitle}
              </span>
              <p className="text-[11px] text-slate-500 dark:text-[#9BAFA7] mt-0.5">
                {labels.tajweedSub}
              </p>
            </div>
            <div
              className={`w-12 h-6.5 rounded-full p-0.5 transition-colors shrink-0 flex items-center ${
                prefs.showTajweedColors ? 'bg-[#006D53] justify-end' : 'bg-slate-300 dark:bg-emerald-950 justify-start'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white shadow-xs block" />
            </div>
          </button>
        </div>
      </div>

      {/* COLLAPSIBLE SECTION: ADVANCED & TECHNICAL SETTINGS */}
      <div className="rounded-3xl bg-[#FBF8F1] dark:bg-[#082019] border border-emerald-900/10 dark:border-emerald-800/40 shadow-xs overflow-hidden transition-all">
        {/* Accordion Header */}
        <button
          type="button"
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          aria-expanded={isAdvancedOpen}
          className="w-full min-h-[58px] p-5 sm:p-6 text-start flex items-center justify-between gap-4 cursor-pointer hover:bg-emerald-900/5 dark:hover:bg-emerald-900/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#006D53]/15 dark:bg-[#0C2920] flex items-center justify-center text-[#006D53] dark:text-[#F4B900] shrink-0">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-bold text-emerald-950 dark:text-[#F5F7F2] flex items-center gap-2">
                <span>{labels.advancedTitle}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-[#9BAFA7] mt-0.5">
                {labels.advancedSub}
              </p>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-emerald-900/10 dark:bg-emerald-800/30 flex items-center justify-center text-emerald-950 dark:text-[#F5F7F2] shrink-0">
            {isAdvancedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {/* Collapsible Content */}
        {isAdvancedOpen && (
          <div className="p-5 sm:p-7 pt-2 border-t border-emerald-900/10 dark:border-emerald-800/40 space-y-6 animate-fadeIn">
            {/* TV Screen / Fullscreen Mode */}
            <div className="p-4 rounded-2xl bg-[#F7F0E2] dark:bg-[#0C2920] border border-amber-500/30 dark:border-[#F4B900]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#006D53] text-[#F4B900] flex items-center justify-center shrink-0">
                  <Tv className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-950 dark:text-[#F5F7F2]">
                    {labels.tvTitle}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-[#9BAFA7] mt-0.5 leading-relaxed">
                    {labels.tvDesc}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  updatePref({ tvMode: !prefs.tvMode });
                  onToggleFullscreenTv?.();
                }}
                className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 shrink-0 cursor-pointer transition-all ${
                  prefs.tvMode || isFullscreenActive
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-[#006D53] hover:bg-emerald-700 text-white shadow-xs'
                }`}
              >
                {prefs.tvMode || isFullscreenActive ? (
                  <>
                    <Minimize2 className="w-4 h-4" />
                    <span>{labels.tvBtnActive}</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-4 h-4" />
                    <span>{labels.tvBtnInactive}</span>
                  </>
                )}
              </button>
            </div>

            {/* Recitation Playback Speed */}
            <div className="space-y-2">
              <span className="block text-xs font-bold text-emerald-900 dark:text-emerald-300">
                {labels.audioSpeedLabel}
              </span>
              <div className="grid grid-cols-4 gap-2">
                {[0.75, 1, 1.25, 1.5].map((speed) => {
                  const active = (prefs.playbackSpeed || 1) === speed;
                  return (
                    <button
                      key={speed}
                      type="button"
                      onClick={() => updatePref({ playbackSpeed: speed })}
                      aria-pressed={active}
                      className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center flex items-center justify-center ${
                        active
                          ? 'bg-[#006D53] text-white border-transparent shadow-xs'
                          : 'bg-white dark:bg-[#061B16] text-emerald-950 dark:text-[#F5F7F2] border-emerald-900/10 dark:border-emerald-800/40 hover:border-[#006D53]'
                      }`}
                    >
                      <span>{speed}x</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Auto-Play on Swipe & Loop Verse */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => updatePref({ autoPlayOnSwipe: !prefs.autoPlayOnSwipe })}
                aria-pressed={prefs.autoPlayOnSwipe}
                className={`p-3.5 rounded-2xl border text-start transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  prefs.autoPlayOnSwipe
                    ? 'bg-[#006D53]/15 dark:bg-[#006D53]/30 border-[#006D53] text-emerald-950 dark:text-[#F5F7F2]'
                    : 'bg-white dark:bg-[#061B16] border-emerald-900/10 dark:border-emerald-800/40 text-slate-700 dark:text-[#9BAFA7]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Play className="w-4 h-4 text-[#006D53] dark:text-[#F4B900]" />
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-[#F5F7F2]">
                      {labels.autoSwipeTitle}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-[#9BAFA7]">
                      {labels.autoSwipeDesc}
                    </div>
                  </div>
                </div>
                <div
                  className={`w-10 h-5.5 rounded-full p-0.5 transition-colors shrink-0 flex items-center ${
                    prefs.autoPlayOnSwipe ? 'bg-[#006D53] justify-end' : 'bg-slate-300 dark:bg-emerald-950 justify-start'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-xs block" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => updatePref({ loopVerse: !prefs.loopVerse })}
                aria-pressed={prefs.loopVerse}
                className={`p-3.5 rounded-2xl border text-start transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  prefs.loopVerse
                    ? 'bg-[#006D53]/15 dark:bg-[#006D53]/30 border-[#006D53] text-emerald-950 dark:text-[#F5F7F2]'
                    : 'bg-white dark:bg-[#061B16] border-emerald-900/10 dark:border-emerald-800/40 text-slate-700 dark:text-[#9BAFA7]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Repeat className="w-4 h-4 text-[#006D53] dark:text-[#F4B900]" />
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-[#F5F7F2]">
                      {labels.loopVerseOpt}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-[#9BAFA7]">
                      {prefs.loopVerse ? labels.loopVerseOpt : labels.nextVerseOpt}
                    </div>
                  </div>
                </div>
                <div
                  className={`w-10 h-5.5 rounded-full p-0.5 transition-colors shrink-0 flex items-center ${
                    prefs.loopVerse ? 'bg-[#006D53] justify-end' : 'bg-slate-300 dark:bg-emerald-950 justify-start'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-xs block" />
                </div>
              </button>
            </div>

            {/* Classical Tafsir Scholar */}
            <div className="space-y-2">
              <span className="block text-xs font-bold text-emerald-900 dark:text-emerald-300">
                {labels.scholarLabel}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {SCHOLARS.map((s) => {
                  const active = preferredScholar === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => onPreferredScholarChange?.(s.id)}
                      aria-pressed={active}
                      className={`p-3 rounded-xl border text-start flex flex-col justify-between cursor-pointer transition-all ${
                        active
                          ? 'bg-[#006D53] text-white border-[#006D53] font-bold'
                          : 'bg-white dark:bg-[#061B16] border-emerald-900/10 dark:border-emerald-800/40 text-emerald-950 dark:text-[#F5F7F2]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs sm:text-sm font-semibold">{s.label}</span>
                        {active && <Check className="w-4 h-4 text-[#F4B900] shrink-0" />}
                      </div>
                      <div className={`text-[10px] mt-1 ${active ? 'text-emerald-100' : 'text-slate-500 dark:text-[#9BAFA7]'}`}>
                        {s.sub[language]}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Additional Interaction Modes (Word-by-word Duo, Memorization Hifz, Thumb Rail) */}
            <div className="space-y-2 pt-2 border-t border-emerald-900/10 dark:border-emerald-800/40">
              <span className="block text-xs font-bold text-emerald-900 dark:text-emerald-300">
                Modes Spéciaux de Lecture & Ergonomie
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Word by word Duo */}
                <button
                  type="button"
                  onClick={() => updatePref({ showWordByWordDuo: !prefs.showWordByWordDuo, enableMemorizationMode: false })}
                  aria-pressed={Boolean(prefs.showWordByWordDuo)}
                  className={`p-3 rounded-xl border text-start flex items-center justify-between gap-3 cursor-pointer ${
                    prefs.showWordByWordDuo
                      ? 'bg-[#006D53]/15 dark:bg-[#006D53]/30 border-[#006D53] text-emerald-950 dark:text-[#F5F7F2]'
                      : 'bg-white dark:bg-[#061B16] border-emerald-900/10 dark:border-emerald-800/40 text-slate-700 dark:text-[#9BAFA7]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#006D53] dark:text-[#F4B900]" />
                    <span className="text-xs font-semibold">{labels.wordByWordTitle}</span>
                  </div>
                  <div
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 flex items-center ${
                      prefs.showWordByWordDuo ? 'bg-[#006D53] justify-end' : 'bg-slate-300 dark:bg-emerald-950 justify-start'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white shadow-xs block" />
                  </div>
                </button>

                {/* Memorization Hifz */}
                <button
                  type="button"
                  onClick={() => updatePref({ enableMemorizationMode: !prefs.enableMemorizationMode, showWordByWordDuo: false })}
                  aria-pressed={Boolean(prefs.enableMemorizationMode)}
                  className={`p-3 rounded-xl border text-start flex items-center justify-between gap-3 cursor-pointer ${
                    prefs.enableMemorizationMode
                      ? 'bg-[#006D53]/15 dark:bg-[#006D53]/30 border-[#006D53] text-emerald-950 dark:text-[#F5F7F2]'
                      : 'bg-white dark:bg-[#061B16] border-emerald-900/10 dark:border-emerald-800/40 text-slate-700 dark:text-[#9BAFA7]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#006D53] dark:text-[#F4B900]" />
                    <span className="text-xs font-semibold">{labels.memorizationTitle}</span>
                  </div>
                  <div
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 flex items-center ${
                      prefs.enableMemorizationMode ? 'bg-[#006D53] justify-end' : 'bg-slate-300 dark:bg-emerald-950 justify-start'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white shadow-xs block" />
                  </div>
                </button>

                {/* Thumb quick action rail */}
                <button
                  type="button"
                  onClick={() => updatePref({ showThumbRail: prefs.showThumbRail === false })}
                  aria-pressed={prefs.showThumbRail !== false}
                  className={`p-3 rounded-xl border text-start flex items-center justify-between gap-3 cursor-pointer ${
                    prefs.showThumbRail !== false
                      ? 'bg-[#006D53]/15 dark:bg-[#006D53]/30 border-[#006D53] text-emerald-950 dark:text-[#F5F7F2]'
                      : 'bg-white dark:bg-[#061B16] border-emerald-900/10 dark:border-emerald-800/40 text-slate-700 dark:text-[#9BAFA7]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#006D53] dark:text-[#F4B900]" />
                    <span className="text-xs font-semibold">{labels.thumbRailTitle}</span>
                  </div>
                  <div
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 flex items-center ${
                      prefs.showThumbRail !== false ? 'bg-[#006D53] justify-end' : 'bg-slate-300 dark:bg-emerald-950 justify-start'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white shadow-xs block" />
                  </div>
                </button>

                {/* Social comments thread */}
                <button
                  type="button"
                  onClick={() => updatePref({ showSocialComments: !prefs.showSocialComments })}
                  aria-pressed={prefs.showSocialComments}
                  className={`p-3 rounded-xl border text-start flex items-center justify-between gap-3 cursor-pointer ${
                    prefs.showSocialComments
                      ? 'bg-[#006D53]/15 dark:bg-[#006D53]/30 border-[#006D53] text-emerald-950 dark:text-[#F5F7F2]'
                      : 'bg-white dark:bg-[#061B16] border-emerald-900/10 dark:border-emerald-800/40 text-slate-700 dark:text-[#9BAFA7]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-[#006D53] dark:text-[#F4B900]" />
                    <span className="text-xs font-semibold">Fil de réflexions partagées</span>
                  </div>
                  <div
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 flex items-center ${
                      prefs.showSocialComments ? 'bg-[#006D53] justify-end' : 'bg-slate-300 dark:bg-emerald-950 justify-start'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white shadow-xs block" />
                  </div>
                </button>
              </div>
            </div>

            {/* Offline Cache Controls */}
            <div className="pt-2 border-t border-emerald-900/10 dark:border-emerald-800/40 space-y-2">
              <span className="block text-xs font-bold text-emerald-900 dark:text-emerald-300">
                {labels.cacheTitle}
              </span>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleCacheBookmarkedAudio}
                  disabled={isCachingBookmarks}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-[#006D53] hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {cachedSuccess ? <Check className="w-4 h-4 text-[#F4B900]" /> : <Download className="w-4 h-4" />}
                  <span>{cachedSuccess ? labels.cachedDone : labels.cacheBookmarksBtn}</span>
                </button>

                <button
                  type="button"
                  onClick={() => void OfflineCacheService.clearAudioCache()}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-white dark:bg-[#061B16] border border-emerald-900/15 dark:border-emerald-800/40 text-xs font-semibold text-slate-700 dark:text-[#9BAFA7] hover:text-red-500 inline-flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{labels.clearCacheBtn}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
