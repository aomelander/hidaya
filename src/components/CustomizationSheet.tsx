"use client";

/**
 * @file src/components/CustomizationSheet.tsx
 * @description Intuitively structured 5-section Preferences & Personalization Hub:
 * 1. Language, Theme & LG TV / Fullscreen Sanctuary Mode
 * 2. Video-Style Auto-Play on Swipe & Continuous Audio Settings (Recitation, Translation, Tafsir, Next Verse vs Loop)
 * 3. Universal Verse Card Customization (Choose exactly which layers appear on the card + font scales)
 * 4. Reader Profile & Explanation Depth (Standard, Teen 13-17, Kids & Family 8+)
 * 5. Offline Cache & PWA App Installation
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

const LANGUAGE_OPTIONS: { code: Language; label: string; native: string }[] = [
  { code: 'fr', label: 'French', native: 'Français' },
  { code: 'en', label: 'English', native: 'English' },
  { code: 'sv', label: 'Swedish', native: 'Svenska' },
  { code: 'ar', label: 'Arabic', native: 'العربية' },
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

export const CustomizationSheet: React.FC<CustomizationSheetProps> = ({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  isDark = false,
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

  const prefs: VerseCardPreferences = cardPreferences || {
    ...APP_CONFIG.DEFAULTS.CARD_PREFS,
    showTransliteration,
  };

  useEffect(() => {
    setReciterId(StorageService.getPreferredReciter());
  }, [isOpen]);

  if (!isOpen) return null;

  const updatePref = (updates: Partial<VerseCardPreferences>) => {
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
    onPreferredScholarChange?.('Ibn Kathir');
    handleReciterSelect('alafasy');
    updatePref(APP_CONFIG.DEFAULTS.CARD_PREFS);
  };

  const labels = {
    fr: {
      pageTitle: 'Préférences & Personnalisation',
      pageSub: 'Configurez votre langue, le déclenchement audio au swipe, l’affichage de la carte universelle et le Mode Écran TV.',
      backBtn: 'Retour aux Versets',
      resetBtn: 'Réinitialiser',
      sec1Title: '1. Langue, Thème & Mode Écran TV',
      sec1Sub: 'Choisissez la langue de traduction, l’ambiance visuelle et l’affichage grand écran (TV LG / PC / Tablette).',
      langLabel: 'Langue de l’application & des traductions',
      themeLabel: 'Apparence du Sanctuaire',
      lightMode: 'Parchemin Clair',
      darkMode: 'Sanctuaire Sombre',
      highContrast: 'Contraste Élevé',
      tvTitle: 'Mode Écran TV / Plein Écran (LG TV, PC, Tablette)',
      tvDesc: 'Agrandit la calligraphie pour une lecture à distance, active le pilotage par flèches télécommande et empêche la mise en veille.',
      tvBtnActive: 'Quitter le Plein Écran TV',
      tvBtnInactive: 'Activer le Mode Plein Écran / TV',
      sec2Title: '2. Expérience Audio & Lecture Automatique (Façon Vidéo)',
      sec2Sub: 'Comportement de la lecture quand vous glissez (swipe) d’un verset à l’autre et préparation en cache sans lag.',
      autoSwipeTitle: 'Lecture automatique au swipe (Expérience Vidéo / Reels)',
      autoSwipeDesc: 'Dès que vous glissez vers le verset suivant ou précédent, la récitation démarre immédiatement.',
      afterVerseTitle: 'À la fin de la lecture complète du verset',
      nextVerseOpt: 'Passer automatiquement au verset suivant',
      loopVerseOpt: 'Répéter le même verset en boucle',
      defaultPhasesTitle: 'Parties lues par défaut (avec pré-cache automatique zéro lag)',
      phaseRecitation: 'Récitation Arabe',
      phaseTranslation: 'Traduction',
      phaseTafsir: 'Tafsir Classique (si disponible dans la langue)',
      reciterLabel: 'Voix du Récitateur Coranique',
      scholarLabel: 'Exégète (Tafsir) préféré',
      sec3Title: '3. Personnalisation de la Carte Universelle',
      sec3Sub: 'Choisissez quels éléments apparaissent sur la carte du verset pour la garder épurée et adaptée à vos besoins.',
      arabicSize: 'Taille du texte coranique (Arabe)',
      readingSize: 'Taille de la traduction, du tafsir et des notes',
      cardLayersLabel: 'Sections affichées sur la carte du verset',
      layerTranslit: 'Translittération phonétique',
      layerTranslation: 'Traduction humaine (Niveau 2)',
      layerTafsir: 'Tafsir classique ouvert par défaut (Niveau 3)',
      layerComments: 'Fil de commentaires & réflexions façon réseau social (💬)',
      layerStudio: 'Studio de création Image / Vidéo / PowerPoint (🎬)',
      layerRoots: 'Racines linguistiques arabes',
      layerAudioBadge: 'Indicateur de source Audio (GitHub / Server / Browser)',
      sec4Title: '4. Profil du Lecteur & Famille',
      sec4Sub: 'Adapte le vocabulaire des réflexions et explications selon l’âge.',
      sec5Title: '5. Mode Hors-Ligne & Continuité iPhone',
      sec5Sub: 'Les audios en cours sont maintenus actifs même lorsque l’écran de l’iPhone se met en veille.',
      cacheBookmarksBtn: 'Mettre en cache les versets aimés (♥)',
      cachedDone: 'Audios mis en cache !',
      clearCacheBtn: 'Vider le cache audio',
    },
    en: {
      pageTitle: 'Preferences & Personalization',
      pageSub: 'Configure language, video-style auto-play on swipe, universal card layers, and LG TV Fullscreen Mode.',
      backBtn: 'Back to Verses',
      resetBtn: 'Reset Defaults',
      sec1Title: '1. Language, Theme & TV Screen Mode',
      sec1Sub: 'Select your translation language, visual atmosphere, and large-screen TV presentation mode.',
      langLabel: 'Application & Translation Language',
      themeLabel: 'Sanctuary Appearance',
      lightMode: 'Warm Parchment',
      darkMode: 'Dark Sanctuary',
      highContrast: 'High Contrast',
      tvTitle: 'TV Screen / Fullscreen Sanctuary Mode (LG TV, Desktop, Tablet)',
      tvDesc: 'Enlarges typography for 10-foot viewing, enables remote/keyboard arrow navigation, and keeps the screen awake.',
      tvBtnActive: 'Exit TV Fullscreen',
      tvBtnInactive: 'Launch Fullscreen / TV Mode',
      sec2Title: '2. Audio Experience & Video-Style Auto-Play',
      sec2Sub: 'Control how audio starts when swiping between verses and zero-lag background pre-caching.',
      autoSwipeTitle: 'Auto-Play on Swipe (Video / Reels Experience)',
      autoSwipeDesc: 'Automatically start reciting as soon as you swipe left or right to a new verse.',
      afterVerseTitle: 'When all active parts of a verse finish playing',
      nextVerseOpt: 'Automatically advance to the next verse',
      loopVerseOpt: 'Loop / repeat the current verse',
      defaultPhasesTitle: 'Default audio phases (with automatic zero-lag pre-caching)',
      phaseRecitation: 'Arabic Recitation',
      phaseTranslation: 'Translation',
      phaseTafsir: 'Classical Tafsir (when available in chosen language)',
      reciterLabel: 'Quranic Reciter Voice',
      scholarLabel: 'Preferred Tafsir Scholar',
      sec3Title: '3. Universal Verse Card Customization',
      sec3Sub: 'Choose which elements appear on the unified verse card to keep your reading view clean and personal.',
      arabicSize: 'Quranic Arabic Font Scale',
      readingSize: 'Translation, Tafsir & Notes Font Scale',
      cardLayersLabel: 'Visible layers on the verse card',
      layerTranslit: 'Phonetic Transliteration',
      layerTranslation: 'Human Translation (Level 2)',
      layerTafsir: 'Expand Classical Tafsir by default (Level 3)',
      layerComments: 'Social Comment & Reflection Thread (💬)',
      layerStudio: 'Image / Video / PowerPoint Creation Studio (🎬)',
      layerRoots: 'Arabic Linguistic Roots',
      layerAudioBadge: 'Audio Source Badge (GitHub / Server / Browser)',
      sec4Title: '4. Reader & Family Profile',
      sec4Sub: 'Adapts companion reflections for adults, teens, or family study.',
      sec5Title: '5. Offline Storage & iPhone Sleep Continuity',
      sec5Sub: 'Continuous playback stays active even when your iPhone screen locks or goes to sleep.',
      cacheBookmarksBtn: 'Cache Liked Verses Audio (♥)',
      cachedDone: 'Audio Cached!',
      clearCacheBtn: 'Clear Audio Cache',
    },
    sv: {
      pageTitle: 'Inställningar & Anpassning',
      pageSub: 'Konfigurera språk, automatisk uppspelning vid svep, verskortets innehåll och TV-helskärmsläge.',
      backBtn: 'Tillbaka till verser',
      resetBtn: 'Återställ',
      sec1Title: '1. Språk, Tema & TV-skärmsläge',
      sec1Sub: 'Välj översättningsspråk, färgtema och helskärmsläge för TV/dator.',
      langLabel: 'App- och översättningsspråk',
      themeLabel: 'Visuellt tema',
      lightMode: 'Ljust pergament',
      darkMode: 'Mörk helgedom',
      highContrast: 'Hög kontrast',
      tvTitle: 'TV-läge / Helskärm (LG TV, PC, Surfplatta)',
      tvDesc: 'Förstorar texten för avståndsläsning, aktiverar fjärrkontroll/piltangenter och håller skärmen vaken.',
      tvBtnActive: 'Avsluta TV-helskärm',
      tvBtnInactive: 'Aktivera Helskärm / TV-läge',
      sec2Title: '2. Ljudupplevelse & Automatisk Uppspelning (Video-stil)',
      sec2Sub: 'Styr hur ljudet startar när du sveper mellan verser med förladdad cache utan fördröjning.',
      autoSwipeTitle: 'Spela automatiskt vid svep (Reels / Video-känsla)',
      autoSwipeDesc: 'Starta recitationen direkt när du sveper till nästa eller föregående vers.',
      afterVerseTitle: 'När versens alla valda delar har lästs klart',
      nextVerseOpt: 'Gå automatiskt vidare till nästa vers',
      loopVerseOpt: 'Upprepa versen i loop',
      defaultPhasesTitle: 'Delar som läses upp som standard (förladdas utan lagg)',
      phaseRecitation: 'Arabisk recitation',
      phaseTranslation: 'Översättning',
      phaseTafsir: 'Klassisk Tafsir (om tillgänglig på valt språk)',
      reciterLabel: 'Recitatör',
      scholarLabel: 'Föredragen Tafsir-lärd',
      sec3Title: '3. Anpassa det Universella Verskortet',
      sec3Sub: 'Välj vilka sektioner som ska visas på verskortet.',
      arabicSize: 'Arabisk textstorlek',
      readingSize: 'Textstorlek för översättning & tafsir',
      cardLayersLabel: 'Synliga delar på verskortet',
      layerTranslit: 'Fonetisk translitterering',
      layerTranslation: 'Mänsklig översättning (Nivå 2)',
      layerTafsir: 'Visa Tafsir öppet som standard (Nivå 3)',
      layerComments: 'Kommentarer & reflektionstråd (💬)',
      layerStudio: 'Bild-, Video- & PowerPoint-studio (🎬)',
      layerRoots: 'Arabiska ordstammar',
      layerAudioBadge: 'Ljudkälleindikator (GitHub / Server / Browser)',
      sec4Title: '4. Läsar- & Familjeprofil',
      sec4Sub: 'Anpassar reflektionsfrågor för vuxna, ungdomar eller familj.',
      sec5Title: '5. Offlinelagring & iPhone Bakgrundsljud',
      sec5Sub: ' Kontinuerlig uppspelning fortsätter även när iPhone-skärmen går i viloläge.',
      cacheBookmarksBtn: 'Spara gillade versers ljud offline (♥)',
      cachedDone: 'Ljud sparat!',
      clearCacheBtn: 'Rensa ljudcache',
    },
    ar: {
      pageTitle: 'الإعدادات وتخصيص التجربة',
      pageSub: 'تحكم في اللغة، والتشغيل التلقائي عند السحب، ومكونات بطاقة الآية الموحدة، ووضع شاشة التلفاز.',
      backBtn: 'العودة إلى الآيات',
      resetBtn: 'إعادة الضبط',
      sec1Title: '١. اللغة والمظهر ووضع شاشة التلفاز (TV)',
      sec1Sub: 'اختر لغة الترجمة، والمظهر البصري، ووضع العرض الكامل لشاشات التلفاز والحاسوب.',
      langLabel: 'لغة التطبيق والتراجم',
      themeLabel: 'المظهر البصري',
      lightMode: 'الوضع النهاري',
      darkMode: 'الوضع الليلي',
      highContrast: 'تباين عالٍ',
      tvTitle: 'وضع شاشة التلفاز والعرض الكامل (LG TV / حاسوب / جهاز لوحي)',
      tvDesc: 'يكبّر الخطوط للقراءة عن بُعد، ويفعّل التنقل بأسهم جهاز التحكم، ويمنع انطفاء الشاشة.',
      tvBtnActive: 'إنهاء وضع ملء الشاشة',
      tvBtnInactive: 'تفعيل وضع التلفاز / ملء الشاشة',
      sec2Title: '٢. تجربة الصوت والتشغيل التلقائي عند السحب (بأسلوب الفيديو)',
      sec2Sub: 'تحكم في بدء التلاوة تلقائياً عند التمرير بين الآيات مع التحميل المسبق الفوري بدون تقطع.',
      autoSwipeTitle: 'تشغيل تلقائي عند السحب بين الآيات',
      autoSwipeDesc: 'تبدأ التلاوة فوراً بمجرد التمرير لليمين أو اليسار للانتقال إلى آية أخرى.',
      afterVerseTitle: 'عند انتهاء قراءة جميع أجزاء الآية',
      nextVerseOpt: 'الانتقال تلقائياً إلى الآية التالية',
      loopVerseOpt: 'تكرار نفس الآية في حلقة مستمرة',
      defaultPhasesTitle: 'الأجزاء المقروءة صوتياً (مع التخزين المسبق لمنع التأخير)',
      phaseRecitation: 'التلاوة القرآنية (عربي)',
      phaseTranslation: 'الترجمة الصوتية',
      phaseTafsir: 'التفسير الكلاسيكي (إن توفر باللغة المختارة)',
      reciterLabel: 'صوت القارئ المفضل',
      scholarLabel: 'المفسر المفضل',
      sec3Title: '٣. تخصيص بطاقة الآية الموحدة',
      sec3Sub: 'حدد العناصر التي تود إظهارها أو إخفاءها على بطاقة الآية.',
      arabicSize: 'حجم خط الرسم العثماني',
      readingSize: 'حجم خط الترجمة والتفسير والتعليقات',
      cardLayersLabel: 'الأقسام الظاهرة في البطاقة',
      layerTranslit: 'اللفظ اللاتيني (Transliteration)',
      layerTranslation: 'الترجمة المعتمدة (المستوى ٢)',
      layerTafsir: 'فتح التفسير تلقائياً (المستوى ٣)',
      layerComments: 'قسم التعليقات والخواطر التفاعلية (💬)',
      layerStudio: 'استوديو تصميم الصور والفيديو والعروض (🎬)',
      layerRoots: 'الجذور اللغوية القرآنية',
      layerAudioBadge: 'شارة مصدر الصوت (GitHub / Server / Browser)',
      sec4Title: '٤. نمط القارئ والأسرة',
      sec4Sub: 'مواءمة لغة التدبر للكبار أو الشباب أو الأسرة.',
      sec5Title: '٥. التخزين دون إنترنت واستمرارية الصوت على iPhone',
      sec5Sub: 'يستمر الصوت بالانتقال للآية التالية حتى عند قفل شاشة iPhone.',
      cacheBookmarksBtn: 'حفظ صوتيات الآيات المفضلة (♥)',
      cachedDone: 'تم الحفظ!',
      clearCacheBtn: 'مسح ذاكرة الصوت',
    },
  }[language];

  const profileLabels = {
    fr: [
      { id: 'adult' as ReaderProfile, title: 'Standard', sub: 'Tafsir complet & méditation approfondie' },
      { id: 'teen' as ReaderProfile, title: 'Ados (13–17)', sub: 'Essentiel & repères clés du quotidien' },
      { id: 'kids' as ReaderProfile, title: 'Enfants & Famille (8+)', sub: 'Histoire simple & question en famille' },
    ],
    en: [
      { id: 'adult' as ReaderProfile, title: 'Standard', sub: 'Full Tafsir & deep reflection' },
      { id: 'teen' as ReaderProfile, title: 'Teen (13–17)', sub: 'Key takeaway & concept guide' },
      { id: 'kids' as ReaderProfile, title: 'Kids & Family (8+)', sub: 'Simple story & family question' },
    ],
    sv: [
      { id: 'adult' as ReaderProfile, title: 'Standard', sub: 'Full Tafsir & fördjupad reflektion' },
      { id: 'teen' as ReaderProfile, title: 'Ungdom (13–17)', sub: 'Kärnbudskap & ordlista' },
      { id: 'kids' as ReaderProfile, title: 'Barn & Familj (8+)', sub: 'Enkel berättelse & familjefråga' },
    ],
    ar: [
      { id: 'adult' as ReaderProfile, title: 'الوضع الكامل', sub: 'التفسير والتدبر المعمق' },
      { id: 'teen' as ReaderProfile, title: 'الشباب (١٣–١٧)', sub: 'خلاصة ملهمة ودليل مفاهيم' },
      { id: 'kids' as ReaderProfile, title: 'الناشئة والأسرة (٨+)', sub: 'قصة مبسطة وسؤال عائلي' },
    ],
  }[language];

  const renderToggleRow = (
    checked: boolean,
    onChange: () => void,
    title: string,
    subtitle?: string,
    icon?: React.ReactNode
  ) => (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={checked}
      className={`w-full flex items-center justify-between gap-3 p-3.5 rounded-2xl border text-start transition-all cursor-pointer ${
        checked
          ? 'bg-[#006D53]/10 dark:bg-[#006D53]/25 border-[#006D53]/40 text-emerald-950 dark:text-[#F5F7F2]'
          : 'bg-[#FAF8F5] dark:bg-[#061B16]/60 border-emerald-900/10 dark:border-emerald-800/35 text-slate-700 dark:text-[#9BAFA7] hover:border-emerald-700/40'
      }`}
    >
      <div className="flex items-start gap-3 min-w-0">
        {icon && <div className="mt-0.5 text-[#006D53] dark:text-[#F4B900] shrink-0">{icon}</div>}
        <div className="min-w-0">
          <div className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-[#F5F7F2]">
            {title}
          </div>
          {subtitle && (
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-[#9BAFA7] mt-0.5 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div
        className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 flex items-center ${
          checked ? 'bg-[#006D53] justify-end' : 'bg-slate-300 dark:bg-emerald-950 justify-start'
        }`}
      >
        <span className="w-5 h-5 rounded-full bg-white shadow-xs block transition-transform" />
      </div>
    </button>
  );

  return (
    <section
      aria-label={labels.pageTitle}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className="space-y-6 pb-12"
    >
      {/* Top Header Banner of Preferences */}
      <div className="p-5 sm:p-7 rounded-3xl bg-[#FBF8F1] dark:bg-[#082019] border border-emerald-900/10 dark:border-emerald-800/40 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#006D53] dark:text-[#F4B900]">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Hidaya Sanctuary</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-emerald-950 dark:text-[#F5F7F2]">
            {labels.pageTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#9BAFA7] max-w-2xl">
            {labels.pageSub}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="min-h-[42px] px-3.5 py-2 rounded-xl border border-emerald-900/15 dark:border-emerald-800/40 text-xs font-semibold text-slate-600 dark:text-[#9BAFA7] hover:text-emerald-950 dark:hover:text-white inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{labels.resetBtn}</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="min-h-[42px] px-5 py-2.5 rounded-xl bg-[#006D53] hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs inline-flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{labels.backBtn}</span>
            </button>
          )}
        </div>
      </div>

      {/* SECTION 1: LANGUAGE, THEME & LG TV / FULLSCREEN MODE */}
      <div className="p-5 sm:p-7 rounded-3xl bg-[#FBF8F1] dark:bg-[#082019] border border-emerald-900/10 dark:border-emerald-800/40 shadow-xs space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#006D53]/15 dark:bg-[#0C2920] flex items-center justify-center text-[#006D53] dark:text-[#F4B900] shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-emerald-950 dark:text-[#F5F7F2]">
              {labels.sec1Title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#9BAFA7] mt-0.5">{labels.sec1Sub}</p>
          </div>
        </div>

        {/* Language Grid */}
        <div className="space-y-2">
          <span className="block text-xs font-bold text-emerald-900 dark:text-emerald-300">
            {labels.langLabel}
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {LANGUAGE_OPTIONS.map((opt) => {
              const active = language === opt.code;
              return (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => onLanguageChange?.(opt.code)}
                  aria-pressed={active}
                  className={`min-h-[48px] px-4 py-2.5 rounded-2xl border text-start transition-all flex items-center justify-between cursor-pointer ${
                    active
                      ? 'bg-[#006D53] text-white border-[#006D53] font-bold shadow-xs'
                      : 'bg-[#F7F0E2] dark:bg-[#0C2920] border-emerald-900/10 dark:border-emerald-800/40 text-emerald-950 dark:text-[#F5F7F2] hover:border-[#006D53]'
                  }`}
                >
                  <div>
                    <div className="text-sm font-bold">{opt.native}</div>
                    <div className={`text-[11px] ${active ? 'text-emerald-100' : 'text-slate-500 dark:text-[#9BAFA7]'}`}>
                      {opt.label}
                    </div>
                  </div>
                  {active && <Check className="w-4 h-4 text-[#F4B900] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Theme & High Contrast */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => isDark && onToggleDark?.()}
            aria-pressed={!isDark}
            className={`min-h-[48px] px-4 py-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
              !isDark
                ? 'bg-[#006D53] text-white border-[#006D53] font-bold'
                : 'bg-[#F7F0E2] dark:bg-[#0C2920] border-emerald-900/10 dark:border-emerald-800/40 text-emerald-950 dark:text-[#F5F7F2]'
            }`}
          >
            <span className="inline-flex items-center gap-2 text-xs sm:text-sm">
              <Sun className="w-4 h-4 text-[#F4B900]" />
              <span>{labels.lightMode}</span>
            </span>
            {!isDark && <Check className="w-4 h-4 text-[#F4B900]" />}
          </button>

          <button
            type="button"
            onClick={() => !isDark && onToggleDark?.()}
            aria-pressed={isDark}
            className={`min-h-[48px] px-4 py-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
              isDark
                ? 'bg-[#006D53] text-white border-[#006D53] font-bold'
                : 'bg-[#F7F0E2] dark:bg-[#0C2920] border-emerald-900/10 dark:border-emerald-800/40 text-emerald-950 dark:text-[#F5F7F2]'
            }`}
          >
            <span className="inline-flex items-center gap-2 text-xs sm:text-sm">
              <Moon className="w-4 h-4 text-[#F4B900]" />
              <span>{labels.darkMode}</span>
            </span>
            {isDark && <Check className="w-4 h-4 text-[#F4B900]" />}
          </button>

          <button
            type="button"
            onClick={onToggleHighContrast}
            aria-pressed={isHighContrast}
            className={`min-h-[48px] px-4 py-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
              isHighContrast
                ? 'bg-[#006D53] text-white border-[#006D53] font-bold'
                : 'bg-[#F7F0E2] dark:bg-[#0C2920] border-emerald-900/10 dark:border-emerald-800/40 text-emerald-950 dark:text-[#F5F7F2]'
            }`}
          >
            <span className="text-xs sm:text-sm">{labels.highContrast}</span>
            {isHighContrast && <Check className="w-4 h-4 text-[#F4B900]" />}
          </button>
        </div>

        {/* Dedicated TV Screen / Fullscreen Sanctuary Mode Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#F7F0E2] dark:bg-[#0C2920] border border-amber-500/30 dark:border-[#F4B900]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
            className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 shrink-0 cursor-pointer transition-all ${
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
      </div>

      {/* SECTION 2: AUDIO EXPERIENCE & VIDEO-STYLE AUTO-PLAY ON SWIPE */}
      <div className="p-5 sm:p-7 rounded-3xl bg-[#FBF8F1] dark:bg-[#082019] border border-emerald-900/10 dark:border-emerald-800/40 shadow-xs space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#006D53]/15 dark:bg-[#0C2920] flex items-center justify-center text-[#006D53] dark:text-[#F4B900] shrink-0">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-emerald-950 dark:text-[#F5F7F2]">
              {labels.sec2Title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#9BAFA7] mt-0.5">{labels.sec2Sub}</p>
          </div>
        </div>

        {/* Auto-Play on Swipe Toggle */}
        {renderToggleRow(
          prefs.autoPlayOnSwipe,
          () => updatePref({ autoPlayOnSwipe: !prefs.autoPlayOnSwipe }),
          labels.autoSwipeTitle,
          labels.autoSwipeDesc,
          <Play className="w-4 h-4" />
        )}

        {/* Default Audio Phases Included */}
        <div className="space-y-2">
          <span className="block text-xs font-bold text-emerald-900 dark:text-emerald-300">
            {labels.defaultPhasesTitle}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {renderToggleRow(
              prefs.includeRecitationByDefault,
              () => updatePref({ includeRecitationByDefault: !prefs.includeRecitationByDefault }),
              labels.phaseRecitation
            )}
            {renderToggleRow(
              prefs.includeTranslationByDefault,
              () => updatePref({ includeTranslationByDefault: !prefs.includeTranslationByDefault }),
              labels.phaseTranslation
            )}
            {renderToggleRow(
              prefs.includeTafsirByDefault,
              () => updatePref({ includeTafsirByDefault: !prefs.includeTafsirByDefault }),
              labels.phaseTafsir
            )}
          </div>
        </div>

        {/* End of Verse Behavior: Auto-Advance vs Loop */}
        <div className="space-y-2">
          <span className="block text-xs font-bold text-emerald-900 dark:text-emerald-300">
            {labels.afterVerseTitle}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => updatePref({ loopVerse: false })}
              aria-pressed={!prefs.loopVerse}
              className={`min-h-[48px] px-4 py-3 rounded-2xl border flex items-center justify-between text-start cursor-pointer transition-all ${
                !prefs.loopVerse
                  ? 'bg-[#006D53] text-white border-[#006D53] font-bold shadow-xs'
                  : 'bg-[#F7F0E2] dark:bg-[#0C2920] border-emerald-900/10 dark:border-emerald-800/40 text-emerald-950 dark:text-[#F5F7F2]'
              }`}
            >
              <span className="text-xs sm:text-sm">{labels.nextVerseOpt}</span>
              {!prefs.loopVerse && <Check className="w-4 h-4 text-[#F4B900] shrink-0" />}
            </button>

            <button
              type="button"
              onClick={() => updatePref({ loopVerse: true })}
              aria-pressed={prefs.loopVerse}
              className={`min-h-[48px] px-4 py-3 rounded-2xl border flex items-center justify-between text-start cursor-pointer transition-all ${
                prefs.loopVerse
                  ? 'bg-[#006D53] text-white border-[#006D53] font-bold shadow-xs'
                  : 'bg-[#F7F0E2] dark:bg-[#0C2920] border-emerald-900/10 dark:border-emerald-800/40 text-emerald-950 dark:text-[#F5F7F2]'
              }`}
            >
              <span className="inline-flex items-center gap-2 text-xs sm:text-sm">
                <Repeat className="w-4 h-4 text-[#F4B900]" />
                <span>{labels.loopVerseOpt}</span>
              </span>
              {prefs.loopVerse && <Check className="w-4 h-4 text-[#F4B900] shrink-0" />}
            </button>
          </div>
        </div>

        {/* Reciter & Preferred Scholar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="space-y-2">
            <span className="block text-xs font-bold text-emerald-900 dark:text-emerald-300">
              {labels.reciterLabel}
            </span>
            <div className="space-y-1.5">
              {AVAILABLE_RECITERS.map((r) => {
                const active = r.id === reciterId;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleReciterSelect(r.id)}
                    aria-pressed={active}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-start flex items-center justify-between cursor-pointer transition-all ${
                      active
                        ? 'bg-[#006D53] text-white border-[#006D53] font-bold'
                        : 'bg-[#F7F0E2] dark:bg-[#0C2920] border-emerald-900/10 dark:border-emerald-800/40 text-emerald-950 dark:text-[#F5F7F2]'
                    }`}
                  >
                    <div>
                      <div className="text-xs sm:text-sm font-semibold">{r.name}</div>
                      <div className={`text-[11px] ${active ? 'text-emerald-100' : 'text-slate-500 dark:text-[#9BAFA7]'}`}>
                        {r.subname} · {r.style}
                      </div>
                    </div>
                    {active && <Check className="w-4 h-4 text-[#F4B900] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <span className="block text-xs font-bold text-emerald-900 dark:text-emerald-300">
              {labels.scholarLabel}
            </span>
            <div className="space-y-1.5">
              {SCHOLARS.map((s) => {
                const active = preferredScholar === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onPreferredScholarChange?.(s.id)}
                    aria-pressed={active}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-start flex items-center justify-between cursor-pointer transition-all ${
                      active
                        ? 'bg-[#006D53] text-white border-[#006D53] font-bold'
                        : 'bg-[#F7F0E2] dark:bg-[#0C2920] border-emerald-900/10 dark:border-emerald-800/40 text-emerald-950 dark:text-[#F5F7F2]'
                    }`}
                  >
                    <div>
                      <div className="text-xs sm:text-sm font-semibold">{s.label}</div>
                      <div className={`text-[11px] ${active ? 'text-emerald-100' : 'text-slate-500 dark:text-[#9BAFA7]'}`}>
                        {s.sub[language]}
                      </div>
                    </div>
                    {active && <Check className="w-4 h-4 text-[#F4B900] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: UNIVERSAL VERSE CARD CUSTOMIZATION */}
      <div className="p-5 sm:p-7 rounded-3xl bg-[#FBF8F1] dark:bg-[#082019] border border-emerald-900/10 dark:border-emerald-800/40 shadow-xs space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#006D53]/15 dark:bg-[#0C2920] flex items-center justify-center text-[#006D53] dark:text-[#F4B900] shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-emerald-950 dark:text-[#F5F7F2]">
              {labels.sec3Title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#9BAFA7] mt-0.5">{labels.sec3Sub}</p>
          </div>
        </div>

        {/* Font Scales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-[#F7F0E2] dark:bg-[#0C2920] border border-emerald-900/10 dark:border-emerald-800/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-950 dark:text-[#F5F7F2]">
              <span className="inline-flex items-center gap-1.5">
                <Type className="w-4 h-4 text-[#006D53] dark:text-[#F4B900]" />
                <span>{labels.arabicSize}</span>
              </span>
              <span className="font-mono tabular-nums">{Math.round(arabicScale * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.9}
              max={1.7}
              step={0.05}
              value={arabicScale}
              onChange={(e) => onArabicScaleChange(parseFloat(e.target.value))}
              className="w-full accent-[#006D53] cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-2xl bg-[#F7F0E2] dark:bg-[#0C2920] border border-emerald-900/10 dark:border-emerald-800/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-950 dark:text-[#F5F7F2]">
              <span className="inline-flex items-center gap-1.5">
                <Type className="w-4 h-4 text-[#006D53] dark:text-[#F4B900]" />
                <span>{labels.readingSize}</span>
              </span>
              <span className="font-mono tabular-nums">{Math.round(readingScale * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.85}
              max={1.5}
              step={0.05}
              value={readingScale}
              onChange={(e) => onReadingScaleChange?.(parseFloat(e.target.value))}
              className="w-full accent-[#006D53] cursor-pointer"
            />
          </div>
        </div>

        {/* Card Layer Visibility Checkboxes */}
        <div className="space-y-2">
          <span className="block text-xs font-bold text-emerald-900 dark:text-emerald-300">
            {labels.cardLayersLabel}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {renderToggleRow(
              prefs.showTransliteration,
              () => updatePref({ showTransliteration: !prefs.showTransliteration }),
              labels.layerTranslit
            )}
            {renderToggleRow(
              prefs.showTranslation,
              () => updatePref({ showTranslation: !prefs.showTranslation }),
              labels.layerTranslation
            )}
            {renderToggleRow(
              prefs.showTafsirByDefault,
              () => updatePref({ showTafsirByDefault: !prefs.showTafsirByDefault }),
              labels.layerTafsir,
              undefined,
              <BookOpen className="w-4 h-4" />
            )}
            {renderToggleRow(
              prefs.showSocialComments,
              () => updatePref({ showSocialComments: !prefs.showSocialComments }),
              labels.layerComments,
              undefined,
              <MessageCircle className="w-4 h-4" />
            )}
            {renderToggleRow(
              prefs.showCreationStudio,
              () => updatePref({ showCreationStudio: !prefs.showCreationStudio }),
              labels.layerStudio,
              undefined,
              <Film className="w-4 h-4" />
            )}
            {renderToggleRow(
              prefs.showRootImagery,
              () => updatePref({ showRootImagery: !prefs.showRootImagery }),
              labels.layerRoots,
              undefined,
              <Sparkles className="w-4 h-4" />
            )}
            {renderToggleRow(
              prefs.showAudioSourceBadge,
              () => updatePref({ showAudioSourceBadge: !prefs.showAudioSourceBadge }),
              labels.layerAudioBadge
            )}
          </div>
        </div>
      </div>

      {/* SECTION 4: READER PROFILE */}
      <div className="p-5 sm:p-7 rounded-3xl bg-[#FBF8F1] dark:bg-[#082019] border border-emerald-900/10 dark:border-emerald-800/40 shadow-xs space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#006D53]/15 dark:bg-[#0C2920] flex items-center justify-center text-[#006D53] dark:text-[#F4B900] shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-emerald-950 dark:text-[#F5F7F2]">
              {labels.sec4Title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#9BAFA7] mt-0.5">{labels.sec4Sub}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {profileLabels.map((prof) => {
            const active = readerProfile === prof.id;
            return (
              <button
                key={prof.id}
                type="button"
                onClick={() => onReaderProfileChange?.(prof.id)}
                aria-pressed={active}
                className={`p-4 rounded-2xl border text-start transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  active
                    ? 'bg-[#006D53] text-white border-[#006D53] shadow-xs'
                    : 'bg-[#F7F0E2] dark:bg-[#0C2920] border-emerald-900/10 dark:border-emerald-800/40 text-emerald-950 dark:text-[#F5F7F2]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-bold">{prof.title}</span>
                  {active && <Check className="w-4 h-4 text-[#F4B900]" />}
                </div>
                <span className={`text-xs ${active ? 'text-emerald-100' : 'text-slate-500 dark:text-[#9BAFA7]'}`}>
                  {prof.sub}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 5: OFFLINE STORAGE & IPHONE BACKGROUND CONTINUITY */}
      <div className="p-5 sm:p-7 rounded-3xl bg-[#FBF8F1] dark:bg-[#082019] border border-emerald-900/10 dark:border-emerald-800/40 shadow-xs space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#006D53]/15 dark:bg-[#0C2920] flex items-center justify-center text-[#006D53] dark:text-[#F4B900] shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-emerald-950 dark:text-[#F5F7F2]">
              {labels.sec5Title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#9BAFA7] mt-0.5">{labels.sec5Sub}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleCacheBookmarkedAudio}
            disabled={isCachingBookmarks}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#006D53] hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {cachedSuccess ? <Check className="w-4 h-4 text-[#F4B900]" /> : <Download className="w-4 h-4" />}
            <span>{cachedSuccess ? labels.cachedDone : labels.cacheBookmarksBtn}</span>
          </button>

          <button
            type="button"
            onClick={() => void OfflineCacheService.clearAudioCache()}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#F7F0E2] dark:bg-[#0C2920] border border-emerald-900/15 dark:border-emerald-800/40 text-xs font-semibold text-slate-700 dark:text-[#9BAFA7] hover:text-red-600 inline-flex items-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>{labels.clearCacheBtn}</span>
          </button>
        </div>
      </div>
    </section>
  );
};
