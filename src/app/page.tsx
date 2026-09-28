"use client";

/**
 * @file page.tsx
 * @description Main application page for Hidaya: Quran Guidance & Reflection.
 * Orchestrates modular components: header, hero, search bar, mode tabs,
 * context analysis, passage cards, and contemplation drawers/modals.
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, Headphones } from 'lucide-react';
import {
  Language,
  QuranVerseFixture,
  ExplanationDepth,
  UserReflection,
  PerspectiveMode,
} from '../types';
import { QURAN_FIXTURES } from '../data/quranFixtures';
import { StorageService } from '../services/storage';
import { APP_CONFIG } from '../config/appConfig';
import { useGuidanceSearch } from '../hooks/useGuidanceSearch';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

// Modular UI Components
import { Header } from '../components/Header';
import { DailyNorthStar } from '../components/DailyNorthStar';
import { EntryModeTabs } from '../components/EntryModeTabs';
import { SphereFilter } from '../components/SphereFilter';
import { GuidanceSearchBar } from '../components/GuidanceSearchBar';
import { QuickChoicePills } from '../components/QuickChoicePills';
import { GuidanceContextBanner } from '../components/GuidanceContextBanner';
import { OffTopicBanner } from '../components/OffTopicBanner';
import { SessionDepthSelector } from '../components/SessionDepthSelector';
import { ExplanationDepthSelector } from '../components/ExplanationDepthSelector';
import { ContinuousSessionAudioPlayer } from '../components/ContinuousSessionAudioPlayer';
import { VerseCard } from '../components/VerseCard';
import { Footer } from '../components/Footer';

// Modals & Drawers
import { UnsureGuidanceModal } from '../components/UnsureGuidanceModal';
import { HalaqahModal } from '../components/HalaqahModal';
import { TafsirDrawer } from '../components/TafsirDrawer';
import { ReflectionDrawer } from '../components/ReflectionDrawer';
import { BookmarksModal } from '../components/BookmarksModal';
import { DisclaimerModal } from '../components/DisclaimerModal';
import { PrintableReflection } from '../components/PrintableReflection';
import { LicenseRegistryModal } from '../components/LicenseRegistryModal';
import { VisualCardModal } from '../components/VisualCardModal';
import { MyJourneyModal } from '../components/MyJourneyModal';
import { EditorialConsoleModal } from '../components/EditorialConsoleModal';
import { InquirerGlossaryModal } from '../components/InquirerGlossaryModal';
import { InquirerPerspectiveBanner } from '../components/InquirerPerspectiveBanner';

export default function App() {
  const [mounted, setMounted] = useState(false);

  // User Preferences State (initialized with deterministic defaults matching SSR)
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
  const [reflections, setReflections] = useState<Record<string, UserReflection>>({});

  // Contemplation & Exegesis Depth Configuration
  const [explanationDepth, setExplanationDepth] = useState<ExplanationDepth>('context');
  const [perspectiveMode, setPerspectiveMode] = useState<PerspectiveMode>('devotional');

  // Audio Playback State
  const [isContinuousAudioOpen, setIsContinuousAudioOpen] = useState(false);
  const [activeAudioVerseId, setActiveAudioVerseId] = useState<string | null>(null);

  // Modals & Drawers Visibility State
  const [selectedTafsirVerse, setSelectedTafsirVerse] = useState<QuranVerseFixture | null>(null);
  const [selectedReflectionVerse, setSelectedReflectionVerse] = useState<QuranVerseFixture | null>(null);
  const [selectedHalaqahVerse, setSelectedHalaqahVerse] = useState<QuranVerseFixture | null>(null);
  const [selectedVisualCardVerse, setSelectedVisualCardVerse] = useState<QuranVerseFixture | null>(null);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [isUnsureModalOpen, setIsUnsureModalOpen] = useState(false);
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [isJourneyModalOpen, setIsJourneyModalOpen] = useState(false);
  const [isEditorialConsoleOpen, setIsEditorialConsoleOpen] = useState(false);
  const [isGlossaryModalOpen, setIsGlossaryModalOpen] = useState(false);

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

  // Web Speech Recognition Hook
  const { isListening, toggleVoiceInput } = useSpeechRecognition({
    language,
    onResult: (transcript) => {
      setSearchQuery(transcript);
      executeSearch(transcript, language);
    },
  });

  // Client Mount Hydration: load stored user data without SSR mismatch
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

  // Dark Mode Sync with DOM
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

  // Sync Preferences to Storage after hydration mount
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

  // Initial Load: Mount default verified fixture (3:134 - Anger and restraint)
  useEffect(() => {
    const defaultVerse = QURAN_FIXTURES.find((f) => f.id === '3:134') || QURAN_FIXTURES[0];
    handleSelectSpecificVerse(defaultVerse);
  }, [handleSelectSpecificVerse]);

  // Toggle Bookmark Handler
  const handleToggleBookmark = (verseId: string) => {
    StorageService.toggleBookmark(verseId);
    setBookmarks(StorageService.getBookmarks());
  };

  // Select verse from North Star
  const handleSelectNorthStarVerse = (verse: QuranVerseFixture) => {
    handleSelectSpecificVerse(verse);
    const element = document.getElementById('passages-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Submit Search Query
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchQuery, language);
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors ${
        mounted && isHighContrast ? 'contrast-125' : ''
      } bg-[#FAF8F5] dark:bg-[#07140F] text-slate-900 dark:text-slate-100`}
    >
      {/* Global Header */}
      <Header
        language={language}
        onLanguageChange={setLanguage}
        arabicScale={arabicScale}
        onScaleChange={setArabicScale}
        showTransliteration={showTransliteration}
        onToggleTransliteration={() => setShowTransliteration(!showTransliteration)}
        isDark={isDark}
        onToggleDark={() => setIsDark(!isDark)}
        isHighContrast={isHighContrast}
        onToggleHighContrast={() => setIsHighContrast(!isHighContrast)}
        bookmarkCount={mounted ? bookmarks.length : 0}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        onOpenDisclaimer={() => setIsDisclaimerOpen(true)}
        onOpenJourney={() => setIsJourneyModalOpen(true)}
        onOpenLicenseRegistry={() => setIsLicenseModalOpen(true)}
        onOpenEditorialConsole={() => setIsEditorialConsoleOpen(true)}
        perspectiveMode={perspectiveMode}
        onTogglePerspective={() =>
          setPerspectiveMode((prev) => (prev === 'devotional' ? 'inquirer' : 'devotional'))
        }
        reflectionCount={mounted ? Object.keys(reflections).length : 0}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 no-print">
        {/* Inquirer Perspective Banner (if active) */}
        {perspectiveMode === 'inquirer' && (
          <InquirerPerspectiveBanner
            language={language}
            onOpenGlossary={() => setIsGlossaryModalOpen(true)}
            onSwitchPerspective={() => setPerspectiveMode('devotional')}
          />
        )}

        {/* Sacred Hero Introduction */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/5 dark:bg-emerald-800/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-900/10 dark:border-emerald-700/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Source-Grounded Quranic Guidance & Contemplation</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-emerald-950 dark:text-emerald-50">
            Turn to the Quran in Every State of Heart
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Discover verified passages, classical exegesis (Tafsir), and an actionable reflection framework for real-life decisions, emotions, and character growth.
          </p>
        </section>

        {/* Daily North Star (Dagens Ledstjärna) */}
        <DailyNorthStar
          language={language}
          arabicScale={arabicScale}
          showTransliteration={showTransliteration}
          onSelectVerse={handleSelectNorthStarVerse}
          onOpenReflection={(v) => setSelectedReflectionVerse(v)}
        />

        {/* 3 Entry Modes Navigation Tabs */}
        <EntryModeTabs
          activeMode={activeMode}
          onSelectMode={setActiveMode}
          onOpenUnsureModal={() => setIsUnsureModalOpen(true)}
          language={language}
        />

        {/* 3 Human Spheres Filter: Individual, Family, Society */}
        <SphereFilter
          activeSphere={activeSphere}
          onSelectSphere={setActiveSphere}
          language={language}
        />

        {/* Search Input Bar (Text + Voice) */}
        <div>
          <GuidanceSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSubmit={handleSearchSubmit}
            isAnalyzing={isAnalyzing}
            isListening={isListening}
            onToggleVoice={toggleVoiceInput}
            activeMode={activeMode}
            language={language}
          />

          {/* Quick Choice Pills */}
          <QuickChoicePills
            activeMode={activeMode}
            onSelectPill={(pill) => handleQuickPillSelect(pill, language)}
          />
        </div>

        {/* Loading Indicator */}
        {isAnalyzing && (
          <div className="text-center py-10 space-y-3" role="status" aria-live="polite">
            <div className="w-10 h-10 border-3 border-emerald-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
              Contemplating your situation and retrieving verified Quranic sources...
            </p>
          </div>
        )}

        {/* Semantic Context Banner (When Matched) */}
        {!isAnalyzing && analysisResult?.status === 'matched' && (
          <GuidanceContextBanner
            analysisResult={analysisResult}
            passageCount={selectedPassages.length}
          />
        )}

        {/* Off-Topic / Unsupported Fallback Banner */}
        {!isAnalyzing && analysisResult?.status === 'off-topic' && (
          <OffTopicBanner
            message={analysisResult.offTopicMessage}
            onSelectSuggestion={(query) => {
              setSearchQuery(query);
              executeSearch(query, language);
            }}
          />
        )}

        {/* Verse Presentation Cards */}
        {!isAnalyzing && displayedPassages.length > 0 && (
          <section id="passages-section" aria-label="Quranic Passages" className="space-y-6 scroll-mt-20">
            {/* Session Depth & Exegesis Control Bar */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-emerald-950/30 border border-slate-200 dark:border-emerald-800/40 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-emerald-900/40 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-950 dark:text-emerald-200">
                    {language === 'sv'
                      ? 'Konfigurera din session'
                      : language === 'fr'
                      ? 'Personnaliser votre session'
                      : 'Configure Your Contemplation Session'}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    ({displayedPassages.length}{' '}
                    {language === 'sv'
                      ? 'visade passager'
                      : language === 'fr'
                      ? 'passages affichés'
                      : 'passages shown'})
                  </span>
                </div>

                {/* Continuous Hands-Free Audio Launcher */}
                <button
                  type="button"
                  onClick={() => setIsContinuousAudioOpen(!isContinuousAudioOpen)}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                    isContinuousAudioOpen
                      ? 'bg-amber-500 text-emerald-950 hover:bg-amber-400'
                      : 'bg-emerald-900 text-white dark:bg-emerald-700 hover:bg-emerald-800'
                  }`}
                >
                  <Headphones className="w-4 h-4 animate-pulse" />
                  <span>
                    {isContinuousAudioOpen
                      ? language === 'sv'
                        ? 'Ljudspelare aktiv'
                        : language === 'fr'
                        ? 'Lecteur audio actif'
                        : 'Audio Player Active'
                      : language === 'sv'
                      ? 'Lyssna handsfree (Promenad/Bil)'
                      : language === 'fr'
                      ? 'Écoute mains libres (Marche/Voiture)'
                      : 'Listen Hands-Free (Walking/Car)'}
                  </span>
                </button>
              </div>

              {/* Duration Selector */}
              <SessionDepthSelector
                currentDepth={sessionDepth}
                onSelectDepth={setSessionDepth}
                language={language}
              />

              {/* Exegesis Depth Selector */}
              <ExplanationDepthSelector
                currentDepth={explanationDepth}
                onSelectDepth={setExplanationDepth}
                language={language}
              />
            </div>

            {/* Displayed Verses List */}
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
                  onOpenTafsir={(v) => setSelectedTafsirVerse(v)}
                  onOpenReflection={(v) => setSelectedReflectionVerse(v)}
                  onOpenHalaqah={(v) => setSelectedHalaqahVerse(v)}
                  onOpenVisualCard={(v) => setSelectedVisualCardVerse(v)}
                  explanationDepth={explanationDepth}
                  perspectiveMode={perspectiveMode}
                  sourceIndicator={
                    analysisResult?.source === 'cache'
                      ? 'Cached Reflection (0 LLM Calls)'
                      : analysisResult?.source === 'gemini_synthesis'
                      ? 'AI Sourced Synthesis'
                      : 'Direct Database Match (0 LLM Calls)'
                  }
                />
              </div>
            ))}
          </section>
        )}

        {/* Continuous Session Audio Player (Hands-Free Walking/Car/Resting Mode) */}
        {isContinuousAudioOpen && displayedPassages.length > 0 && (
          <ContinuousSessionAudioPlayer
            verses={displayedPassages}
            language={language}
            onActiveVerseChange={(verseId) => setActiveAudioVerseId(verseId)}
            onClose={() => {
              setIsContinuousAudioOpen(false);
              setActiveAudioVerseId(null);
            }}
          />
        )}

        {/* Ethical Scripture Footer */}
        <Footer />
      </main>

      {/* Classical Tafsir Drawer */}
      <TafsirDrawer
        verse={selectedTafsirVerse}
        isOpen={!!selectedTafsirVerse}
        onClose={() => setSelectedTafsirVerse(null)}
      />

      {/* "From Quran to Life" Reflection Drawer */}
      <ReflectionDrawer
        verse={selectedReflectionVerse}
        isOpen={!!selectedReflectionVerse}
        onClose={() => setSelectedReflectionVerse(null)}
        language={language}
      />

      {/* Bookmarks & Saved Reflections Modal */}
      <BookmarksModal
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        allVerses={QURAN_FIXTURES}
        language={language}
        onSelectVerse={(v) => {
          handleSelectSpecificVerse(v);
        }}
        onRemoveBookmark={handleToggleBookmark}
        onOpenReflection={(v) => setSelectedReflectionVerse(v)}
      />

      {/* Boundaries & Ethical Disclaimer Modal */}
      <DisclaimerModal
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
      />

      {/* "I don't know what I need" Guided Compass Modal */}
      <UnsureGuidanceModal
        isOpen={isUnsureModalOpen}
        onClose={() => setIsUnsureModalOpen(false)}
        language={language}
        onComplete={(query, mode) => {
          setActiveMode(mode);
          setSearchQuery(query);
          executeSearch(query, language, mode);
        }}
      />

      {/* Halaqah Circle Modal */}
      <HalaqahModal
        verse={selectedHalaqahVerse}
        isOpen={!!selectedHalaqahVerse}
        onClose={() => setSelectedHalaqahVerse(null)}
        language={language}
      />

      {/* Content License Registry & Theological Audit Modal */}
      <LicenseRegistryModal
        isOpen={isLicenseModalOpen}
        onClose={() => setIsLicenseModalOpen(false)}
        language={language}
      />

      {/* Shareable Visual Verse Card Generator Modal */}
      <VisualCardModal
        verse={selectedVisualCardVerse}
        isOpen={!!selectedVisualCardVerse}
        onClose={() => setSelectedVisualCardVerse(null)}
        language={language}
      />

      {/* My Journey (Personal Quran Contemplation Diary) Modal */}
      <MyJourneyModal
        isOpen={isJourneyModalOpen}
        onClose={() => {
          setIsJourneyModalOpen(false);
          setReflections(StorageService.getReflections());
        }}
        language={language}
        onSelectVerse={(v) => {
          handleSelectSpecificVerse(v);
        }}
      />

      {/* Editorial & Scholar Review Console Modal */}
      <EditorialConsoleModal
        isOpen={isEditorialConsoleOpen}
        onClose={() => setIsEditorialConsoleOpen(false)}
        language={language}
      />

      {/* Inquirer & Universal Wisdom Glossary Modal */}
      <InquirerGlossaryModal
        isOpen={isGlossaryModalOpen}
        onClose={() => setIsGlossaryModalOpen(false)}
        language={language}
      />

      {/* Hidden Print Container for PDF Export */}
      <PrintableReflection
        verse={selectedReflectionVerse || selectedPassages[0] || null}
        language={language}
        reflection={StorageService.getReflection(
          selectedReflectionVerse?.id || selectedPassages[0]?.id || ''
        )}
      />
    </div>
  );
}
