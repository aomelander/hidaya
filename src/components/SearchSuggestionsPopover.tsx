"use client";

/**
 * @file src/components/SearchSuggestionsPopover.tsx
 * @description Universal Search & Navigation Dropdown Popover.
 * Provides filter tabs (Tout, Coran, Favoris, Commentaires),
 * 18 structured life-situation & spiritual themes categorized by theme,
 * instant search across indexed verses, bookmarks, reflections/comments,
 * and the complete canonical index of all 114 Surahs with number, name, translation, and ayah count.
 * Fully localized across FR, EN, SV, AR.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Bookmark,
  MessageSquare,
  Search,
  Compass,
  Flame,
  Heart,
  Shield,
  Users,
  Smile,
  HelpCircle,
  Feather,
  HeartCrack,
  Activity,
  SunDim,
  GraduationCap,
  RefreshCw,
  ShieldAlert,
  Scale,
  ShieldCheck,
  Footprints,
  MessageSquareOff,
} from 'lucide-react';
import { Language, QuickPill, QuranVerseFixture } from '../types';
import { getTodayNorthStar, getLocalizedText } from '../data/dailyNorthStar';
import { QUICK_CHOICE_PILLS, QURAN_FIXTURES } from '../data/quranFixtures';
import { SURAH_CATALOG, SurahCatalogItem } from '../data/surahCatalog';
import { StorageService } from '../services/storage';
import { AyahCartouche } from './AyahCartouche';

export type SearchFilterTab = 'all' | 'quran' | 'favorites' | 'comments';

export interface SearchSuggestionsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  searchQuery?: string;
  onSelectQuery: (query: string) => void;
  onSelectPill?: (pill: QuickPill) => void;
  onSelectTodayFocus?: (passageId: string) => void;
  onSelectSurah?: (surahNumber: number, ayahNumber?: number) => void;
  onSelectBookmark?: (verseId: string) => void;
}

// 18 Curated Themes Categorized (Moment, Questions, Character/Growth)
const EXTENDED_18_THEMES: {
  category: 'moment' | 'questions' | 'growth';
  pills: {
    id: string;
    label: Record<Language, string>;
    query: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}[] = [
  {
    category: 'moment',
    pills: [
      {
        id: 'anger-work',
        label: { fr: 'Colère & Conflit', en: 'Anger & Conflict', sv: 'Vrede & Konflikt', ar: 'الغضب وضبط النفس' },
        query: 'Anger at work, dealing with unfair colleagues and hot temper',
        icon: Flame,
      },
      {
        id: 'burnout-anxiety',
        label: { fr: 'Épuisement & Charge mentale', en: 'Burnout & Overwhelm', sv: 'Utbrändhet & Stress', ar: 'الإرهاق والضيق' },
        query: 'Feeling overwhelmed by deadlines, exhausted by burdens, finding relief',
        icon: Feather,
      },
      {
        id: 'restless-heart',
        label: { fr: 'Cœur agité & Anxiété', en: 'Restless Heart & Anxiety', sv: 'Oroligt hjärta & Ångest', ar: 'طمأنينة القلب والسكينة' },
        query: 'Restless heart, racing thoughts, panic, need for stillness and peace',
        icon: Activity,
      },
      {
        id: 'grief-loss',
        label: { fr: 'Deuil & Épreuve soudaine', en: 'Grief & Loss', sv: 'Sorg & Förlust', ar: 'الحزن والمصيبة' },
        query: 'Dealing with grief, loss of a loved one, bereavement, staying patient',
        icon: HeartCrack,
      },
      {
        id: 'lonely-abandoned',
        label: { fr: 'Solitude & Sentiment d’abandon', en: 'Loneliness & Low Spirits', sv: 'Ensamhet & Nedstämdhet', ar: 'الوحشة ودفء المعية' },
        query: 'Feeling lonely, depressed, feeling like God has abandoned me',
        icon: SunDim,
      },
      {
        id: 'gratitude-joy',
        label: { fr: 'Gratitude & Joie', en: 'Gratitude & Abundance', sv: 'Tacksamhet & Glädje', ar: 'شكر النعمة والفرح' },
        query: 'Feeling grateful, appreciating blessings, multiplying joy',
        icon: Sparkles,
      },
      {
        id: 'career-decisions',
        label: { fr: 'Choix de vie & Tawakkul', en: 'Life Decisions & Trust', sv: 'Livsbeslut & Tillit', ar: 'التوكل والقرارات الكبرى' },
        query: 'Facing big career decision, fear of poverty, need tawakkul and guidance',
        icon: Compass,
      },
      {
        id: 'exams-future',
        label: { fr: 'Examens & Avenir', en: 'Exams & Future Pressure', sv: 'Prov & Framtidspress', ar: 'الاختبارات والمستقبل' },
        query: 'School exams stress, university choices, fear of failure, need calm heart and tawakkul',
        icon: GraduationCap,
      },
    ],
  },
  {
    category: 'questions',
    pills: [
      {
        id: 'purpose-existence',
        label: { fr: 'Sens de la vie & Existence', en: 'Purpose of Life', sv: 'Livets mening', ar: 'غاية الوجود والرسالة' },
        query: 'Why did God create life and death? What is the purpose of human existence?',
        icon: HelpCircle,
      },
      {
        id: 'suffering-tragedy',
        label: { fr: 'Sens de la souffrance & Destin', en: 'Meaning of Suffering', sv: 'Meningen med lidande', ar: 'الحكمة في البلاء والقدر' },
        query: 'Why do bad things happen? Dealing with regret and missed opportunities',
        icon: ShieldAlert,
      },
      {
        id: 'justice-oppression',
        label: { fr: 'Justice face à l’injustice', en: 'Justice vs Injustice', sv: 'Rättvisa mot orättvisa', ar: 'العدل الإلهي ونصرة المظلوم' },
        query: 'Seeing corruption and tyranny, questioning cosmic justice and moral balance',
        icon: Scale,
      },
      {
        id: 'guilt-regret',
        label: { fr: 'Culpabilité & Repentir sincère', en: 'Guilt & Repentance', sv: 'Skuldkänslor & Ånger', ar: 'التوبة الصادقة ومحو الذنب' },
        query: 'Guilt over mistakes, past sins, need repentance and clean slate',
        icon: RefreshCw,
      },
    ],
  },
  {
    category: 'growth',
    pills: [
      {
        id: 'responding-to-hostility',
        label: { fr: 'Face aux provocations & hostilité', en: 'Responding to Hostility', sv: 'Bemöta fientlighet', ar: 'الدفع بالتي هي أحسن' },
        query: 'How to deal with enemies, insults, workplace bullies with dignity',
        icon: ShieldCheck,
      },
      {
        id: 'humility-daily-life',
        label: { fr: 'Humilité & Douceur quotidienne', en: 'Humility in Daily Life', sv: 'Ödmjukhet i vardagen', ar: 'التواضع والسكينة' },
        query: 'Walking with humility, dealing with internet arguments and rude people',
        icon: Footprints,
      },
      {
        id: 'family-patience',
        label: { fr: 'Patience parents & famille', en: 'Patience with Family', sv: 'Tålamod med familjen', ar: 'بر الوالدين وصلة الرحم' },
        query: 'Dealing with elderly parents, family frustration, honoring mother and father',
        icon: Users,
      },
      {
        id: 'purifying-speech',
        label: { fr: 'Garde de la langue & Médisance', en: 'Purifying Speech', sv: 'Rena sitt tal', ar: 'حفظ اللسان واجتناب الظن' },
        query: 'Overcoming gossip, backbiting, negative assumptions about others',
        icon: MessageSquareOff,
      },
      {
        id: 'peer-pressure',
        label: { fr: 'Courage & Pression sociale', en: 'Courage & Peer Pressure', sv: 'Mod & Grupptryck', ar: 'الثبات والشجاعة الأدبية' },
        query: 'Standing up to peer pressure, mockery at school, staying true to good values with kindness',
        icon: Shield,
      },
      {
        id: 'giving-charity',
        label: { fr: 'Générosité & Détachement', en: 'Charity & Generosity', sv: 'Generositet & Välgörenhet', ar: 'الإنفاق في السراء والضراء' },
        query: 'Spending in ease and hardship, purifying wealth, generosity',
        icon: Heart,
      },
    ],
  },
];

const UI_STRINGS: Record<
  Language,
  {
    tabAll: string;
    tabQuran: string;
    tabFavorites: string;
    tabComments: string;
    todayFocusBadge: string;
    todayFocusDesc: string;
    quickTopicsBadge: string;
    quickTopicsDesc: string;
    catMoment: string;
    catQuestions: string;
    catGrowth: string;
    surahIndexTitle: string;
    surahIndexDesc: string;
    searchHint: string;
    closeBtn: string;
    noResults: string;
    versesFound: string;
    bookmarksFound: string;
    commentsFound: string;
    surahsFound: string;
    verseWord: string;
    emptyBookmarks: string;
    emptyComments: string;
  }
> = {
  fr: {
    tabAll: 'Tout',
    tabQuran: 'Coran',
    tabFavorites: 'Favoris ♥',
    tabComments: 'Commentaires 💬',
    todayFocusBadge: "🌟 Ancrage du Jour · Today's Focus",
    todayFocusDesc: 'Le passage spirituel recommandé pour votre journée',
    quickTopicsBadge: '🏷️ 18 Thèmes Clés de Situation de Vie',
    quickTopicsDesc: 'Choisissez une émotion ou une question de vie pour déployer les versets',
    catMoment: 'En ce moment (Émotions & Urgence)',
    catQuestions: 'Grandes Questions & Épreuves',
    catGrowth: 'Caractère, Famille & Élévation',
    surahIndexTitle: '📖 Index Complet des 114 Sourates du Coran',
    surahIndexDesc: 'Naviguez directement dans une sourate avec son numéro, nom et traduction',
    searchHint: '💡 Vous pouvez chercher par numéro (ex. 2:255, 17:23), mot-clé, sourate ou réflexion personnelle.',
    closeBtn: 'Fermer ✕',
    noResults: 'Aucun résultat correspondant dans cette catégorie',
    versesFound: 'Passages coraniques',
    bookmarksFound: 'Versets enregistrés dans vos favoris',
    commentsFound: 'Vos réflexions & commentaires',
    surahsFound: 'Sourates trouvées',
    verseWord: 'versets',
    emptyBookmarks: 'Aucun verset favori pour le moment. Cliquez sur le ♥ d’un verset pour l’ajouter ici.',
    emptyComments: 'Aucun commentaire rédigé pour le moment. Partagez une réflexion sous un verset pour la retrouver ici.',
  },
  en: {
    tabAll: 'All',
    tabQuran: 'Quran',
    tabFavorites: 'Favorites ♥',
    tabComments: 'Comments 💬',
    todayFocusBadge: "🌟 Today's Focus Anchor",
    todayFocusDesc: 'Recommended spiritual passage for your day',
    quickTopicsBadge: '🏷️ 18 Life Situation & Reflection Themes',
    quickTopicsDesc: 'Select an emotion or life question to reveal matching verses',
    catMoment: 'In This Moment (Emotions & Urgency)',
    catQuestions: 'Big Questions & Trials',
    catGrowth: 'Character, Family & Growth',
    surahIndexTitle: '📖 Complete 114 Surahs Index',
    surahIndexDesc: 'Navigate directly to any Surah with number, name, and English meaning',
    searchHint: '💡 Search by Ayah reference (e.g. 2:255, 17:23), keyword, Surah name, or personal notes.',
    closeBtn: 'Close ✕',
    noResults: 'No matching results found in this category',
    versesFound: 'Quranic Passages',
    bookmarksFound: 'Bookmarked Verses',
    commentsFound: 'Your Reflections & Comments',
    surahsFound: 'Surahs Found',
    verseWord: 'verses',
    emptyBookmarks: 'No bookmarked verses yet. Tap the ♥ on any verse to save it here.',
    emptyComments: 'No reflections yet. Add a note or prayer under a verse to see it here.',
  },
  sv: {
    tabAll: 'Alla',
    tabQuran: 'Koranen',
    tabFavorites: 'Favoriter ♥',
    tabComments: 'Kommentarer 💬',
    todayFocusBadge: '🌟 Dagens fokus · Ledstjärna',
    todayFocusDesc: 'Rekommenderad Quran-passage för din dag',
    quickTopicsBadge: '🏷️ 18 Livssituationer & Teman',
    quickTopicsDesc: 'Välj en känsla eller livsfråga för att utforska relevanta verser',
    catMoment: 'I detta ögonblick (Känslor & Behov)',
    catQuestions: 'Stora frågor & Prövningar',
    catGrowth: 'Karaktär, Familj & Utveckling',
    surahIndexTitle: '📖 Fullständigt index över Koranen (114 suror)',
    surahIndexDesc: 'Navigera direkt till valfri sura med nummer, namn och svensk översättning',
    searchHint: '💡 Sök via versnummer (t.ex. 2:255, 17:23), sökord, sura eller egna anteckningar.',
    closeBtn: 'Stäng ✕',
    noResults: 'Inga matchande resultat i denna kategori',
    versesFound: 'Koranpassager',
    bookmarksFound: 'Sparade verser i favoriter',
    commentsFound: 'Dina reflektioner & anteckningar',
    surahsFound: 'Hittade suror',
    verseWord: 'verser',
    emptyBookmarks: 'Inga sparade verser än. Tryck på ♥ på en vers för att spara den här.',
    emptyComments: 'Inga sparade kommentarer än. Skriv en reflektion under en vers för att se den här.',
  },
  ar: {
    tabAll: 'الكل',
    tabQuran: 'القرآن الكريم',
    tabFavorites: 'المفضلة ♥',
    tabComments: 'الخواطر والتعليقات 💬',
    todayFocusBadge: "🌟 إشراقة اليوم التدبرية (Today's Focus)",
    todayFocusDesc: 'الآية الموصى بها لتكون بوصلة يومك ونور قلبك',
    quickTopicsBadge: '🏷️ ١٨ موضوعاً تدبرياً لمواقف الحياة',
    quickTopicsDesc: 'اختر مشاعرك أو موقفك الحياتي لتنساب الآيات أمامك',
    catMoment: 'في هذه اللحظة (المشاعر والسكينة)',
    catQuestions: 'الأسئلة الوجودية والابتلاء',
    catGrowth: 'الخلق والأسرة وتزكية النفس',
    surahIndexTitle: '📖 الفهرس الشامل لسور القرآن الكريم (١١٤ سورة)',
    surahIndexDesc: 'تصفح سور القرآن مباشرة برقم السورة واسمها وعدد آياتها',
    searchHint: '💡 يمكنك البحث برقم الآية (مثل 2:255 أو 17:23) أو بالكلمة أو باسم السورة أو بخواطرك الخاصة.',
    closeBtn: 'إغلاق ✕',
    noResults: 'لا توجد نتائج مطابقة في هذا التصنيف',
    versesFound: 'آيات قرآنية كريمة',
    bookmarksFound: 'الآيات المحفوظة في المفضلة',
    commentsFound: 'خواطرك وتأملاتك المدونة',
    surahsFound: 'السور المطابقة',
    verseWord: 'آيات',
    emptyBookmarks: 'لا توجد آيات في المفضلة بعد. انقر على رمز ♥ على أي آية لحفظها هنا.',
    emptyComments: 'لا توجد خواطر مسجلة بعد. دوّن تدبرك أسفل أي آية لتجده هنا.',
  },
};

export const SearchSuggestionsPopover: React.FC<SearchSuggestionsPopoverProps> = ({
  isOpen,
  onClose,
  language,
  searchQuery = '',
  onSelectQuery,
  onSelectPill,
  onSelectTodayFocus,
  onSelectSurah,
  onSelectBookmark,
}) => {
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const [activeTab, setActiveTab] = useState<SearchFilterTab>('all');
  const [localSearchInput, setLocalSearchInput] = useState('');

  const t = UI_STRINGS[language] || UI_STRINGS.en;
  const todayStar = getTodayNorthStar();
  const localizedTodayTheme = getLocalizedText(todayStar.theme, language);
  const localizedTodayTrans =
    todayStar.translations[language]?.text || todayStar.translations.en.text;

  // Retrieve user bookmarks & reflections
  const bookmarkedIds = useMemo(() => {
    if (!isOpen) return [];
    return StorageService.getBookmarks();
  }, [isOpen]);

  const userReflections = useMemo(() => {
    if (!isOpen) return {};
    return StorageService.getReflections();
  }, [isOpen]);

  // Query string to filter results
  const query = (localSearchInput || searchQuery || '').trim().toLowerCase();

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

  // Filter Surahs based on query
  const filteredSurahs = useMemo(() => {
    if (!query) return SURAH_CATALOG;
    return SURAH_CATALOG.filter((s) => {
      const numMatch = String(s.number) === query;
      const arabicMatch = s.nameArabic.includes(query);
      const translitMatch = s.nameTransliterated.toLowerCase().includes(query);
      const meaningMatch = Object.values(s.meaning).some((m) => m.toLowerCase().includes(query));
      return numMatch || arabicMatch || translitMatch || meaningMatch;
    });
  }, [query]);

  // Filter Bookmarks based on query
  const filteredBookmarks = useMemo(() => {
    const list = bookmarkedIds
      .map((id) => {
        const fixture = QURAN_FIXTURES.find((f) => f.id === id);
        return { id, fixture };
      })
      .filter((item) => Boolean(item.fixture));

    if (!query) return list;
    return list.filter((item) => {
      const f = item.fixture!;
      const idMatch = f.id.toLowerCase().includes(query);
      const arabicMatch = f.arabicText.includes(query);
      const transMatch = Object.values(f.translations).some((t) => t.text.toLowerCase().includes(query));
      const surahMatch = f.surahNameTransliterated.toLowerCase().includes(query);
      return idMatch || arabicMatch || transMatch || surahMatch;
    });
  }, [bookmarkedIds, query]);

  // Filter Comments / Reflections based on query
  const filteredReflections = useMemo(() => {
    const entries = Object.entries(userReflections).map(([verseId, refl]) => {
      const fixture = QURAN_FIXTURES.find((f) => f.id === verseId);
      const text = [refl.understandNotes, refl.reflectNotes, refl.applyNotes, refl.liveNotes]
        .filter(Boolean)
        .join(' ');
      return { verseId, refl, fixture, text };
    }).filter((item) => item.text.trim().length > 0);

    if (!query) return entries;
    return entries.filter(
      (item) =>
        item.verseId.toLowerCase().includes(query) ||
        item.text.toLowerCase().includes(query) ||
        (item.fixture && item.fixture.surahNameTransliterated.toLowerCase().includes(query))
    );
  }, [userReflections, query]);

  // Filter Quran Fixtures for search
  const filteredQuranPassages = useMemo(() => {
    if (!query) return [];
    return QURAN_FIXTURES.filter((f) => {
      const idMatch = f.id.toLowerCase().includes(query);
      const arabicMatch = f.arabicText.includes(query);
      const surahMatch = f.surahNameTransliterated.toLowerCase().includes(query);
      const transMatch = Object.values(f.translations).some((t) => t.text.toLowerCase().includes(query));
      const topicMatch = f.topics.some((topic) => topic.toLowerCase().includes(query));
      return idMatch || arabicMatch || surahMatch || transMatch || topicMatch;
    }).slice(0, 6);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className="absolute top-full start-0 end-0 mt-2 z-50 w-full max-w-3xl mx-auto rounded-3xl bg-[#FAF8F5]/98 dark:bg-[#061B16]/98 backdrop-blur-xl border border-emerald-900/15 dark:border-emerald-800/40 shadow-2xl p-4 sm:p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 no-print max-h-[82vh] overflow-y-auto"
      role="dialog"
      aria-modal="false"
      aria-label="Universal search suggestions, bookmarks, comments, and Surah index"
    >
      {/* FILTER TABS: Tout, Coran, Favoris, Commentaires */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-emerald-950/5 dark:bg-[#0B3027] border border-emerald-900/10 dark:border-emerald-800/40 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          aria-pressed={activeTab === 'all'}
          className={`flex-1 min-w-[70px] py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap text-center ${
            activeTab === 'all'
              ? 'bg-[#006D53] text-white shadow-2xs'
              : 'text-slate-700 dark:text-[#9BAFA7] hover:text-emerald-950 dark:hover:text-[#F5F7F2]'
          }`}
        >
          {t.tabAll}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('quran')}
          aria-pressed={activeTab === 'quran'}
          className={`flex-1 min-w-[70px] py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap text-center inline-flex items-center justify-center gap-1.5 ${
            activeTab === 'quran'
              ? 'bg-[#006D53] text-white shadow-2xs'
              : 'text-slate-700 dark:text-[#9BAFA7] hover:text-emerald-950 dark:hover:text-[#F5F7F2]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 shrink-0" />
          <span>{t.tabQuran}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('favorites')}
          aria-pressed={activeTab === 'favorites'}
          className={`flex-1 min-w-[80px] py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap text-center inline-flex items-center justify-center gap-1.5 ${
            activeTab === 'favorites'
              ? 'bg-[#006D53] text-white shadow-2xs'
              : 'text-slate-700 dark:text-[#9BAFA7] hover:text-emerald-950 dark:hover:text-[#F5F7F2]'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5 shrink-0" />
          <span>{t.tabFavorites}</span>
          {bookmarkedIds.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-900 dark:text-[#F4B900]">
              {bookmarkedIds.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('comments')}
          aria-pressed={activeTab === 'comments'}
          className={`flex-1 min-w-[90px] py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap text-center inline-flex items-center justify-center gap-1.5 ${
            activeTab === 'comments'
              ? 'bg-[#006D53] text-white shadow-2xs'
              : 'text-slate-700 dark:text-[#9BAFA7] hover:text-emerald-950 dark:hover:text-[#F5F7F2]'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 shrink-0" />
          <span>{t.tabComments}</span>
        </button>
      </div>

      {/* QUICK IN-DROPDOWN FILTER INPUT IF QUERY NOT ENTERED */}
      <div className="relative">
        <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#9BAFA7]" />
        <input
          type="text"
          value={localSearchInput}
          onChange={(e) => setLocalSearchInput(e.target.value)}
          placeholder={
            activeTab === 'favorites'
              ? language === 'fr'
                ? 'Filtrer dans vos favoris...'
                : 'Filter within bookmarks...'
              : activeTab === 'comments'
              ? language === 'fr'
                ? 'Filtrer dans vos commentaires...'
                : 'Filter within reflections...'
              : activeTab === 'quran'
              ? language === 'fr'
                ? 'Chercher une sourate ou un verset...'
                : 'Search a surah or ayah...'
              : language === 'fr'
              ? 'Filtrer dans le Coran, les sourates, favoris et notes...'
              : 'Filter in Quran, Surahs, bookmarks and notes...'
          }
          className="w-full ps-9 pe-4 py-2 rounded-xl text-xs bg-white dark:bg-[#0B3027] border border-emerald-900/10 dark:border-emerald-800/35 text-slate-900 dark:text-[#F5F7F2] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006D53]"
        />
        {localSearchInput && (
          <button
            type="button"
            onClick={() => setLocalSearchInput('')}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {/* TAB: FAVORITES */}
      {activeTab === 'favorites' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-950 dark:text-[#F5F7F2] flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-[#F4B900]" />
              <span>{t.bookmarksFound}</span>
            </span>
            <span className="text-[11px] text-slate-500 dark:text-[#9BAFA7]">
              {filteredBookmarks.length} {language === 'fr' ? 'verset(s)' : 'verse(s)'}
            </span>
          </div>

          {filteredBookmarks.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-[#9BAFA7] py-4 text-center">
              {t.emptyBookmarks}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
              {filteredBookmarks.map(({ id, fixture }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    if (onSelectBookmark) {
                      onSelectBookmark(id);
                    } else {
                      onSelectQuery(id);
                    }
                    onClose();
                  }}
                  className="p-3 rounded-2xl bg-white dark:bg-[#0B3027] border border-amber-900/10 dark:border-emerald-800/40 hover:border-[#006D53] text-start transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-[#006D53] dark:text-[#F4B900]">
                      {id}
                    </span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-[#F5F7F2]">
                      {fixture?.surahNameTransliterated}
                    </span>
                  </div>
                  <p className="font-arabic text-xs text-emerald-900 dark:text-[#F4B900] truncate mt-1" dir="rtl">
                    {fixture?.arabicText}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: COMMENTS & REFLECTIONS */}
      {activeTab === 'comments' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-950 dark:text-[#F5F7F2] flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#006D53] dark:text-[#F4B900]" />
              <span>{t.commentsFound}</span>
            </span>
            <span className="text-[11px] text-slate-500 dark:text-[#9BAFA7]">
              {filteredReflections.length} note(s)
            </span>
          </div>

          {filteredReflections.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-[#9BAFA7] py-4 text-center">
              {t.emptyComments}
            </p>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {filteredReflections.map(({ verseId, text, fixture }) => (
                <button
                  key={verseId}
                  type="button"
                  onClick={() => {
                    onSelectQuery(verseId);
                    onClose();
                  }}
                  className="w-full p-3 rounded-2xl bg-white dark:bg-[#0B3027] border border-emerald-900/10 dark:border-emerald-800/40 hover:border-[#006D53] text-start transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-[#006D53] dark:text-[#F4B900]">
                      {verseId} {fixture ? `· ${fixture.surahNameTransliterated}` : ''}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-[#9BAFA7] line-clamp-2 italic">
                    &ldquo;{text}&rdquo;
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: ALL or QURAN */}
      {(activeTab === 'all' || activeTab === 'quran') && (
        <>
          {/* SECTION 1: TODAY'S FOCUS (Shown in 'all') */}
          {activeTab === 'all' && !query && (
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
          )}

          {/* PASSAGES MATCHING QUERY */}
          {query && filteredQuranPassages.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-950 dark:text-[#F5F7F2] flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#006D53] dark:text-[#F4B900]" />
                <span>{t.versesFound}</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredQuranPassages.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      onSelectQuery(f.id);
                      onClose();
                    }}
                    className="p-3 rounded-2xl bg-white dark:bg-[#0B3027] border border-emerald-900/10 dark:border-emerald-800/40 hover:border-[#006D53] text-start transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-[#006D53] dark:text-[#F4B900]">
                        {f.id}
                      </span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-[#F5F7F2]">
                        {f.surahNameTransliterated}
                      </span>
                    </div>
                    <p className="font-arabic text-xs text-emerald-900 dark:text-[#F4B900] truncate mt-1" dir="rtl">
                      {f.arabicText}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: 18 QUICK THEMES CATEGORIZED (Shown in 'all') */}
          {activeTab === 'all' && (
            <div className="space-y-3 pt-1">
              <div>
                <span className="text-xs font-bold text-emerald-950 dark:text-[#F5F7F2] block">
                  {t.quickTopicsBadge}
                </span>
                <p className="text-[11px] text-slate-500 dark:text-[#9BAFA7]">
                  {t.quickTopicsDesc}
                </p>
              </div>

              {EXTENDED_18_THEMES.map((catGroup) => {
                const categoryTitle =
                  catGroup.category === 'moment'
                    ? t.catMoment
                    : catGroup.category === 'questions'
                    ? t.catQuestions
                    : t.catGrowth;

                return (
                  <div key={catGroup.category} className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800/80 dark:text-[#F4B900]/80">
                      {categoryTitle}
                    </span>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {catGroup.pills.map((pill) => {
                        const IconComponent = pill.icon;
                        const labelText = pill.label[language] || pill.label.en;
                        return (
                          <button
                            key={pill.id}
                            type="button"
                            onClick={() => {
                              onSelectQuery(pill.query);
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-[#0B3027] border border-emerald-900/10 dark:border-emerald-800/40 text-slate-800 dark:text-[#F5F7F2] hover:bg-[#006D53] hover:text-white dark:hover:bg-[#006D53] dark:hover:text-white hover:border-[#006D53] transition-all cursor-pointer shadow-2xs inline-flex items-center gap-1.5"
                          >
                            <IconComponent className="w-3.5 h-3.5 shrink-0 opacity-80" />
                            <span>{labelText}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* SECTION 3: 114 SURAHS COMPLETE INDEX (Always presented at the bottom of the scroll container) */}
          <div className="space-y-2.5 pt-3 border-t border-emerald-900/10 dark:border-emerald-800/35">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-emerald-950 dark:text-[#F5F7F2] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#006D53] dark:text-[#F4B900]" />
                  <span>{t.surahIndexTitle}</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-[#9BAFA7]">
                  {t.surahIndexDesc}
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-400 dark:text-[#9BAFA7]">
                {filteredSurahs.length} / 114
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[360px] overflow-y-auto p-1">
              {filteredSurahs.map((surah) => {
                const localizedMeaning = surah.meaning[language] || surah.meaning.en;
                return (
                  <button
                    key={surah.number}
                    type="button"
                    onClick={() => {
                      if (onSelectSurah) {
                        onSelectSurah(surah.number, 1);
                      } else {
                        onSelectQuery(`Surah ${surah.number}`);
                      }
                      onClose();
                    }}
                    className="p-2.5 rounded-2xl bg-white dark:bg-[#0B3027] border border-emerald-900/10 dark:border-emerald-800/40 hover:border-[#006D53] dark:hover:border-[#F4B900] text-start transition-all cursor-pointer group flex items-center justify-between gap-2 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-7 h-7 rounded-lg bg-emerald-950/5 dark:bg-[#061B16] text-[#006D53] dark:text-[#F4B900] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {surah.number}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-emerald-950 dark:text-[#F5F7F2] truncate group-hover:text-[#006D53] dark:group-hover:text-[#F4B900]">
                          {surah.nameTransliterated}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-[#9BAFA7] truncate">
                          {localizedMeaning} · {surah.ayahCount} {t.verseWord}
                        </div>
                      </div>
                    </div>

                    <span className="font-arabic text-xs font-semibold text-emerald-900 dark:text-emerald-200 shrink-0" dir="rtl">
                      {surah.nameArabic}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* FOOTER: SEARCH HINT & CLOSE */}
      <div className="pt-2 border-t border-emerald-900/10 dark:border-emerald-800/30 flex items-center justify-between text-[11px] text-slate-500 dark:text-[#9BAFA7]">
        <span>{t.searchHint}</span>
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-semibold text-emerald-900 dark:text-[#F4B900] hover:underline cursor-pointer"
        >
          {t.closeBtn}
        </button>
      </div>
    </div>
  );
};
