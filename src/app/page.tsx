"use client";

/**
 * @file page.tsx
 * @description Main application shell for Hidaya: Quran Guidance & Reflection.
 * Implements a serene, zero-popup 5-tab architecture where each bottom tab
 * (`Guidance`, `Audio`, `North Star`, `Journal`, `Preferences`) renders its own
 * dedicated screen, paired with a minimalist header and inline Tafsir & Reflection
 * inside each verse card.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Language,
  QuranVerseFixture,
  ExplanationDepth,
  UserReflection,
  PerspectiveMode,
  ReaderProfile,
  PreferredScholar,
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
import { GuidanceSearchBar } from '../components/GuidanceSearchBar';
import { QuickChoicePills } from '../components/QuickChoicePills';
import { OffTopicBanner } from '../components/OffTopicBanner';
import { ContinuousSessionAudioPlayer } from '../components/ContinuousSessionAudioPlayer';
import { expandPassage, PassageSelection } from '../services/passageSelection';
import { VerseCard } from '../components/VerseCard';
import { CustomizationSheet } from '../components/CustomizationSheet';
import { JournalDrawer } from '../components/JournalDrawer';
import { BottomNav, BottomNavTab } from '../components/BottomNav';
import { Footer } from '../components/Footer';

export default function App() {
  const [passageSelections, setPassageSelections] = useState<Record<string, PassageSelection>>({});
  const [mounted, setMounted] = useState(false);
  const [activeNavTab, setActiveNavTab] = useState<BottomNavTab>('guidance');

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

  useEffect(() => {
    if (!mounted) return;
    StorageService.setReaderProfile(readerProfile);
  }, [readerProfile, mounted]);

  useEffect(() => {
    if (!mounted) return;
    StorageService.setPreferredScholar(preferredScholar);
  }, [preferredScholar, mounted]);

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
      {/* Ultra-Minimalist Top Header (Brand + Language Switcher + Preferences Icon) */}
      <Header
        language={language}
        onLanguageChange={setLanguage}
        onSelectHome={() => switchTab('guidance')}
        onOpenPreferences={() => switchTab('preferences')}
        isPreferencesOpen={activeNavTab === 'preferences'}
      />

      {/* Dedicated Tab Viewport — Each Onglet Manages Its Own Page With Zero Popups */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-36 sm:pb-40">
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
                {displayedPassages.length > 1 && (
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-white/80 dark:bg-[#0A1E17]/80 border border-emerald-900/10 dark:border-emerald-800/30 backdrop-blur-xs text-xs">
                    <span className="font-semibold text-emerald-950 dark:text-emerald-200">
                      {language === 'ar'
                        ? `${displayedPassages.length} آيات مطابقة للبحث`
                        : `${displayedPassages.length} Quranic Passages Found`}
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {displayedPassages.map((p, idx) => (
                        <a
                          key={p.id}
                          href={`#verse-${p.id}`}
                          className="px-2.5 py-1 rounded-xl bg-emerald-950/5 dark:bg-emerald-900/30 hover:bg-emerald-800 hover:text-white dark:hover:bg-emerald-700 text-emerald-900 dark:text-emerald-200 transition-colors font-medium border border-emerald-900/10 dark:border-emerald-800/40"
                        >
                          Ayah {p.id}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {displayedPassages.map((verse, idx) => (
                  <div
                    key={verse.id}
                    id={`verse-${verse.id}`}
                    className={
                      (activeAudioVerseId === verse.id || activeAudioVerseId === expandPassage(verse, passageSelections[verse.id])?.id)
                        ? 'ring-2 ring-amber-500/80 rounded-3xl transition-all'
                        : ''
                    }
                  >
                    <VerseCard
                      selection={passageSelections[verse.id]}
                      onSelectionChange={(selection) => setPassageSelections(previous => ({ ...previous, [verse.id]: selection }))}
                      verse={verse}
                      language={language}
                      arabicScale={arabicScale}
                      readingScale={readingScale}
                      cardIndex={idx}
                      totalCards={displayedPassages.length}
                      showTransliteration={showTransliteration}
                      isBookmarked={bookmarks.includes(verse.id)}
                      onToggleBookmark={handleToggleBookmark}
                      onReflectionSaved={() => setReflections(StorageService.getReflections())}
                      explanationDepth={explanationDepth}
                      perspectiveMode={perspectiveMode}
                      readerProfile={readerProfile}
                      preferredScholar={preferredScholar}
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
            verses={audioPassages}
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
          />
        )}

        {/* Ethical Boundaries & Al-Isra 17:105 Footer */}
        <Footer language={language} />
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
