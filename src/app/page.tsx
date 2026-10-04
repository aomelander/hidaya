"use client";

/**
 * @file page.tsx
 * @description Main application shell for Hidaya: Quran Guidance & Reflection.
 * Implements a serene, zero-popup 5-tab architecture where each bottom tab
 * (`Guidance`, `Audio`, `North Star`, `Journal`, `Preferences`) renders its own
 * dedicated screen, paired with a minimalist header and inline Tafsir & Reflection
 * inside each verse card.
 */

import React, { useState, useEffect } from 'react';
import {
  Language,
  QuranVerseFixture,
  ExplanationDepth,
  UserReflection,
  PerspectiveMode,
} from '../types';
import { Locale, getDictionary } from '../lib/i18n/dictionaries';
import { QURAN_FIXTURES } from '../data/quranFixtures';
import { StorageService } from '../services/storage';
import { APP_CONFIG } from '../config/appConfig';
import { useGuidanceSearch } from '../hooks/useGuidanceSearch';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

// Core Tab Views & Components (Zero Popup Modals)
import { Header } from '../components/Header';
import { DailyNorthStar } from '../components/DailyNorthStar';
import { EntryModeTabs } from '../components/EntryModeTabs';
import { GuidanceSearchBar } from '../components/GuidanceSearchBar';
import { QuickChoicePills } from '../components/QuickChoicePills';
import { GuidanceContextBanner } from '../components/GuidanceContextBanner';
import { OffTopicBanner } from '../components/OffTopicBanner';
import { ContinuousSessionAudioPlayer } from '../components/ContinuousSessionAudioPlayer';
import { VerseCard } from '../components/VerseCard';
import { CustomizationSheet } from '../components/CustomizationSheet';
import { JournalDrawer } from '../components/JournalDrawer';
import { BottomNav, BottomNavTab } from '../components/BottomNav';

export default function App() {
  const [mounted, setMounted] = useState(false);
  const [activeNavTab, setActiveNavTab] = useState<BottomNavTab>('guidance');

  // User Preferences State
  const [language, setLanguage] = useState<Language>(APP_CONFIG.DEFAULTS.LANGUAGE);
  const [arabicScale, setArabicScale] = useState<number>(APP_CONFIG.DEFAULTS.ARABIC_SCALE);
  const [showTransliteration, setShowTransliteration] = useState<boolean>(
    APP_CONFIG.DEFAULTS.SHOW_TRANSLITERATION
  );
  const [isDark, setIsDark] = useState<boolean>(APP_CONFIG.DEFAULTS.DARK_MODE);
  const [isHighContrast, setIsHighContrast] = useState<boolean>(
    APP_CONFIG.DEFAULTS.HIGH_CONTRAST
  );
  const [bookmarks, setBookmarks] = useState<string[]>([APP_CONFIG.DEFAULTS.INITIAL_VERSE_ID]);
  const [, setReflections] = useState<Record<string, UserReflection>>({});

  // Contemplation & Exegesis Depth Configuration
  const [explanationDepth, setExplanationDepth] = useState<ExplanationDepth>('context');
  const [perspectiveMode, setPerspectiveMode] = useState<PerspectiveMode>('devotional');
  const [activeAudioVerseId, setActiveAudioVerseId] = useState<string | null>(null);

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
    selectedPassages,
    displayedPassages,
    executeSearch,
    handleQuickPillSelect,
    handleSelectSpecificVerse,
  } = useGuidanceSearch(language);

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
    setShowTransliteration(StorageService.getShowTransliteration());
    setIsDark(StorageService.getDarkMode());
    setIsHighContrast(StorageService.getHighContrast());
    setBookmarks(StorageService.getBookmarks());
    setReflections(StorageService.getReflections());
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

  // Persist Preferences
  useEffect(() => {
    if (!mounted) return;
    StorageService.setLanguage(language);
  }, [language, mounted]);

  useEffect(() => {
    if (!mounted) return;
    StorageService.setFontSizeMultiplier(arabicScale);
  }, [arabicScale, mounted]);

  useEffect(() => {
    if (!mounted) return;
    StorageService.setShowTransliteration(showTransliteration);
  }, [showTransliteration, mounted]);

  useEffect(() => {
    if (!mounted) return;
    StorageService.setHighContrast(isHighContrast);
  }, [isHighContrast, mounted]);

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
      } bg-[#FAF8F5] dark:bg-[#07140F] text-slate-900 dark:text-slate-100`}
    >
      {/* Ultra-Minimalist Top Header (Brand + Language Switcher Only) */}
      <Header
        language={language}
        onLanguageChange={setLanguage}
        onSelectHome={() => switchTab('guidance')}
      />

      {/* Dedicated Tab Viewport — Each Onglet Manages Its Own Page With Zero Popups */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28">
        {/* TAB 1: GUIDANCE (Search, Topics & Inline Verse Study) */}
        {activeNavTab === 'guidance' && (
          <div className="space-y-6">
            <section
              id="guidance-portal"
              aria-label="Guidance Portal"
              className="space-y-4 p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0A1E17] border border-emerald-900/10 dark:border-emerald-800/35 shadow-2xs"
            >
              <div>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-emerald-950 dark:text-emerald-50">
                  {dict.portalTitle}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {dict.portalSubtitle}
                </p>
              </div>

              <EntryModeTabs
                activeMode={activeMode}
                onSelectMode={setActiveMode}
                language={language}
              />

              <GuidanceSearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSubmit={handleSearchSubmit}
                isAnalyzing={isAnalyzing}
                isListening={isListening}
                speechError={speechError}
                onToggleVoice={toggleVoiceInput}
                activeMode={activeMode}
                language={language}
                onVoiceTranscript={(transcript) => {
                  setSearchQuery(transcript);
                  executeSearch(transcript, language);
                }}
              />

              <QuickChoicePills
                activeMode={activeMode}
                language={language}
                onSelectPill={(pill) => handleQuickPillSelect(pill, language)}
              />
            </section>

            {isAnalyzing && (
              <div className="text-center py-10 space-y-3" role="status" aria-live="polite">
                <div className="w-9 h-9 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs sm:text-sm font-medium text-emerald-900 dark:text-emerald-200">
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

            {!isAnalyzing && displayedPassages.length > 0 && (
              <section id="passages-section" aria-label="Quranic Passages" className="space-y-5">
                {displayedPassages.map((verse) => (
                  <div
                    key={verse.id}
                    className={
                      activeAudioVerseId === verse.id
                        ? 'ring-2 ring-amber-500/80 rounded-3xl transition-all'
                        : ''
                    }
                  >
                    <VerseCard
                      verse={verse}
                      language={language}
                      arabicScale={arabicScale}
                      showTransliteration={showTransliteration}
                      isBookmarked={bookmarks.includes(verse.id)}
                      onToggleBookmark={handleToggleBookmark}
                      onReflectionSaved={() => setReflections(StorageService.getReflections())}
                      explanationDepth={explanationDepth}
                      perspectiveMode={perspectiveMode}
                    />
                  </div>
                ))}
              </section>
            )}
          </div>
        )}

        {/* TAB 2: AUDIO (Dedicated Continuous Audio Player Page) */}
        {activeNavTab === 'audio' && (
          <ContinuousSessionAudioPlayer
            inlinePage
            verses={displayedPassages.length > 0 ? displayedPassages : selectedPassages}
            language={language}
            onActiveVerseChange={(verseId) => setActiveAudioVerseId(verseId)}
          />
        )}

        {/* TAB 3: NORTH STAR (Dedicated Daily Passage Page) */}
        {activeNavTab === 'northStar' && (
          <section aria-label="Daily Contemplation Anchor" className="space-y-6">
            <DailyNorthStar
              language={language}
              arabicScale={arabicScale}
              showTransliteration={showTransliteration}
              onSelectVerse={handleSelectVerseAndGoToGuidance}
              onOpenReflection={handleSelectVerseAndGoToGuidance}
            />
          </section>
        )}

        {/* TAB 4: JOURNAL (Dedicated Saved Verses & Reflections Page) */}
        {activeNavTab === 'journal' && (
          <JournalDrawer
            isOpen
            inlinePage
            allVerses={QURAN_FIXTURES}
            language={language}
            onSelectVerse={handleSelectVerseAndGoToGuidance}
            onRemoveBookmark={handleToggleBookmark}
          />
        )}

        {/* TAB 5: PREFERENCES (Dedicated Settings & Depth Page) */}
        {activeNavTab === 'preferences' && (
          <CustomizationSheet
            isOpen
            inlinePage
            onClose={() => switchTab('guidance')}
            language={language}
            onLanguageChange={setLanguage}
            isDark={isDark}
            onToggleDark={() => setIsDark(!isDark)}
            sessionDepth={sessionDepth}
            onSessionDepthChange={setSessionDepth}
            explanationDepth={explanationDepth}
            onExplanationDepthChange={setExplanationDepth}
            activeSphere={activeSphere}
            onSphereChange={setActiveSphere}
            arabicScale={arabicScale}
            onArabicScaleChange={setArabicScale}
            showTransliteration={showTransliteration}
            onToggleTransliteration={() => setShowTransliteration(!showTransliteration)}
            isHighContrast={isHighContrast}
            onToggleHighContrast={() => setIsHighContrast(!isHighContrast)}
            perspectiveMode={perspectiveMode}
            onTogglePerspective={() =>
              setPerspectiveMode((prev) => (prev === 'devotional' ? 'inquirer' : 'devotional'))
            }
          />
        )}
      </main>

      {/* Unified 5-Tab Bottom Navigation Bar */}
      <BottomNav
        locale={lang}
        activeTab={activeNavTab}
        isAudioActive={activeNavTab === 'audio'}
        isPreferencesOpen={activeNavTab === 'preferences'}
        isJournalOpen={activeNavTab === 'journal'}
        bookmarkCount={mounted ? bookmarks.length : 0}
        onSelectGuidance={() => switchTab('guidance')}
        onToggleAudio={() => switchTab('audio')}
        onSelectNorthStar={() => switchTab('northStar')}
        onOpenJournal={() => switchTab('journal')}
        onOpenPreferences={() => switchTab('preferences')}
      />
    </div>
  );
}
