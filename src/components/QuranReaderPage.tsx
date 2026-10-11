"use client";

/**
 * @file src/components/QuranReaderPage.tsx
 * @description Dedicated "Read the Quran" (Lire le Coran) sanctuary page matching the two-view design:
 * 1. Surah / Juz' / Bookmarks Browser with search & voice input ("Lire le Coran — Une lecture apaisée, avec sens et contexte")
 * 2. Focused Surah & Ayah Reader view with horizontal Ayah Cartouche strip (< [133] (134) [135] >),
 *    Juz'/Page/Hizb metadata bar, warm Mushaf Arabic reading surface (#F7F0E2) with embedded audio player,
 *    Translation & Tafsir tabs, Level 3/4 expandable cards, and Previous/Next verse navigation cards.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Sparkles,
  Copy,
  Check,
  Share2,
  ArrowLeft,
  X,
} from 'lucide-react';
import {
  Language,
  QuranVerseFixture,
  PreferredScholar,
  ReaderProfile,
} from '../types';
import { SURAH_CATALOG, getSurahMeta, SurahCatalogItem } from '../data/surahCatalog';
import { QURAN_FIXTURES } from '../data/quranFixtures';
import { getLocalizedVerseDetails } from '../data/localizedVerseContent';
import { AyahCartouche } from './AyahCartouche';
import { AudioPlayer, ActivePhase, AudioSourceTier } from './AudioPlayer';
import { StorageService } from '../services/storage';
import { ScholarProvenanceModal } from './ScholarProvenanceModal';

export interface QuranReaderTarget {
  surahNumber: number;
  ayahNumber: number;
}

interface QuranReaderPageProps {
  language: Language;
  arabicScale: number;
  readingScale: number;
  showTransliteration: boolean;
  bookmarks: string[];
  onToggleBookmark: (verseId: string) => void;
  preferredScholar: PreferredScholar;
  readerProfile?: ReaderProfile;
  initialTarget?: QuranReaderTarget | null;
  onTargetChange?: (target: QuranReaderTarget | null) => void;
  onOpenJournal?: () => void;
}

type BrowserTab = 'surahs' | 'juz' | 'bookmarks';
type ReaderBottomTab = 'translation' | 'tafsir' | 'reflection';

const READER_STRINGS: Record<
  Language,
  {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    surahsTab: string;
    juzTab: string;
    bookmarksTab: string;
    versesUnit: string;
    juzLabel: string;
    pageLabel: string;
    hizbLabel: string;
    level1Badge: string;
    level2Badge: string;
    level3Title: string;
    level3Sub: string;
    level4Title: string;
    level4Sub: string;
    translationTab: string;
    tafsirTab: string;
    reflectionTab: string;
    copyBtn: string;
    copiedBtn: string;
    shareBtn: string;
    addToJournalBtn: string;
    savedInJournalBtn: string;
    prevVerseLabel: string;
    nextVerseLabel: string;
    backToListLabel: string;
    loadingVerse: string;
    emptyBookmarks: string;
    reflectionPlaceholder: string;
    saveReflectionBtn: string;
    savedReflectionBtn: string;
    viewOriginalSource: string;
  }
> = {
  en: {
    title: 'Read the Quran',
    subtitle: 'A serene reading experience, with meaning and scholarly exegesis.',
    searchPlaceholder: 'Search a surah, verse (e.g. 3:134), or name...',
    surahsTab: 'Surahs',
    juzTab: "Juz'",
    bookmarksTab: 'Favorites',
    versesUnit: 'verses',
    juzLabel: "Juz'",
    pageLabel: 'Page',
    hizbLabel: 'Hizb',
    level1Badge: 'Level 1 · Verified Uthmani Arabic',
    level2Badge: 'Level 2 · Human Translation',
    level3Title: 'Level 3 · Classical Tafsir',
    level3Sub: "Ibn Kathir · Al-Sa'di · Al-Muyassar",
    level4Title: 'Level 4 · Personal Reflection',
    level4Sub: 'Contemplation · Notes · Action',
    translationTab: 'Translation',
    tafsirTab: 'Tafsir',
    reflectionTab: 'Reflection',
    copyBtn: 'Copy',
    copiedBtn: 'Copied',
    shareBtn: 'Share',
    addToJournalBtn: 'Save to Journal',
    savedInJournalBtn: 'Saved in Journal',
    prevVerseLabel: 'Previous verse',
    nextVerseLabel: 'Next verse',
    backToListLabel: 'Back to Surahs',
    loadingVerse: 'Loading verified verse...',
    emptyBookmarks: 'No favorite verses saved yet.',
    reflectionPlaceholder: 'Write your personal reflection or intention for this verse...',
    saveReflectionBtn: 'Save Reflection',
    savedReflectionBtn: 'Saved',
    viewOriginalSource: 'Original Arabic Source',
  },
  sv: {
    title: 'Läs Koranen',
    subtitle: 'En stillsam läsning med mening och klassisk tafsir.',
    searchPlaceholder: 'Sök efter en sura, vers (t.ex. 3:134) eller namn...',
    surahsTab: 'Suror',
    juzTab: "Juz'",
    bookmarksTab: 'Favoriter',
    versesUnit: 'verser',
    juzLabel: "Juz'",
    pageLabel: 'Sida',
    hizbLabel: 'Hizb',
    level1Badge: 'Nivå 1 · Verifierad arabisk text (Uthmani)',
    level2Badge: 'Nivå 2 · Mänsklig översättning',
    level3Title: 'Nivå 3 · Klassisk Tafsir',
    level3Sub: "Ibn Kathir · Al-Sa'di · Al-Muyassar",
    level4Title: 'Nivå 4 · Personlig reflektion',
    level4Sub: 'Eftertanke · Anteckningar · Handling',
    translationTab: 'Översättning',
    tafsirTab: 'Tafsir',
    reflectionTab: 'Reflektion',
    copyBtn: 'Kopiera',
    copiedBtn: 'Kopierad',
    shareBtn: 'Dela',
    addToJournalBtn: 'Spara i dagbok',
    savedInJournalBtn: 'Sparad i dagbok',
    prevVerseLabel: 'Föregående vers',
    nextVerseLabel: 'Nästa vers',
    backToListLabel: 'Tillbaka till suror',
    loadingVerse: 'Laddar verifierad vers...',
    emptyBookmarks: 'Inga sparade favoritverser ännu.',
    reflectionPlaceholder: 'Skriv din personliga reflektion kring denna vers...',
    saveReflectionBtn: 'Spara reflektion',
    savedReflectionBtn: 'Sparad',
    viewOriginalSource: 'Arabisk originalkälla',
  },
  fr: {
    title: 'Lire le Coran',
    subtitle: 'Une lecture apaisée, avec sens et exégèse classique.',
    searchPlaceholder: 'Rechercher une sourate, un verset (ex. 3:134)...',
    surahsTab: 'Sourates',
    juzTab: "Juz'",
    bookmarksTab: 'Favoris',
    versesUnit: 'versets',
    juzLabel: "Juz'",
    pageLabel: 'Page',
    hizbLabel: 'Hizb',
    level1Badge: 'Niveau 1 · Texte arabe (Uthmani vérifié)',
    level2Badge: 'Niveau 2 · Traduction humaine',
    level3Title: 'Niveau 3 · Tafsir classique',
    level3Sub: "Ibn Kathir · Al-Sa'di · Al-Muyassar",
    level4Title: 'Niveau 4 · Réflexion (guidance personnelle)',
    level4Sub: 'Questions · Méditation · Mise en pratique',
    translationTab: 'Traduction',
    tafsirTab: 'Tafsir',
    reflectionTab: 'Réflexion',
    copyBtn: 'Copier',
    copiedBtn: 'Copié',
    shareBtn: 'Partager',
    addToJournalBtn: 'Ajouter au journal',
    savedInJournalBtn: 'Ajouté au journal',
    prevVerseLabel: 'Verset précédent',
    nextVerseLabel: 'Verset suivant',
    backToListLabel: 'Retour aux sourates',
    loadingVerse: 'Chargement du verset vérifié...',
    emptyBookmarks: 'Aucun verset favori enregistré.',
    reflectionPlaceholder: 'Écrivez votre méditation personnelle sur ce verset...',
    saveReflectionBtn: 'Enregistrer la réflexion',
    savedReflectionBtn: 'Enregistré',
    viewOriginalSource: 'Source arabe originale',
  },
  ar: {
    title: 'قراءة القرآن الكريم',
    subtitle: 'تلاوة هادئة وتدبر في المعاني والتفسير المأثور.',
    searchPlaceholder: 'ابحث عن سورة أو آية (مثال: 3:134)...',
    surahsTab: 'السور',
    juzTab: 'الأجزاء',
    bookmarksTab: 'المفضلة',
    versesUnit: 'آيات',
    juzLabel: 'الجزء',
    pageLabel: 'صفحة',
    hizbLabel: 'حزب',
    level1Badge: 'المستوى ١ · النص القرآني بالرسم العثماني الموثق',
    level2Badge: 'المستوى ٢ · البيان والترجمة المعتمدة',
    level3Title: 'المستوى ٣ · التفسير المأثور',
    level3Sub: 'ابن كثير · السعدي · التفسير الميسر · الشعراوي',
    level4Title: 'المستوى ٤ · التدبر الشخصي',
    level4Sub: 'تأمل · تدوين · عمل صالح',
    translationTab: 'البيان',
    tafsirTab: 'التفسير',
    reflectionTab: 'التدبر',
    copyBtn: 'نسخ',
    copiedBtn: 'تم النسخ',
    shareBtn: 'مشاركة',
    addToJournalBtn: 'إضافة إلى يومياتي',
    savedInJournalBtn: 'محفوظة في يومياتي',
    prevVerseLabel: 'الآية السابقة',
    nextVerseLabel: 'الآية التالية',
    backToListLabel: 'العودة إلى فهرس السور',
    loadingVerse: 'جارٍ تحميل الآية الكريمة...',
    emptyBookmarks: 'لا توجد آيات محفوظة في المفضلة بعد.',
    reflectionPlaceholder: 'اكتب تدبرك الشخصي أو العمل الصالح المستفاد من الآية...',
    saveReflectionBtn: 'حفظ التدبر',
    savedReflectionBtn: 'تم الحفظ',
    viewOriginalSource: 'المصدر العربي الأصلي',
  },
};

export const QuranReaderPage: React.FC<QuranReaderPageProps> = ({
  language,
  arabicScale,
  readingScale,
  showTransliteration,
  bookmarks,
  onToggleBookmark,
  preferredScholar,
  readerProfile = 'adult',
  initialTarget = null,
  onTargetChange,
}) => {
  const t = READER_STRINGS[language] || READER_STRINGS.en;

  const [browserTab, setBrowserTab] = useState<BrowserTab>('surahs');
  const [searchFilter, setSearchFilter] = useState('');
  const [activeTarget, setActiveTarget] = useState<QuranReaderTarget | null>(initialTarget);

  // Loaded verse state in reader view
  const [currentVerse, setCurrentVerse] = useState<QuranVerseFixture | null>(null);
  const [pageMeta, setPageMeta] = useState<{ juz?: number; page?: number; hizbQuarter?: number }>({});
  const [isLoadingVerse, setIsLoadingVerse] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<ReaderBottomTab>('translation');
  const [selectedScholar, setSelectedScholar] = useState<string>(preferredScholar);
  const [copied, setCopied] = useState(false);
  const [reflectionText, setReflectionText] = useState('');
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [provenanceModalOpen, setProvenanceModalOpen] = useState(false);

  // Word-by-word highlighting & continuous multi-verse playback state
  const [playbackRatio, setPlaybackRatio] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [continuousReadPlaying, setContinuousReadPlaying] = useState(false);
  const [playbackPhase, setPlaybackPhase] = useState<ActivePhase>('idle');
  const [audioSources, setAudioSources] = useState<{
    translation: AudioSourceTier | null;
    tafsir: AudioSourceTier | null;
  }>({ translation: null, tafsir: null });

  // Section refs for smooth auto-scrolling to the part currently being read
  const arabicSectionRef = useRef<HTMLElement | null>(null);
  const translationSectionRef = useRef<HTMLDivElement | null>(null);
  const tafsirSectionRef = useRef<HTMLDivElement | null>(null);
  const lastScrolledPhaseRef = useRef<string>('');

  // Sync external initialTarget when clicked from VerseCard or NorthStar
  useEffect(() => {
    if (initialTarget) {
      setActiveTarget(initialTarget);
    }
  }, [initialTarget]);

  const openSurahAyah = useCallback(
    (surahNumber: number, ayahNumber: number = 1) => {
      const meta = getSurahMeta(surahNumber);
      const clampedAyah = Math.max(1, Math.min(meta.ayahCount, ayahNumber));
      const next = { surahNumber, ayahNumber: clampedAyah };
      setActiveTarget(next);
      onTargetChange?.(next);
      lastScrolledPhaseRef.current = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [onTargetChange]
  );

  // When playback phase changes (recitation -> translation -> tafsir), automatically show the corresponding tab and scroll the screen to see the part being read
  useEffect(() => {
    if (!isPlayingAudio || playbackPhase === 'idle') {
      if (!isPlayingAudio) {
        lastScrolledPhaseRef.current = '';
      }
      return;
    }

    const phaseKey = `${activeTarget?.surahNumber}:${activeTarget?.ayahNumber}:${playbackPhase}`;
    if (lastScrolledPhaseRef.current === phaseKey) return;
    lastScrolledPhaseRef.current = phaseKey;

    if (playbackPhase === 'recitation') {
      window.requestAnimationFrame(() => {
        arabicSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    } else if (playbackPhase === 'translation') {
      setActiveBottomTab('translation');
      setTimeout(() => {
        translationSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 90);
    } else if (playbackPhase === 'tafsir') {
      setActiveBottomTab('tafsir');
      setTimeout(() => {
        tafsirSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 90);
    }
  }, [isPlayingAudio, playbackPhase, activeTarget]);

  // Load verse whenever activeTarget or language changes
  useEffect(() => {
    if (!activeTarget) return;
    let cancelled = false;
    const { surahNumber, ayahNumber } = activeTarget;
    const exactId = `${surahNumber}:${ayahNumber}`;

    // Load saved reflection notes for this verse
    const savedNote = StorageService.getReflection(exactId);
    setReflectionText(
      savedNote?.reflectNotes || savedNote?.understandNotes || savedNote?.applyNotes || ''
    );
    setReflectionSaved(false);
    setPlaybackRatio(0);
    if (!continuousReadPlaying) {
      setIsPlayingAudio(false);
      setPlaybackPhase('idle');
    }

    // Immediate optimistic check in QURAN_FIXTURES
    const localMatch = QURAN_FIXTURES.find(
      (f) => f.id === exactId || (f.surahNumber === surahNumber && f.verseNumber === String(ayahNumber))
    );
    if (localMatch) {
      setCurrentVerse(localMatch);
    } else {
      setIsLoadingVerse(true);
    }

    fetch(`/api/quran/ayah?surah=${surahNumber}&ayah=${ayahNumber}&lang=${language}`)
      .then((res) =>
        res.ok
          ? (res.json() as Promise<{
              verse?: QuranVerseFixture;
              juz?: number;
              page?: number;
              hizbQuarter?: number;
            }>)
          : null
      )
      .then((data) => {
        if (cancelled || !data?.verse) return;
        setCurrentVerse(data.verse);
        setPageMeta({
          juz: data.juz || data.verse.juz,
          page: data.page,
          hizbQuarter: data.hizbQuarter,
        });
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoadingVerse(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTarget, language]);

  // Filter surahs or direct "surah:ayah" query in browser view
  const filteredSurahs = SURAH_CATALOG.filter((s) => {
    const q = searchFilter.trim().toLowerCase();
    if (!q) return true;
    return (
      String(s.number) === q ||
      s.nameArabic.includes(searchFilter.trim()) ||
      s.nameTransliterated.toLowerCase().includes(q) ||
      s.meaning[language].toLowerCase().includes(q) ||
      s.meaning.en.toLowerCase().includes(q)
    );
  });

  const handleBrowserSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchFilter.trim();
    const verseMatch = q.match(/^(\d{1,3})\s*[:.]\s*(\d{1,3})$/);
    if (verseMatch) {
      const sNum = parseInt(verseMatch[1], 10);
      const aNum = parseInt(verseMatch[2], 10);
      if (sNum >= 1 && sNum <= 114) {
        openSurahAyah(sNum, aNum);
        return;
      }
    }
    if (filteredSurahs.length > 0) {
      openSurahAyah(filteredSurahs[0].number, 1);
    }
  };

  // ============================================================================
  // VIEW 2: FOCUSED SURAH & AYAH READER VIEW
  // ============================================================================
  if (activeTarget) {
    const { surahNumber, ayahNumber } = activeTarget;
    const surahMeta: SurahCatalogItem = getSurahMeta(surahNumber);
    const totalAyahs = surahMeta.ayahCount;
    const exactId = `${surahNumber}:${ayahNumber}`;
    const isBookmarked = bookmarks.includes(exactId);

    const prevAyah = ayahNumber > 1 ? ayahNumber - 1 : null;
    const nextAyah = ayahNumber < totalAyahs ? ayahNumber + 1 : null;

    const localizedDetails = currentVerse
      ? getLocalizedVerseDetails(currentVerse, language)
      : null;

    // Strictly use Tafsir citations that exist in the chosen language (do not read or fall back to another language; skip if absent)
    const availableCitations = localizedDetails?.tafsirCitations || [];

    const currentCitation =
      availableCitations.find((c) => c.scholar.toLowerCase() === selectedScholar.toLowerCase()) ||
      availableCitations[0];

    const effectiveTafsirLang: Language = language;

    const translationObj = currentVerse?.translations[language];
    const arabicWords = (currentVerse?.arabicText || '')
      .replace(/[\u06DD\u06DE]/g, '')
      .replace(/[\u0660-\u0669]+/g, '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    const activeArabicWordIdx =
      isPlayingAudio && playbackPhase === 'recitation' && arabicWords.length > 0
        ? Math.min(arabicWords.length - 1, Math.floor(playbackRatio * arabicWords.length))
        : -1;

    const translationWords = (translationObj?.text || '').trim().split(/\s+/).filter(Boolean);
    const activeTranslationWordIdx =
      isPlayingAudio && playbackPhase === 'translation' && translationWords.length > 0
        ? Math.min(translationWords.length - 1, Math.floor(playbackRatio * translationWords.length))
        : -1;

    const tafsirWords = (currentCitation?.text || '').trim().split(/\s+/).filter(Boolean);
    const activeTafsirWordIdx =
      isPlayingAudio && playbackPhase === 'tafsir' && tafsirWords.length > 0
        ? Math.min(tafsirWords.length - 1, Math.floor(playbackRatio * tafsirWords.length))
        : -1;

    const handleCopyVerse = () => {
      if (!currentVerse) return;
      const trText = translationObj?.text ? `\n\n"${translationObj.text}" — ${translationObj.translator}` : '';
      navigator.clipboard?.writeText(
        `${currentVerse.arabicText} (${surahMeta.nameTransliterated} ${surahNumber}:${ayahNumber})${trText}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    const handleSaveReflection = () => {
      StorageService.saveReflection(exactId, {
        reflectNotes: reflectionText,
      });
      setReflectionSaved(true);
      setTimeout(() => setReflectionSaved(false), 2000);
    };

    const juzNumber = pageMeta.juz || surahMeta.juzStart;
    const estimatedPage = pageMeta.page || Math.max(1, Math.min(604, Math.round((surahNumber / 114) * 580) + Math.floor(ayahNumber / 15)));
    const estimatedHizb = pageMeta.hizbQuarter
      ? Math.ceil(pageMeta.hizbQuarter / 4)
      : Math.max(1, Math.min(60, juzNumber * 2 - 1));

    return (
      <div
        dir={language === 'ar' ? 'rtl' : 'ltr'}
        className="w-full max-w-3xl mx-auto space-y-4 animate-fadeIn"
      >
        {/* Top Surah Navigation Bar — styled identically to Guidance VerseCard header */}
        <div className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-3xl bg-[#FBF8F1] dark:bg-[#082019] border border-emerald-900/15 dark:border-emerald-700/30 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => {
                setActiveTarget(null);
                onTargetChange?.(null);
              }}
              aria-label={t.backToListLabel}
              title={t.backToListLabel}
              className="w-10 h-10 rounded-full bg-[#F7F0E2] dark:bg-[#0C2920] border border-emerald-900/15 dark:border-emerald-700/40 flex items-center justify-center text-emerald-950 dark:text-[#F5F7F2] hover:border-[#006D53] transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B900]"
            >
              <ArrowLeft className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-emerald-950 dark:text-[#F5F7F2] truncate">
                {surahMeta.nameTransliterated}
              </h1>
              <p className="text-xs text-slate-500 dark:text-[#9BAFA7] truncate">
                {surahMeta.nameTransliterated} · {surahMeta.meaning[language]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="font-arabic text-lg text-amber-700 dark:text-[#F4B900] hidden sm:inline">
              {surahMeta.nameArabic}
            </span>
            <button
              type="button"
              onClick={() => onToggleBookmark(exactId)}
              aria-pressed={isBookmarked}
              aria-label={t.addToJournalBtn}
              title={t.addToJournalBtn}
              className={`w-10 h-10 rounded-2xl border flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B900] ${
                isBookmarked
                  ? 'bg-amber-500/15 border-[#F4B900]/50 text-amber-700 dark:text-[#F4B900]'
                  : 'bg-[#F7F0E2] dark:bg-[#0C2920] border-emerald-900/15 dark:border-emerald-700/40 text-slate-600 dark:text-[#9BAFA7] hover:text-emerald-900 dark:hover:text-[#F5F7F2]'
              }`}
            >
              {isBookmarked ? <BookmarkCheck className="w-4 h-4 fill-current" /> : <Bookmark className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* TOP PLAY DIV: Audio Player placed at the top of the Read page with Tafsir & Translation selection and background pre-caching */}
        <div className="p-3 sm:p-4 rounded-3xl bg-[#FBF8F1] dark:bg-[#082019] border border-emerald-900/15 dark:border-emerald-700/30 shadow-sm">
          <AudioPlayer
            surahVerseId={exactId}
            verseNumbers={[ayahNumber]}
            surahNumber={surahNumber}
            verseNumber={String(ayahNumber)}
            ayahId={currentVerse?.id === exactId ? currentVerse.id : exactId}
            audioUrl={currentVerse?.audioUrl}
            translationText={currentVerse?.id === exactId ? translationObj?.text || '' : ''}
            tafsirText={currentVerse?.id === exactId ? currentCitation?.text || '' : ''}
            tafsirLanguage={effectiveTafsirLang}
            language={language}
            translationSource={translationObj?.translator}
            tafsirSource={currentCitation?.scholar}
            autoPlayOnAdvance={continuousReadPlaying && !isLoadingVerse && currentVerse?.id === exactId}
            onPlayingStateChange={(playing) => {
              setContinuousReadPlaying(playing);
              setIsPlayingAudio(playing);
            }}
            onPlaybackComplete={() => {
              if (nextAyah) {
                openSurahAyah(surahNumber, nextAyah);
              } else if (surahNumber < 114) {
                openSurahAyah(surahNumber + 1, 1);
              } else {
                setContinuousReadPlaying(false);
                setIsPlayingAudio(false);
                setPlaybackPhase('idle');
              }
            }}
            onPlaybackProgress={(ratio, playing, phase) => {
              setPlaybackRatio(ratio);
              setIsPlayingAudio(playing);
              setPlaybackPhase(phase || 'idle');
            }}
            onAudioSourcesResolved={setAudioSources}
          />
        </div>

        {/* Horizontal Clickable Verse Number Strip: < [133] ( 134 ) [135] > */}
        <div className="px-4 py-3.5 rounded-3xl bg-[#FBF8F1] dark:bg-[#082019] border border-emerald-900/15 dark:border-emerald-700/30 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              disabled={!prevAyah}
              onClick={() => prevAyah && openSurahAyah(surahNumber, prevAyah)}
              aria-label={t.prevVerseLabel}
              className="w-10 h-10 rounded-full border border-emerald-900/15 dark:border-emerald-700/40 bg-[#F7F0E2] dark:bg-[#0C2920] flex items-center justify-center text-slate-700 dark:text-[#F5F7F2] disabled:opacity-30 hover:border-[#006D53] transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B900]"
            >
              <ChevronLeft className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
            </button>

            <div className="flex items-center justify-center gap-2 sm:gap-3 overflow-x-auto py-1 no-scrollbar">
              {prevAyah && (
                <button
                  type="button"
                  onClick={() => openSurahAyah(surahNumber, prevAyah)}
                  className="min-w-[54px] h-10 px-3 rounded-full border border-emerald-900/15 dark:border-emerald-700/40 bg-[#F7F0E2] dark:bg-[#0C2920] text-xs sm:text-sm font-semibold text-slate-600 dark:text-[#9BAFA7] hover:border-[#006D53] hover:text-emerald-950 dark:hover:text-[#F5F7F2] transition-all cursor-pointer tabular-nums"
                >
                  {prevAyah}
                </button>
              )}

              {/* Active Ornate Gold Cartouche */}
              <div className="px-1">
                <AyahCartouche
                  number={String(ayahNumber)}
                  active
                  size="lg"
                  className="text-amber-700 dark:text-[#F4B900]"
                />
              </div>

              {nextAyah && (
                <button
                  type="button"
                  onClick={() => openSurahAyah(surahNumber, nextAyah)}
                  className="min-w-[54px] h-10 px-3 rounded-full border border-emerald-900/15 dark:border-emerald-700/40 bg-[#F7F0E2] dark:bg-[#0C2920] text-xs sm:text-sm font-semibold text-slate-600 dark:text-[#9BAFA7] hover:border-[#006D53] hover:text-emerald-950 dark:hover:text-[#F5F7F2] transition-all cursor-pointer tabular-nums"
                >
                  {nextAyah}
                </button>
              )}
            </div>

            <button
              type="button"
              disabled={!nextAyah}
              onClick={() => nextAyah && openSurahAyah(surahNumber, nextAyah)}
              aria-label={t.nextVerseLabel}
              className="w-10 h-10 rounded-full border border-emerald-900/15 dark:border-emerald-700/40 bg-[#F7F0E2] dark:bg-[#0C2920] flex items-center justify-center text-slate-700 dark:text-[#F5F7F2] disabled:opacity-30 hover:border-[#006D53] transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B900]"
            >
              <ChevronRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Progress Bar + Juz' · Page · Hizb Metadata Row */}
          <div className="space-y-1.5">
            <div className="h-1 w-full rounded-full bg-emerald-950/10 dark:bg-[#061B16] overflow-hidden">
              <div
                className="h-full bg-[#006D53] dark:bg-emerald-500 transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(2, (ayahNumber / totalAyahs) * 100))}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#9BAFA7] tabular-nums px-1">
              <span>
                {t.juzLabel} {juzNumber} · {t.pageLabel} {estimatedPage} · {t.hizbLabel} {estimatedHizb}
              </span>
              <span className="font-semibold text-emerald-950 dark:text-[#F5F7F2]">
                {surahNumber}:{ayahNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Level 1 Quranic Arabic Section — styled identically to Guidance VerseCard */}
        <section
          ref={arabicSectionRef}
          aria-label={t.level1Badge}
          className={`rounded-3xl bg-[#F7F0E2] dark:bg-[#0C2920] text-emerald-950 dark:text-[#F5F7F2] border shadow-md p-5 sm:p-7 space-y-5 transition-colors ${
            isPlayingAudio && playbackPhase === 'recitation'
              ? 'border-amber-500/60 dark:border-[#F4B900]/60 ring-2 ring-[#F4B900]/20'
              : 'border-amber-900/15 dark:border-emerald-700/35'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-amber-800 dark:text-[#F4B900] tracking-wide">
              {t.level1Badge}
            </span>
            <span className="text-xs font-mono font-semibold text-amber-800/80 dark:text-[#9BAFA7] tabular-nums">
              {surahNumber}:{ayahNumber}
            </span>
          </div>

          {isLoadingVerse && !currentVerse ? (
            <div className="py-12 text-center text-sm text-amber-900/70 dark:text-[#9BAFA7] animate-pulse">
              {t.loadingVerse}
            </div>
          ) : (
            <>
              <div
                style={{
                  fontSize: `${Math.round(28 * (readerProfile === 'kids' ? Math.max(arabicScale, 1.3) : arabicScale))}px`,
                  lineHeight: 2.3,
                }}
                className="py-2"
              >
                <p
                  dir="rtl"
                  lang="ar"
                  className="font-arabic text-center sm:text-right text-slate-900 dark:text-[#FAF8F5] select-text antialiased"
                >
                  {arabicWords.map((word, idx) => {
                    const isWordActive = idx === activeArabicWordIdx;
                    return (
                      <React.Fragment key={idx}>
                        <span
                          className={`inline-block rounded-lg px-0.5 transition-colors duration-150 ${
                            isWordActive
                              ? 'bg-amber-300/60 dark:bg-amber-500/35 text-emerald-950 dark:text-amber-200 underline decoration-amber-600 decoration-2 underline-offset-8'
                              : ''
                          }`}
                        >
                          {word}
                        </span>{' '}
                      </React.Fragment>
                    );
                  })}
                </p>

                <div className="flex justify-center pt-3">
                  <AyahCartouche
                    number={String(ayahNumber)}
                    size="lg"
                    className="text-amber-700 dark:text-[#F4B900]"
                  />
                </div>
              </div>

              {showTransliteration && currentVerse?.transliteration && (
                <p className="text-xs sm:text-sm text-slate-600 dark:text-[#9BAFA7] italic text-center leading-relaxed border-t border-amber-900/10 dark:border-emerald-800/40 pt-3">
                  {currentVerse.transliteration}
                </p>
              )}
            </>
          )}
        </section>

        {/* Segmented Reader Tabs: Traduction · Tafsir · Réflexion */}
        <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-[#FBF8F1] dark:bg-[#082019] border border-emerald-900/15 dark:border-emerald-700/30 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveBottomTab('translation')}
            className={`min-h-[42px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B900] ${
              activeBottomTab === 'translation'
                ? 'bg-[#006D53] text-white shadow-xs'
                : 'text-slate-600 dark:text-[#9BAFA7] hover:text-emerald-950 dark:hover:text-[#F5F7F2]'
            }`}
          >
            <span>
              {t.translationTab} ({language.toUpperCase()})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveBottomTab('tafsir')}
            className={`min-h-[42px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B900] ${
              activeBottomTab === 'tafsir'
                ? 'bg-[#006D53] text-white shadow-xs'
                : 'text-slate-600 dark:text-[#9BAFA7] hover:text-emerald-950 dark:hover:text-[#F5F7F2]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span>{t.tafsirTab}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveBottomTab('reflection')}
            className={`min-h-[42px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B900] ${
              activeBottomTab === 'reflection'
                ? 'bg-[#006D53] text-white shadow-xs'
                : 'text-slate-600 dark:text-[#9BAFA7] hover:text-emerald-950 dark:hover:text-[#F5F7F2]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#F4B900]" />
            <span>{t.reflectionTab}</span>
          </button>
        </div>

        {/* Active Panel Content: Translation */}
        {activeBottomTab === 'translation' && (
          <div
            ref={translationSectionRef}
            className={`p-5 sm:p-6 rounded-3xl bg-[#FBF8F1] dark:bg-[#082019] border shadow-xs space-y-4 transition-colors ${
              isPlayingAudio && playbackPhase === 'translation'
                ? 'border-amber-500/60 dark:border-[#F4B900]/60 ring-2 ring-[#F4B900]/20'
                : 'border-emerald-900/15 dark:border-emerald-700/30'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-amber-700 dark:text-[#F4B900]">
                  {t.level2Badge} {translationObj?.translator ? `(${translationObj.translator})` : ''}
                </span>
                {audioSources.translation && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#006D53]/15 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200 border border-emerald-700/30">
                    Audio: {audioSources.translation}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => onToggleBookmark(exactId)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-[#F4B900] transition-colors cursor-pointer"
                aria-label={t.addToJournalBtn}
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-4 h-4 text-[#F4B900] fill-current" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>
            </div>

            {translationObj?.text ? (
              <>
                <blockquote
                  style={{ fontSize: `${readingScale * 1.15}rem` }}
                  className="font-serif text-slate-800 dark:text-[#F5F7F2] leading-relaxed"
                >
                  &ldquo;
                  {translationWords.map((word, idx) => {
                    const isWordActive = idx === activeTranslationWordIdx;
                    return (
                      <React.Fragment key={idx}>
                        <span
                          className={`inline-block rounded px-0.5 transition-colors duration-150 ${
                            isWordActive
                              ? 'bg-amber-300/60 dark:bg-amber-500/35 text-emerald-950 dark:text-amber-200 underline decoration-amber-600 decoration-2 underline-offset-4'
                              : ''
                          }`}
                        >
                          {word}
                        </span>{' '}
                      </React.Fragment>
                    );
                  })}
                  &rdquo;
                </blockquote>
                <p className="text-xs text-slate-500 dark:text-[#9BAFA7]">
                  — {translationObj.translator}
                </p>
              </>
            ) : (
              <p className="text-xs text-slate-500 dark:text-[#9BAFA7]">
                {t.loadingVerse}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-emerald-900/10 dark:border-emerald-800/40 text-xs font-semibold text-slate-600 dark:text-[#9BAFA7]">
              <button
                type="button"
                onClick={handleCopyVerse}
                className="inline-flex items-center gap-1.5 hover:text-emerald-900 dark:hover:text-[#F5F7F2] transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? t.copiedBtn : t.copyBtn}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyVerse}
                className="inline-flex items-center gap-1.5 hover:text-emerald-900 dark:hover:text-[#F5F7F2] transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{t.shareBtn}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!isBookmarked) onToggleBookmark(exactId);
                  setActiveBottomTab('reflection');
                }}
                className="inline-flex items-center gap-1.5 hover:text-emerald-900 dark:hover:text-[#F5F7F2] transition-colors cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{isBookmarked ? t.savedInJournalBtn : t.addToJournalBtn}</span>
              </button>
            </div>
          </div>
        )}

        {/* Active Panel Content: Tafsir */}
        {activeBottomTab === 'tafsir' && (
          <div
            ref={tafsirSectionRef}
            className={`p-5 sm:p-6 rounded-3xl bg-[#FBF8F1] dark:bg-[#082019] border shadow-xs space-y-4 transition-colors ${
              isPlayingAudio && playbackPhase === 'tafsir'
                ? 'border-amber-500/60 dark:border-[#F4B900]/60 ring-2 ring-[#F4B900]/20'
                : 'border-emerald-900/15 dark:border-emerald-700/30'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-amber-700 dark:text-[#F4B900]">
                  {t.level3Title}
                </span>
                {audioSources.tafsir && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#006D53]/15 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200 border border-emerald-700/30">
                    Audio: {audioSources.tafsir}
                  </span>
                )}
              </div>
              {availableCitations.length > 1 && (
                <div className="flex flex-wrap gap-1.5">
                  {availableCitations.map((c, idx) => (
                    <button
                      key={`${c.scholar}-${idx}`}
                      type="button"
                      onClick={() => setSelectedScholar(c.scholar)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        currentCitation?.scholar === c.scholar
                          ? 'bg-[#006D53] text-white'
                          : 'bg-[#F7F0E2] dark:bg-[#0C2920] text-slate-600 dark:text-[#9BAFA7]'
                      }`}
                    >
                      {c.scholar}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {currentCitation ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-[#9BAFA7]">
                  <span className="font-semibold text-emerald-950 dark:text-[#F5F7F2]">
                    {currentCitation.scholar} — {currentCitation.sourceBook}
                  </span>
                  {currentCitation.originalArabicRaw && (
                    <button
                      type="button"
                      onClick={() => setProvenanceModalOpen(true)}
                      className="text-amber-700 dark:text-[#F4B900] underline cursor-pointer"
                    >
                      {t.viewOriginalSource}
                    </button>
                  )}
                </div>
                <p
                  dir={effectiveTafsirLang === 'ar' ? 'rtl' : 'ltr'}
                  lang={effectiveTafsirLang}
                  style={{ fontSize: `${readingScale * 0.95}rem` }}
                  className={`${
                    effectiveTafsirLang === 'ar' ? 'font-arabic text-base sm:text-lg leading-loose' : 'leading-relaxed'
                  } text-slate-800 dark:text-[#F5F7F2] whitespace-pre-line`}
                >
                  {tafsirWords.map((word, idx) => {
                    const isWordActive = idx === activeTafsirWordIdx;
                    return (
                      <React.Fragment key={idx}>
                        <span
                          className={`inline-block rounded px-0.5 transition-colors duration-150 ${
                            isWordActive
                              ? 'bg-amber-300/60 dark:bg-amber-500/35 text-emerald-950 dark:text-amber-200 underline decoration-amber-600 decoration-2 underline-offset-4'
                              : ''
                          }`}
                        >
                          {word}
                        </span>{' '}
                      </React.Fragment>
                    );
                  })}
                </p>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-slate-500 dark:text-[#9BAFA7]">
                {language === 'ar'
                  ? 'التفسير الميسر متاح لهذه الآية الكريمة.'
                  : 'Select a verse with verified classical commentary in this language, or switch to Arabic for Al-Tafsir Al-Muyassar.'}
              </p>
            )}
          </div>
        )}

        {activeBottomTab === 'reflection' && (
          <div className="p-5 sm:p-6 rounded-3xl bg-[#FBF8F1] dark:bg-[#082019] border border-emerald-900/15 dark:border-emerald-700/30 shadow-xs space-y-4">
            <span className="text-xs font-bold text-amber-700 dark:text-[#F4B900] block">
              {t.level4Title}
            </span>
            <textarea
              rows={4}
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              placeholder={t.reflectionPlaceholder}
              className="w-full p-3.5 rounded-2xl bg-[#F7F0E2] dark:bg-[#0C2920] border border-emerald-900/15 dark:border-emerald-800/40 text-sm text-slate-800 dark:text-[#F5F7F2] placeholder:text-slate-400 dark:placeholder:text-[#9BAFA7]/60 focus:outline-none focus:ring-2 focus:ring-[#006D53]"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSaveReflection}
                className="px-4 py-2 rounded-xl bg-[#006D53] hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                {reflectionSaved ? t.savedReflectionBtn : t.saveReflectionBtn}
              </button>
            </div>
          </div>
        )}

        {/* Quick Level 3 & Level 4 Summary Cards */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => {
              setActiveBottomTab('tafsir');
              setTimeout(() => {
                tafsirSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 60);
            }}
            className="w-full p-4 rounded-2xl bg-[#FBF8F1] dark:bg-[#082019] border border-emerald-900/15 dark:border-emerald-700/30 flex items-center justify-between gap-3 text-start hover:border-[#006D53] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#006D53]/15 text-[#006D53] dark:text-emerald-300 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-700 dark:text-[#F4B900]">
                  {t.level3Title}
                </p>
                <p className="text-xs text-slate-500 dark:text-[#9BAFA7]">
                  {t.level3Sub}
                </p>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 text-slate-400 ${language === 'ar' ? 'rotate-180' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setActiveBottomTab('reflection')}
            className="w-full p-4 rounded-2xl bg-[#FBF8F1] dark:bg-[#082019] border border-emerald-900/15 dark:border-emerald-700/30 flex items-center justify-between gap-3 text-start hover:border-[#006D53] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-[#F4B900] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-700 dark:text-[#F4B900]">
                  {t.level4Title}
                </p>
                <p className="text-xs text-slate-500 dark:text-[#9BAFA7]">
                  {t.level4Sub}
                </p>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 text-slate-400 ${language === 'ar' ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Bottom Previous / Next Verse Cards */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            disabled={!prevAyah}
            onClick={() => prevAyah && openSurahAyah(surahNumber, prevAyah)}
            className="p-3.5 rounded-2xl bg-[#FBF8F1] dark:bg-[#082019] border border-emerald-900/15 dark:border-emerald-700/30 flex items-center gap-2.5 text-start disabled:opacity-35 hover:border-[#006D53] transition-colors cursor-pointer"
          >
            <ChevronLeft className={`w-4 h-4 text-slate-400 shrink-0 ${language === 'ar' ? 'rotate-180' : ''}`} />
            <div>
              <p className="text-[11px] text-slate-500 dark:text-[#9BAFA7]">
                {t.prevVerseLabel}
              </p>
              <p className="text-xs font-bold text-emerald-950 dark:text-[#F5F7F2] tabular-nums">
                {prevAyah ? `${surahNumber}:${prevAyah}` : '—'}
              </p>
            </div>
          </button>

          <button
            type="button"
            disabled={!nextAyah}
            onClick={() => nextAyah && openSurahAyah(surahNumber, nextAyah)}
            className="p-3.5 rounded-2xl bg-[#FBF8F1] dark:bg-[#082019] border border-emerald-900/15 dark:border-emerald-700/30 flex items-center justify-between gap-2.5 text-end disabled:opacity-35 hover:border-[#006D53] transition-colors cursor-pointer"
          >
            <div className="ms-auto">
              <p className="text-[11px] text-slate-500 dark:text-[#9BAFA7]">
                {t.nextVerseLabel}
              </p>
              <p className="text-xs font-bold text-emerald-950 dark:text-[#F5F7F2] tabular-nums">
                {nextAyah ? `${surahNumber}:${nextAyah}` : '—'}
              </p>
            </div>
            <ChevronRight className={`w-4 h-4 text-slate-400 shrink-0 ${language === 'ar' ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {currentVerse && (
          <ScholarProvenanceModal
            isOpen={provenanceModalOpen}
            onClose={() => setProvenanceModalOpen(false)}
            citation={currentCitation}
            verse={currentVerse}
            language={language}
          />
        )}
      </div>
    );
  }

  // ============================================================================
  // VIEW 1: SURAH / JUZ' / FAVORITES INDEX VIEW (Left Screen in Screenshot)
  // ============================================================================
  const juzGroups = Array.from({ length: 30 }, (_, i) => i + 1).map((juzNum) => ({
    juz: juzNum,
    surahs: SURAH_CATALOG.filter((s) => s.juzStart === juzNum),
  }));

  return (
    <div
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className="w-full max-w-3xl mx-auto space-y-5 animate-fadeIn"
    >
      {/* Header Section */}
      <div className="space-y-1.5 px-1">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-emerald-950 dark:text-[#F5F7F2]">
          {t.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-[#9BAFA7]">
          {t.subtitle}
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleBrowserSearchSubmit} className="relative">
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#0B3027] border border-emerald-900/15 dark:border-emerald-800/40 focus-within:border-[#006D53] shadow-xs">
          <Search className="w-4 h-4 text-slate-400 dark:text-[#9BAFA7] shrink-0" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder={t.searchPlaceholder}
            aria-label={t.searchPlaceholder}
            className="flex-1 min-w-0 bg-transparent text-sm text-slate-900 dark:text-[#F5F7F2] placeholder:text-slate-400 dark:placeholder:text-[#9BAFA7]/60 focus:outline-none"
          />
          {searchFilter.trim().length > 0 && (
            <button
              type="button"
              onClick={() => setSearchFilter('')}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-[#F5F7F2] cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </form>

      {/* 3-Tab Filter: Sourates | Juz' | Favoris */}
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-white dark:bg-[#0B3027] border border-emerald-900/10 dark:border-emerald-800/40">
        {(['surahs', 'juz', 'bookmarks'] as BrowserTab[]).map((tabKey) => {
          const isActive = browserTab === tabKey;
          const label =
            tabKey === 'surahs'
              ? t.surahsTab
              : tabKey === 'juz'
              ? t.juzTab
              : `${t.bookmarksTab} (${bookmarks.length})`;
          return (
            <button
              key={tabKey}
              type="button"
              onClick={() => setBrowserTab(tabKey)}
              className={`min-h-[40px] px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B900] ${
                isActive
                  ? 'bg-[#006D53] text-white shadow-2xs'
                  : 'text-slate-600 dark:text-[#9BAFA7] hover:text-emerald-950 dark:hover:text-[#F5F7F2]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ALL 114 SURAHS LIST */}
      {browserTab === 'surahs' && (
        <div className="space-y-2.5">
          {filteredSurahs.map((surah, idx) => {
            const isHighlighted = idx === 0 && !searchFilter;
            return (
              <div
                key={surah.number}
                onClick={() => openSurahAyah(surah.number, 1)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openSurahAyah(surah.number, 1);
                  }
                }}
                className={`w-full p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B900] ${
                  isHighlighted
                    ? 'bg-[#F7F0E2] text-emerald-950 border-amber-700/25 shadow-sm'
                    : 'bg-white dark:bg-[#0B3027] text-emerald-950 dark:text-[#F5F7F2] border-emerald-900/10 dark:border-emerald-800/40 hover:border-[#006D53]'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold tabular-nums shrink-0 ${
                      isHighlighted
                        ? 'bg-amber-900/15 text-amber-950'
                        : 'bg-[#FAF8F5] dark:bg-[#061B16] text-emerald-900 dark:text-[#F5F7F2] border border-emerald-900/10 dark:border-emerald-800/40'
                    }`}
                  >
                    {surah.number}
                  </span>

                  <div className="min-w-0">
                    <p
                      className={`font-arabic text-lg sm:text-xl leading-snug truncate ${
                        isHighlighted ? 'text-emerald-950' : 'text-emerald-950 dark:text-[#F5F7F2]'
                      }`}
                    >
                      {surah.nameArabic}
                    </p>
                    <p
                      className={`text-xs truncate ${
                        isHighlighted ? 'text-amber-950/75' : 'text-slate-500 dark:text-[#9BAFA7]'
                      }`}
                    >
                      {surah.nameTransliterated} · {surah.meaning[language]}
                    </p>
                  </div>
                </div>

                {/* Clickable Number of Verses Badge */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openSurahAyah(surah.number, 1);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold tabular-nums transition-colors cursor-pointer ${
                      isHighlighted
                        ? 'bg-amber-900/10 hover:bg-amber-900/20 text-emerald-950'
                        : 'bg-emerald-950/5 dark:bg-[#061B16] hover:bg-[#006D53] hover:text-white text-slate-600 dark:text-[#9BAFA7]'
                    }`}
                  >
                    {surah.ayahCount} {t.versesUnit}
                  </button>
                  <ChevronRight
                    className={`w-4 h-4 ${
                      isHighlighted ? 'text-amber-900/70' : 'text-slate-400 dark:text-[#9BAFA7]'
                    } ${language === 'ar' ? 'rotate-180' : ''}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: JUZ' 1–30 DIRECTORY */}
      {browserTab === 'juz' && (
        <div className="space-y-3">
          {juzGroups.map(({ juz, surahs }) => (
            <div
              key={juz}
              className="p-4 rounded-2xl bg-white dark:bg-[#0B3027] border border-emerald-900/10 dark:border-emerald-800/40 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-[#F4B900]">
                  {t.juzLabel} {juz}
                </span>
                {surahs[0] && (
                  <button
                    type="button"
                    onClick={() => openSurahAyah(surahs[0].number, 1)}
                    className="text-xs font-semibold text-[#006D53] dark:text-emerald-300 hover:underline cursor-pointer"
                  >
                    {surahs[0].nameTransliterated} →
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {surahs.map((s) => (
                  <button
                    key={s.number}
                    type="button"
                    onClick={() => openSurahAyah(s.number, 1)}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium bg-[#FAF8F5] dark:bg-[#061B16] border border-emerald-900/10 dark:border-emerald-800/40 text-emerald-950 dark:text-[#F5F7F2] hover:border-[#006D53] transition-colors cursor-pointer"
                  >
                    {s.number}. {s.nameTransliterated} ({s.ayahCount} {t.versesUnit})
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: FAVORITES / BOOKMARKED VERSES */}
      {browserTab === 'bookmarks' && (
        <div className="space-y-2.5">
          {bookmarks.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-[#0B3027] border border-emerald-900/10 dark:border-emerald-800/40 text-center text-xs sm:text-sm text-slate-500 dark:text-[#9BAFA7]">
              {t.emptyBookmarks}
            </div>
          ) : (
            bookmarks.map((bId) => {
              const parts = bId.split(':');
              const sNum = parseInt(parts[0], 10) || 1;
              const aNum = parseInt(parts[1], 10) || 1;
              const sMeta = getSurahMeta(sNum);
              return (
                <button
                  key={bId}
                  type="button"
                  onClick={() => openSurahAyah(sNum, aNum)}
                  className="w-full p-4 rounded-2xl bg-white dark:bg-[#0B3027] border border-emerald-900/10 dark:border-emerald-800/40 hover:border-[#006D53] flex items-center justify-between gap-3 text-start transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <AyahCartouche number={String(aNum)} size="md" className="text-[#F4B900]" />
                    <div>
                      <p className="text-sm font-bold text-emerald-950 dark:text-[#F5F7F2]">
                        {sMeta.nameTransliterated} ({sNum}:{aNum})
                      </p>
                      <p className="text-xs text-slate-500 dark:text-[#9BAFA7]">
                        {sMeta.meaning[language]}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-slate-400 ${language === 'ar' ? 'rotate-180' : ''}`} />
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
