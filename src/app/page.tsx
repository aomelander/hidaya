"use client";

/**
 * @file page.tsx
 * @description Main application shell for Hidaya: Quran Guidance & Reflection.
 * Implements a serene, zero-popup 5-tab architecture where each bottom tab
 * (`Guidance`, `Audio`, `North Star`, `Journal`, `Preferences`) renders its own
 * dedicated screen, paired with a minimalist header and inline Tafsir & Reflection
 * inside each verse card.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Language,
  QuranVerseFixture,
  ExplanationDepth,
  UserReflection,
  PerspectiveMode,
  ReaderProfile,
  PreferredScholar,
  VerseCardPreferences,
  QueryAnalysisResponse,
} from '../types';
import { Locale, getDictionary } from '../lib/i18n/dictionaries';
import { QURAN_FIXTURES } from '../data/quranFixtures';
import { getSurahMeta } from '../data/surahCatalog';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { StorageService } from '../services/storage';
import { OfflineCacheService } from '../services/offlineCacheService';
import { APP_CONFIG } from '../config/appConfig';
import { useGuidanceSearch } from '../hooks/useGuidanceSearch';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

// Core Tab Views & Components (Zero Popup Modals)
import { Header } from '../components/Header';
import { DailyNorthStar } from '../components/DailyNorthStar';
import { OffTopicBanner } from '../components/OffTopicBanner';
import { expandPassage, PassageSelection } from '../services/passageSelection';
import { VerseCard } from '../components/VerseCard';
import type { QuranReaderTarget } from '../components/QuranReaderPage';
import { type BottomNavTab } from '../components/BottomNav';
import { Footer } from '../components/Footer';
import { HIDAYA_EVENTS } from '../config/events';

const ContinuousSessionAudioPlayer = React.lazy(() => import('../components/ContinuousSessionAudioPlayer').then(m => ({ default: m.ContinuousSessionAudioPlayer })));
const QuranReaderPage = React.lazy(() => import('../components/QuranReaderPage').then(m => ({ default: m.QuranReaderPage })));
const CustomizationSheet = React.lazy(() => import('../components/CustomizationSheet').then(m => ({ default: m.CustomizationSheet })));
const JournalDrawer = React.lazy(() => import('../components/JournalDrawer').then(m => ({ default: m.JournalDrawer })));

export default function App() {
  const [passageSelections, setPassageSelections] = useState<Record<string, PassageSelection>>({});
  const [mounted, setMounted] = useState(false);
  const [activeNavTab, setActiveNavTab] = useState<BottomNavTab>('guidance');
  const [readTarget, setReadTarget] = useState<QuranReaderTarget | null>(null);

  // User Preferences State
  const [language, setLanguage] = useState<Language>(APP_CONFIG.DEFAULTS.LANGUAGE);
  const [arabicScale, setArabicScale] = useState<number>(APP_CONFIG.DEFAULTS.ARABIC_SCALE);
  const [readingScale, setReadingScale] = useState<number>(APP_CONFIG.DEFAULTS.READING_SCALE);
  const [showTransliteration, setShowTransliteration] = useState<boolean>(
    APP_CONFIG.DEFAULTS.SHOW_TRANSLITERATION
  );
  const [isDark, setIsDark] = useState<boolean>(APP_CONFIG.DEFAULTS.DARK_MODE);
  const [isHighContrast, setIsHighContrast] = useState<boolean>(
    APP_CONFIG.DEFAULTS.HIGH_CONTRAST
  );
  const [readerProfile, setReaderProfile] = useState<ReaderProfile>('adult');
  const [preferredScholar, setPreferredScholar] = useState<PreferredScholar>('Ibn Kathir');
  const [showReadPage, setShowReadPage] = useState<boolean>(APP_CONFIG.DEFAULTS.SHOW_READ_PAGE);
  const [showNorthStarPage, setShowNorthStarPage] = useState<boolean>(
    APP_CONFIG.DEFAULTS.SHOW_NORTH_STAR_PAGE
  );
  const [bookmarks, setBookmarks] = useState<string[]>([APP_CONFIG.DEFAULTS.INITIAL_VERSE_ID]);
  const [, setReflections] = useState<Record<string, UserReflection>>({});
  const [cardPreferences, setCardPreferences] = useState<VerseCardPreferences>(() =>
    StorageService.getCardPreferences()
  );
  const [isFullscreenActive, setIsFullscreenActive] = useState(false);

  // Contemplation & Exegesis Depth Configuration
  const [explanationDepth, setExplanationDepth] = useState<ExplanationDepth>('context');
  const [perspectiveMode, setPerspectiveMode] = useState<PerspectiveMode>('devotional');
  const [activeAudioVerseId, setActiveAudioVerseId] = useState<string | null>(null);
  const [isGlobalPlaying, setIsGlobalPlaying] = useState<boolean>(false);
  const [isContinuousReading, setIsContinuousReading] = useState<boolean>(false);
  const savedContemplationStateRef = useRef<{
    passages: QuranVerseFixture[];
    index: number;
    audioId: string | null;
    analysis: QueryAnalysisResponse | null;
  } | null>(null);

  useEffect(() => {
    const handlePlaybackState = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      setIsGlobalPlaying(Boolean(detail?.isPlaying));
      if (detail?.ayahId && detail?.isPlaying) {
        setActiveAudioVerseId(detail.ayahId);
      }
    };
    window.addEventListener(HIDAYA_EVENTS.PLAYBACK_STATE, handlePlaybackState);
    return () => window.removeEventListener(HIDAYA_EVENTS.PLAYBACK_STATE, handlePlaybackState);
  }, []);

  const handleToggleGlobalPlay = () => {
    if (isGlobalPlaying) {
      window.dispatchEvent(
        new CustomEvent(HIDAYA_EVENTS.GLOBAL_TOGGLE_PLAY, { detail: { action: 'pause' } })
      );
    } else {
      if (!activeAudioVerseId && displayedPassages.length > 0) {
        setActiveAudioVerseId(displayedPassages[0].id);
      }
      window.dispatchEvent(
        new CustomEvent(HIDAYA_EVENTS.GLOBAL_TOGGLE_PLAY, { detail: { action: 'play' } })
      );
    }
  };

  const toggleFullscreenTv = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen?.();
        setIsFullscreenActive(true);
      } else {
        await document.exitFullscreen?.();
        setIsFullscreenActive(false);
      }
    } catch (err) {
      console.warn('Fullscreen toggle failed:', err);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreenActive(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Screen Wake Lock when TV Mode is active
  useEffect(() => {
    let wakeLockSentinel: any = null;
    if (cardPreferences.tvMode && typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      (navigator as any).wakeLock?.request('screen')
        .then((sentinel: any) => {
          wakeLockSentinel = sentinel;
        })
        .catch(() => {});
    }
    return () => {
      wakeLockSentinel?.release?.().catch(() => {});
    };
  }, [cardPreferences.tvMode]);

  const lang: Locale = language;
  const dict = getDictionary(lang);

  // Guidance Search & Filtering Hook
  const {
    activeMode,
    setActiveMode,
    searchQuery,
    setSearchQuery,
    activeSphere,
    setActiveSphere,
    sessionDepth,
    setSessionDepth,
    isAnalyzing,
    analysisResult,
    setAnalysisResult,
    selectedPassages,
    setSelectedPassages,
    displayedPassages,
    executeSearch,
    handleQuickPillSelect,
    handleSelectSpecificVerse,
  } = useGuidanceSearch(language);

  const audioPassages = useMemo(() => (displayedPassages.length ? displayedPassages : selectedPassages).map(verse => expandPassage(verse, passageSelections[verse.id])), [displayedPassages, selectedPassages, passageSelections]);

  // Web Speech Recognition Hook (ar-SA, sv-SE, fr-FR, en-US)
  const { isListening, toggleVoiceInput, speechError } = useSpeechRecognition({
    language,
    onResult: (transcript) => {
      setSearchQuery(transcript);
      executeSearch(transcript, language);
    },
    onInterim: (interim) => {
      setSearchQuery(interim);
    },
  });

  // Client Mount Hydration
  useEffect(() => {
    setMounted(true);
    setLanguage(StorageService.getLanguage());
    setArabicScale(StorageService.getFontSizeMultiplier());
    setReadingScale(StorageService.getReadingScale());
    setShowTransliteration(StorageService.getShowTransliteration());
    setIsDark(StorageService.getDarkMode());
    setIsHighContrast(StorageService.getHighContrast());
    setReaderProfile(StorageService.getReaderProfile());
    setPreferredScholar(StorageService.getPreferredScholar());
    setShowReadPage(StorageService.getShowReadPage());
    setShowNorthStarPage(StorageService.getShowNorthStarPage());
    setBookmarks(StorageService.getBookmarks());
    setReflections(StorageService.getReflections());
    StorageService.recordDailyVisit();
  }, []);

  // Dark Mode Sync
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    if (mounted) {
      StorageService.setDarkMode(isDark);
    }
  }, [isDark, mounted]);

  // Sync document language and RTL direction
  useEffect(() => {
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  // Consolidated Preferences Persistence
  useEffect(() => {
    if (!mounted) return;
    StorageService.setLanguage(language);
    StorageService.setFontSizeMultiplier(arabicScale);
    StorageService.setShowTransliteration(showTransliteration);
    StorageService.setHighContrast(isHighContrast);
    StorageService.setReaderProfile(readerProfile);
    StorageService.setPreferredScholar(preferredScholar);
    StorageService.setShowReadPage(showReadPage);
    StorageService.setShowNorthStarPage(showNorthStarPage);
  }, [
    mounted,
    language,
    arabicScale,
    showTransliteration,
    isHighContrast,
    readerProfile,
    preferredScholar,
    showReadPage,
    showNorthStarPage,
  ]);

  // Default Verse Load
  useEffect(() => {
    const defaultVerse = QURAN_FIXTURES.find((f) => f.id === '3:134') || QURAN_FIXTURES[0];
    handleSelectSpecificVerse(defaultVerse);
  }, [handleSelectSpecificVerse]);

  const handleToggleBookmark = (verseId: string) => {
    const isNowBookmarked = StorageService.toggleBookmark(verseId);
    setBookmarks(StorageService.getBookmarks());
    if (isNowBookmarked) {
      const verse = QURAN_FIXTURES.find((f) => f.id === verseId);
      if (verse) {
        import('../services/offlineCacheService').then(({ OfflineCacheService }) => {
          OfflineCacheService.cachePassages([verse]);
        });
      }
    }
  };

  const handleSelectVerseAndGoToGuidance = (verse: QuranVerseFixture) => {
    handleSelectSpecificVerse(verse);
    setActiveNavTab('guidance');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Stories / Reels active verse index in Guidance tab
  const [activeVerseIndex, setActiveVerseIndex] = useState<number>(0);

  // Sync active audio verse with current displayed verse when passages change
  useEffect(() => {
    setActiveVerseIndex(0);
    if (displayedPassages.length > 0) {
      setActiveAudioVerseId(displayedPassages[0].id);
    }
  }, [displayedPassages]);

  const handleAdvanceToVerse = (targetIdx: number) => {
    if (displayedPassages.length === 0) return;
    const resolvedIdx = (targetIdx + displayedPassages.length) % displayedPassages.length;
    setActiveVerseIndex(resolvedIdx);
    const targetVerse = displayedPassages[resolvedIdx];
    setActiveAudioVerseId(targetVerse.id);

    // Only trigger playback for new verse if global play was ALREADY actively playing
    if (isGlobalPlaying) {
      window.dispatchEvent(
        new CustomEvent(HIDAYA_EVENTS.GLOBAL_TOGGLE_PLAY, {
          detail: { action: 'play', ayahId: targetVerse.id },
        })
      );
    }
  };

  // Keyboard navigation for reels (ArrowLeft / ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (displayedPassages.length <= 1) return;
      if (e.key === 'ArrowRight') {
        if (language === 'ar') {
          handleAdvanceToVerse(activeVerseIndex - 1);
        } else {
          handleAdvanceToVerse(activeVerseIndex + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (language === 'ar') {
          handleAdvanceToVerse(activeVerseIndex + 1);
        } else {
          handleAdvanceToVerse(activeVerseIndex - 1);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeVerseIndex, displayedPassages.length, language]);

  // Touch Swipe Gesture Detection on Guidance Viewport
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleContainerTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleContainerTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;

    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      const isRtl = language === 'ar';
      const isNext = isRtl ? deltaX > 0 : deltaX < 0;
      if (isNext) {
        handleAdvanceToVerse(activeVerseIndex + 1);
      } else {
        handleAdvanceToVerse(activeVerseIndex - 1);
      }
    }
  };

  // Universal Sanctuary Reader: Clicking Ayah Cartouche loads sequential reading in universal reels
  const handleNavigateToRead = async (surahNumber: number, ayahNumber: number) => {
    const cardPrefs = StorageService.getCardPreferences();
    const scope = cardPrefs.sequentialReadingScope || 'surah';
    const surahMeta = getSurahMeta(surahNumber);
    const totalAyahs = surahMeta?.ayahCount || 286;

    const fromAyah = ayahNumber;
    let toAyah = totalAyahs;
    if (scope === '15') {
      toAyah = Math.min(totalAyahs, fromAyah + 14);
    } else if (scope === '100') {
      toAyah = Math.min(totalAyahs, fromAyah + 99);
    }

    // 1. Immediate optimistic display
    const exactId = `${surahNumber}:${ayahNumber}`;
    const initialFixture =
      QURAN_FIXTURES.find(
        (f) =>
          f.id === exactId ||
          (f.surahNumber === surahNumber &&
            (f.verseNumber === String(ayahNumber) ||
              f.verseNumber.startsWith(`${ayahNumber}-`) ||
              f.verseNumber.endsWith(`-${ayahNumber}`)))
      ) ||
      displayedPassages.find(
        (p) =>
          p.surahNumber === surahNumber &&
          (p.verseNumber === String(ayahNumber) || p.id === exactId)
      );

    if (initialFixture) {
      setSelectedPassages([initialFixture]);
      setActiveVerseIndex(0);
      setActiveAudioVerseId(initialFixture.id);
      setAnalysisResult({
        status: 'matched',
        detectedSituation: `Surah ${surahMeta.nameTransliterated} (${surahNumber}:${fromAyah}${toAyah > fromAyah ? `–${toAyah}` : ''})`,
        detectedEmotion: surahMeta.nameArabic,
        underlyingNeed: surahMeta.meaning[language] || surahMeta.meaning.en,
        matchedPassageIds: [initialFixture.id],
        relevanceExplanation: `Surah ${surahMeta.nameTransliterated} — ${surahMeta.meaning[language] || surahMeta.meaning.en}`,
      });
      setActiveNavTab('guidance');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 2. Fetch full sequential range from /api/quran/sequence
    try {
      const res = await fetch(
        `/api/quran/sequence?surah=${surahNumber}&from=${fromAyah}&to=${toAyah}&lang=${language}`
      );
      if (res.ok) {
        const data = (await res.json()) as {
          verses?: QuranVerseFixture[];
        };
        if (data.verses && data.verses.length > 0) {
          setSelectedPassages(data.verses);
          setActiveVerseIndex(0);
          setActiveAudioVerseId(data.verses[0].id);
          OfflineCacheService.cachePassages(data.verses);
          setAnalysisResult({
            status: 'matched',
            detectedSituation: `Surah ${surahMeta.nameTransliterated} (${surahNumber}:${fromAyah}${toAyah > fromAyah ? `–${toAyah}` : ''})`,
            detectedEmotion: surahMeta.nameArabic,
            underlyingNeed: surahMeta.meaning[language] || surahMeta.meaning.en,
            matchedPassageIds: data.verses.map((v) => v.id),
            relevanceExplanation: `Surah ${surahMeta.nameTransliterated} — ${surahMeta.meaning[language] || surahMeta.meaning.en}`,
          });
          setActiveNavTab('guidance');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }
    } catch (err) {
      console.warn('Failed to load sequential verses into universal reader:', err);
    }

    // 3. Fallback: single verse fetch if sequence fetch fails
    try {
      const res = await fetch(`/api/quran/ayah?surah=${surahNumber}&ayah=${ayahNumber}&lang=${language}`);
      if (res.ok) {
        const payload = (await res.json()) as { verse?: QuranVerseFixture } | QuranVerseFixture;
        const verseData = ('verse' in payload && payload.verse ? payload.verse : payload) as QuranVerseFixture;
        if (verseData && verseData.id) {
          setSelectedPassages([verseData]);
          setActiveVerseIndex(0);
          setActiveAudioVerseId(verseData.id);
          OfflineCacheService.cachePassages([verseData]);
          setAnalysisResult({
            status: 'matched',
            detectedSituation: `Surah ${verseData.surahNameTransliterated} (${surahNumber}:${ayahNumber})`,
            detectedEmotion: verseData.surahNameArabic,
            underlyingNeed: verseData.surahNameMeaning,
            matchedPassageIds: [verseData.id],
            relevanceExplanation: `Surah ${verseData.surahNameTransliterated} — ${verseData.surahNameMeaning}`,
          });
          setActiveNavTab('guidance');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }
    } catch (err) {
      console.warn('Fallback single verse fetch failed:', err);
    }
  };

  // Toggle Continuous Quran Reading Mode: remembers current contemplation verse and restores it on exit
  const handleToggleContinuousReading = async () => {
    if (isContinuousReading) {
      // Exit continuous reading mode: restore previous contemplation state
      if (savedContemplationStateRef.current) {
        const saved = savedContemplationStateRef.current;
        setSelectedPassages(saved.passages);
        setActiveVerseIndex(saved.index);
        if (saved.audioId) setActiveAudioVerseId(saved.audioId);
        if (saved.analysis) setAnalysisResult(saved.analysis);
        savedContemplationStateRef.current = null;
      }
      setIsContinuousReading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Enter continuous reading mode: save current state and load sequential surah verses starting from current ayah
      const currentVerse = displayedPassages[activeVerseIndex] || displayedPassages[0];
      if (!currentVerse) return;

      savedContemplationStateRef.current = {
        passages: [...displayedPassages],
        index: activeVerseIndex,
        audioId: activeAudioVerseId,
        analysis: analysisResult,
      };
      setIsContinuousReading(true);

      const surahNumber = currentVerse.surahNumber;
      const ayahNumber = parseInt(String(currentVerse.verseNumber).split('-')[0], 10) || 1;
      await handleNavigateToRead(surahNumber, ayahNumber);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchQuery, language);
  };

  const switchTab = (tab: BottomNavTab) => {
    setActiveNavTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      lang={lang}
      className={`min-h-screen flex flex-col transition-colors ${
        mounted && isHighContrast ? 'contrast-125' : ''
      } ${
        lang === 'ar' ? 'font-arabic' : ''
      } bg-[#FAF8F5] dark:bg-[#061B16] text-slate-900 dark:text-[#F5F7F2]`}
    >
      {/* Ultra-Minimalist Top Header (Brand + Preferences Icon + Integrated Search & Global Play) */}
      <Header
        language={language}
        onLanguageChange={setLanguage}
        onSelectHome={() => {
          switchTab('guidance');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenPreferences={() => switchTab('preferences')}
        isPreferencesOpen={activeNavTab === 'preferences'}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSubmitSearch={handleSearchSubmit}
        isAnalyzing={isAnalyzing}
        isListening={isListening}
        onToggleVoice={toggleVoiceInput}
        speechError={speechError}
        onVoiceTranscript={(transcript) => {
          setSearchQuery(transcript);
          executeSearch(transcript, language);
        }}
        onSelectPill={(pill) => handleQuickPillSelect(pill, language)}
        onSelectTodayFocus={(passageId) => {
          const match = QURAN_FIXTURES.find((f) => f.id === passageId);
          if (match) {
            handleSelectSpecificVerse(match);
          } else {
            setSearchQuery(passageId);
            executeSearch(passageId, language);
          }
        }}
        onSelectSurah={(surahNumber, ayahNumber = 1) => {
          handleNavigateToRead(surahNumber, ayahNumber);
        }}
        onSelectBookmark={(verseId) => {
          const match = QURAN_FIXTURES.find((f) => f.id === verseId);
          if (match) {
            handleSelectSpecificVerse(match);
          } else {
            setSearchQuery(verseId);
            executeSearch(verseId, language);
          }
        }}
      />

      {/* Dedicated Tab Viewport — Edge-to-Edge Full-Width Responsive with Safe Touch Margins */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-2 sm:px-4 py-2 sm:py-4">
        {/* TAB 1: GUIDANCE (Search, Topics & Inline Verse Study — Universal Sanctuary Reels Mode) */}
        {activeNavTab === 'guidance' && (
          <div className="space-y-3 sm:space-y-4">
            {isAnalyzing && (
              <div className="text-center py-10 space-y-3" role="status" aria-live="polite">
                <div className="w-9 h-9 border-2 border-[#006D53] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs sm:text-sm font-medium text-emerald-900 dark:text-[#F5F7F2]">
                  {dict.seekingStatus}
                </p>
              </div>
            )}

            {!isAnalyzing && analysisResult?.status === 'off-topic' && (
              <OffTopicBanner
                message={analysisResult.offTopicMessage}
                onSelectSuggestion={(query) => {
                  setSearchQuery(query);
                  executeSearch(query, language);
                }}
              />
            )}

            {!isAnalyzing && displayedPassages.length > 0 && (() => {
              const totalVerses = displayedPassages.length;
              const safeIndex = Math.min(activeVerseIndex, totalVerses - 1);
              const currentVerse = displayedPassages[safeIndex] || displayedPassages[0];

              return (
                <section
                  id="passages-section"
                  aria-label="Quranic Passages"
                  className="space-y-2.5 sm:space-y-3"
                  onTouchStart={handleContainerTouchStart}
                  onTouchEnd={handleContainerTouchEnd}
                >
                  {/* Surah Name & Ayah Indicator Bar (Multi-verse segmented bar or single-verse banner) */}
                  {totalVerses > 1 ? (
                    <div className="space-y-2 px-1">
                      {/* Segmented Bar */}
                      <div className="flex items-center gap-1 sm:gap-1.5" role="tablist" aria-label="Passage progression">
                        {displayedPassages.map((p, idx) => {
                          const isCurrent = idx === safeIndex;
                          const isPast = idx < safeIndex;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => handleAdvanceToVerse(idx)}
                              aria-label={`Go to Ayah ${p.id} (${idx + 1}/${totalVerses})`}
                              className={`h-1.5 rounded-full transition-all flex-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B900] ${
                                isCurrent
                                  ? 'bg-[#006D53] dark:bg-[#F4B900]'
                                  : isPast
                                  ? 'bg-emerald-800/40 dark:bg-emerald-700/50'
                                  : 'bg-emerald-900/15 dark:bg-emerald-900/30 hover:bg-emerald-900/30'
                              }`}
                            />
                          );
                        })}
                      </div>

                      {/* Subtitle with Ayah indicator & Previous / Next buttons */}
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#9BAFA7]">
                        <span className="font-semibold text-emerald-950 dark:text-[#F5F7F2] tabular-nums flex items-center gap-1.5">
                          <span>
                            {language === 'ar'
                              ? `الآية ${safeIndex + 1} من ${totalVerses}`
                              : language === 'fr'
                              ? `Verset ${safeIndex + 1} sur ${totalVerses}`
                              : language === 'sv'
                              ? `Vers ${safeIndex + 1} av ${totalVerses}`
                              : `Ayah ${safeIndex + 1} of ${totalVerses}`}
                          </span>
                          <span className="text-slate-400" aria-hidden="true">·</span>
                          <span className="font-mono text-[11px] text-[#006D53] dark:text-[#F4B900]">
                            <button
                              type="button"
                              onClick={() => {
                                const firstNum =
                                  parseInt(String(currentVerse.verseNumber || currentVerse.id).split('-')[0], 10) || 1;
                                handleNavigateToRead(currentVerse.surahNumber, firstNum);
                              }}
                              className="hover:underline cursor-pointer transition-colors"
                              title={language === 'fr' ? 'Lancer la lecture séquentielle' : 'Start sequential reading'}
                            >
                              {currentVerse.surahNameTransliterated} {currentVerse.id}
                            </button>
                          </span>
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleAdvanceToVerse(safeIndex - 1)}
                            disabled={safeIndex === 0}
                            aria-label="Previous Ayah"
                            className="p-1 rounded-lg text-slate-500 hover:text-emerald-800 dark:text-[#9BAFA7] dark:hover:text-[#F5F7F2] hover:bg-emerald-900/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                          >
                            <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdvanceToVerse(safeIndex + 1)}
                            disabled={safeIndex === totalVerses - 1}
                            aria-label="Next Ayah"
                            className="p-1 rounded-lg text-slate-500 hover:text-emerald-800 dark:text-[#9BAFA7] dark:hover:text-[#F5F7F2] hover:bg-emerald-900/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                          >
                            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between px-2 py-1 text-xs text-slate-500 dark:text-[#9BAFA7]">
                      <button
                        type="button"
                        onClick={() => {
                          const firstNum =
                            parseInt(String(currentVerse.verseNumber || currentVerse.id).split('-')[0], 10) || 1;
                          handleNavigateToRead(currentVerse.surahNumber, firstNum);
                        }}
                        className="hover:underline cursor-pointer transition-colors font-semibold text-emerald-950 dark:text-[#F5F7F2] flex items-center gap-2"
                        title={language === 'fr' ? 'Lancer la lecture dans le Coran' : 'Read in Quran'}
                      >
                        <span className="font-bold text-sm text-emerald-950 dark:text-[#F5F7F2]">
                          {currentVerse.surahNameTransliterated}
                        </span>
                        <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-emerald-900/10 dark:bg-emerald-800/30 text-[#006D53] dark:text-[#F4B900]">
                          {currentVerse.id}
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Single Active Universal Verse Card */}
                  <div
                    key={currentVerse.id}
                    id={`verse-${currentVerse.id}`}
                    className="transition-all"
                  >
                    <VerseCard
                      selection={passageSelections[currentVerse.id]}
                      onSelectionChange={(selection) =>
                        setPassageSelections((previous) => ({
                          ...previous,
                          [currentVerse.id]: selection,
                        }))
                      }
                      verse={currentVerse}
                      nextVerse={displayedPassages[safeIndex + 1] || displayedPassages[0]}
                      language={language}
                      arabicScale={arabicScale}
                      readingScale={readingScale}
                      cardIndex={safeIndex}
                      totalCards={totalVerses}
                      showTransliteration={showTransliteration}
                      isBookmarked={bookmarks.includes(currentVerse.id)}
                      onToggleBookmark={handleToggleBookmark}
                      onReflectionSaved={() => setReflections(StorageService.getReflections())}
                      explanationDepth={explanationDepth}
                      perspectiveMode={perspectiveMode}
                      readerProfile={readerProfile}
                      preferredScholar={preferredScholar}
                      onNavigateToRead={handleNavigateToRead}
                      isActive={true}
                      isGlobalPlaying={isGlobalPlaying}
                      isContinuousReading={isContinuousReading}
                      onToggleContinuousReading={handleToggleContinuousReading}
                      onNextVerse={() => handleAdvanceToVerse(safeIndex + 1)}
                      onPreviousVerse={() => handleAdvanceToVerse(safeIndex - 1)}
                      cardPreferences={cardPreferences}
                    />
                  </div>
                </section>
              );
            })()}
          </div>
        )}

        {/* TAB 2: AUDIO (Dedicated Continuous Audio Player Page) */}
        {activeNavTab === 'audio' && (
          <React.Suspense fallback={<div className="py-12 text-center text-xs text-emerald-800/60 dark:text-[#9BAFA7]/60 animate-pulse">Loading audio session...</div>}>
            <ContinuousSessionAudioPlayer
              inlinePage
              verses={audioPassages}
              language={language}
              onActiveVerseChange={(verseId) => setActiveAudioVerseId(verseId)}
              onNavigateToRead={handleNavigateToRead}
            />
          </React.Suspense>
        )}

        {/* TAB 3: READ (Dedicated Read the Quran Page — Sourates, Juz', Favoris & Focused Verse Reader) */}
        {activeNavTab === 'read' && (
          <React.Suspense fallback={<div className="py-12 text-center text-xs text-emerald-800/60 dark:text-[#9BAFA7]/60 animate-pulse">Loading Quran reader...</div>}>
            <QuranReaderPage
              language={language}
              arabicScale={arabicScale}
              readingScale={readingScale}
              showTransliteration={showTransliteration}
              bookmarks={bookmarks}
              onToggleBookmark={handleToggleBookmark}
              preferredScholar={preferredScholar}
              readerProfile={readerProfile}
              initialTarget={readTarget}
              onTargetChange={setReadTarget}
              onOpenJournal={() => switchTab('journal')}
              onOpenUniversalVerse={handleNavigateToRead}
            />
          </React.Suspense>
        )}

        {/* TAB 4: NORTH STAR (Dedicated Daily Passage Page) */}
        {activeNavTab === 'northStar' && (
          <section aria-label="Daily Contemplation Anchor" className="space-y-6">
            <DailyNorthStar
              language={language}
              arabicScale={arabicScale}
              showTransliteration={showTransliteration}
              onSelectVerse={handleSelectVerseAndGoToGuidance}
              onOpenReflection={handleSelectVerseAndGoToGuidance}
              onNavigateToRead={handleNavigateToRead}
            />
          </section>
        )}

        {/* TAB 5: JOURNAL (Dedicated Saved Verses & Reflections Page) */}
        {activeNavTab === 'journal' && (
          <React.Suspense fallback={<div className="py-12 text-center text-xs text-emerald-800/60 dark:text-[#9BAFA7]/60 animate-pulse">Loading journal...</div>}>
            <JournalDrawer
              isOpen
              inlinePage
              allVerses={QURAN_FIXTURES}
              language={language}
              onSelectVerse={handleSelectVerseAndGoToGuidance}
              onRemoveBookmark={handleToggleBookmark}
              onNavigateToRead={handleNavigateToRead}
            />
          </React.Suspense>
        )}

        {/* TAB 6: PREFERENCES (Dedicated Settings & Depth Page) */}
        {activeNavTab === 'preferences' && (
          <React.Suspense fallback={<div className="py-12 text-center text-xs text-emerald-800/60 dark:text-[#9BAFA7]/60 animate-pulse">Loading preferences...</div>}>
            <CustomizationSheet
              isOpen
              inlinePage
              onClose={() => switchTab('guidance')}
              language={language}
              onLanguageChange={setLanguage}
              isDark={isDark}
              onToggleDark={() => setIsDark(!isDark)}
              readerProfile={readerProfile}
              onReaderProfileChange={setReaderProfile}
              activeMode={activeMode}
              onEntryModeChange={setActiveMode}
              preferredScholar={preferredScholar}
              onPreferredScholarChange={setPreferredScholar}
              sessionDepth={sessionDepth}
              onSessionDepthChange={setSessionDepth}
              explanationDepth={explanationDepth}
              onExplanationDepthChange={setExplanationDepth}
              activeSphere={activeSphere}
              onSphereChange={setActiveSphere}
              arabicScale={arabicScale}
              onArabicScaleChange={setArabicScale}
              readingScale={readingScale}
              onReadingScaleChange={(scale) => {
                setReadingScale(scale);
                StorageService.setReadingScale(scale);
              }}
              showTransliteration={showTransliteration}
              onToggleTransliteration={() => setShowTransliteration(!showTransliteration)}
              isHighContrast={isHighContrast}
              onToggleHighContrast={() => setIsHighContrast(!isHighContrast)}
              perspectiveMode={perspectiveMode}
              onTogglePerspective={() =>
                setPerspectiveMode((prev) => (prev === 'devotional' ? 'inquirer' : 'devotional'))
              }
              showReadPage={showReadPage}
              onToggleShowReadPage={() => setShowReadPage((prev) => !prev)}
              showNorthStarPage={showNorthStarPage}
              onToggleShowNorthStarPage={() => setShowNorthStarPage((prev) => !prev)}
              cardPreferences={cardPreferences}
              onCardPreferencesChange={(updates) => setCardPreferences((prev) => ({ ...prev, ...updates }))}
              isFullscreenActive={isFullscreenActive}
              onToggleFullscreenTv={toggleFullscreenTv}
            />
          </React.Suspense>
        )}

        {/* Ethical Boundaries & Al-Isra 17:105 Footer */}
        <Footer language={language} />
      </main>
    </div>
  );
}
