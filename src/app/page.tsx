"use client";

/**
 * @file page.tsx
 * @description Main application page for Hidaya: Quran Guidance & Reflection.
 * Refined for mobile ergonomics, decluttered viewport, and serene spiritual focus.
 * Puts the Daily North Star front-and-center and moves secondary customization
 * into an ergonomic collapsible bottom sheet.
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Headphones,
  SlidersHorizontal,
  Compass,
  Search,
  Bookmark,
  BookOpen,
} from 'lucide-react';
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
import { GuidanceSearchBar } from '../components/GuidanceSearchBar';
import { QuickChoicePills } from '../components/QuickChoicePills';
import { GuidanceContextBanner } from '../components/GuidanceContextBanner';
import { OffTopicBanner } from '../components/OffTopicBanner';
import { ContinuousSessionAudioPlayer } from '../components/ContinuousSessionAudioPlayer';
import { VerseCard } from '../components/VerseCard';
import { CustomizationSheet } from '../components/CustomizationSheet';
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
  const [reflections, setReflections] = useState<Record<string, UserReflection>>({});

  // Contemplation & Exegesis Depth Configuration
  const [explanationDepth, setExplanationDepth] = useState<ExplanationDepth>('context');
  const [perspectiveMode, setPerspectiveMode] = useState<PerspectiveMode>('devotional');

  // Audio Playback State
  const [isContinuousAudioOpen, setIsContinuousAudioOpen] = useState(false);
  const [activeAudioVerseId, setActiveAudioVerseId] = useState<string | null>(null);

  // Modals & Drawers Visibility State
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
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

  // Sync document language and text direction (RTL for Arabic)
  useEffect(() => {
    document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', language);
  }, [language]);

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

  const scrollToSearch = () => {
    const el = document.getElementById('guidance-portal');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      lang={language}
      className={`min-h-screen flex flex-col transition-colors ${
        mounted && isHighContrast ? 'contrast-125' : ''
      } ${
        language === 'ar' ? 'font-arabic' : ''
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
        onOpenCustomization={() => setIsCustomizationOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 pb-24 md:pb-12 no-print">
        {/* Inquirer Perspective Banner (if active) */}
        {perspectiveMode === 'inquirer' && (
          <InquirerPerspectiveBanner
            language={language}
            onOpenGlossary={() => setIsGlossaryModalOpen(true)}
            onSwitchPerspective={() => setPerspectiveMode('devotional')}
          />
        )}

        {/* 1. Daily North Star (Dagens Ledstjärna) - Direct on Launch */}
        <section aria-label="Daily Contemplation Anchor" className="pt-1">
          <DailyNorthStar
            language={language}
            arabicScale={arabicScale}
            showTransliteration={showTransliteration}
            onSelectVerse={handleSelectNorthStarVerse}
            onOpenReflection={(v) => setSelectedReflectionVerse(v)}
          />
        </section>

        {/* 2. Guidance Discovery Portal ("What brings you here today?") */}
        <section
          id="guidance-portal"
          aria-label="Guidance Portal"
          className="space-y-4 p-5 sm:p-7 rounded-3xl bg-white dark:bg-emerald-950/30 border border-slate-200/80 dark:border-emerald-800/40 shadow-xs"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-emerald-900/30 pb-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-950 dark:text-emerald-50">
                {language === 'ar'
                  ? 'ما الذي يشغل قلبك اليوم؟'
                  : language === 'sv'
                  ? 'Vad söker du i Quranen just nu?'
                  : language === 'fr'
                  ? 'Que cherchez-vous dans le Coran en cet instant ?'
                  : 'What brings you to the Quran today?'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'ar'
                  ? 'اكتب، تحدث، أو اختر من الحالات الوجدانية'
                  : language === 'sv'
                  ? 'Skriv din situation, tala eller välj en känsla'
                  : language === 'fr'
                  ? 'Écrivez, parlez ou choisissez un sentiment'
                  : 'Write your situation, speak, or select what you feel'}
              </p>
            </div>

            {/* Quick Button to Open Depth & Settings Sheet */}
            <button
              type="button"
              onClick={() => setIsCustomizationOpen(true)}
              className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-900/5 dark:bg-emerald-800/20 text-emerald-900 dark:text-emerald-200 border border-emerald-900/15 dark:border-emerald-700/30 hover:bg-emerald-900/10 transition-colors cursor-pointer active:scale-98"
              aria-label="Open contemplation depth and settings"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>
                {language === 'sv'
                  ? 'Inställningar & djup'
                  : language === 'fr'
                  ? 'Préférences & profondeur'
                  : language === 'ar'
                  ? 'الإعدادات والعمق'
                  : 'Preferences & Depth'}
              </span>
            </button>
          </div>

          {/* 3 Entry Modes Navigation Tabs */}
          <EntryModeTabs
            activeMode={activeMode}
            onSelectMode={setActiveMode}
            onOpenUnsureModal={() => setIsUnsureModalOpen(true)}
            language={language}
          />

          {/* Search Input Bar (Text + Voice) */}
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

          {/* Quick Choice Pills with Progressive Disclosure */}
          <QuickChoicePills
            activeMode={activeMode}
            onSelectPill={(pill) => handleQuickPillSelect(pill, language)}
          />

          {/* Quiet Active Configuration Pill */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-emerald-900/20">
            <div className="flex items-center gap-2">
              <span className="capitalize">{explanationDepth} depth</span>
              <span>·</span>
              <span>{sessionDepth} session</span>
              <span>·</span>
              <span className="capitalize">
                {activeSphere === 'all' ? 'All Life Spheres' : `${activeSphere} sphere`}
              </span>
            </div>
            <button
              onClick={() => setIsCustomizationOpen(true)}
              className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
            >
              {language === 'sv' ? 'Ändra inställningar' : 'Customize settings'}
            </button>
          </div>
        </section>

        {/* Loading Indicator */}
        {isAnalyzing && (
          <div className="text-center py-10 space-y-3" role="status" aria-live="polite">
            <div className="w-10 h-10 border-3 border-emerald-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
              {language === 'sv'
                ? 'Söker i verifierade Quran-källor...'
                : 'Contemplating your situation and retrieving verified Quranic sources...'}
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

        {/* 3. Verse Presentation Cards & Streamlined Results */}
        {!isAnalyzing && displayedPassages.length > 0 && (
          <section id="passages-section" aria-label="Quranic Passages" className="space-y-6 scroll-mt-20">
            {/* Streamlined Passages Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-emerald-950/30 border border-slate-200/80 dark:border-emerald-800/40 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <span className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-100">
                  {displayedPassages.length}{' '}
                  {language === 'ar'
                    ? 'مقاطع قرآنية موثقة'
                    : language === 'sv'
                    ? 'verifierade passager'
                    : language === 'fr'
                    ? 'passages vérifiés'
                    : 'verified passages'}
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">·</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline capitalize">
                  {explanationDepth} depth · {sessionDepth}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomizationOpen(true)}
                  className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-900/5 dark:bg-emerald-800/20 text-emerald-900 dark:text-emerald-200 border border-emerald-900/10 dark:border-emerald-700/30 hover:bg-emerald-900/10 transition-colors cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>{language === 'sv' ? 'Ändra djup' : 'Adjust Depth'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsContinuousAudioOpen(!isContinuousAudioOpen)}
                  className={`min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                    isContinuousAudioOpen
                      ? 'bg-amber-500 text-emerald-950'
                      : 'bg-emerald-800 hover:bg-emerald-700 dark:bg-emerald-700 text-white'
                  }`}
                >
                  <Headphones className="w-3.5 h-3.5" />
                  <span>
                    {isContinuousAudioOpen
                      ? language === 'sv' ? 'Ljud aktivt' : 'Audio Active'
                      : language === 'sv' ? 'Lyssna' : 'Listen'}
                  </span>
                </button>
              </div>
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
                />
              </div>
            ))}
          </section>
        )}
      </main>

      {/* 4. Hands-Free Continuous Session Audio Player */}
      {isContinuousAudioOpen && (
        <ContinuousSessionAudioPlayer
          verses={displayedPassages.length > 0 ? displayedPassages : selectedPassages}
          language={language}
          onActiveVerseChange={(verseId) => setActiveAudioVerseId(verseId)}
          onClose={() => setIsContinuousAudioOpen(false)}
        />
      )}

      {/* 5. Mobile Fixed Bottom Navigation Bar (Natural Thumb Zone) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 dark:bg-[#071712]/95 backdrop-blur-md border-t border-emerald-900/10 dark:border-emerald-800/30 h-15 px-3 flex items-center justify-around pb-safe"
      >
        <button
          onClick={scrollToTop}
          className="min-h-[44px] min-w-[44px] flex flex-col items-center justify-center text-slate-600 dark:text-slate-300 hover:text-emerald-700 transition-colors"
          title="Daily North Star"
        >
          <Compass className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">
            {language === 'sv' ? 'Ledstjärna' : 'North Star'}
          </span>
        </button>

        <button
          onClick={scrollToSearch}
          className="min-h-[44px] min-w-[44px] flex flex-col items-center justify-center text-slate-600 dark:text-slate-300 hover:text-emerald-700 transition-colors"
          title="Search Guidance"
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">
            {language === 'sv' ? 'Sök' : 'Guidance'}
          </span>
        </button>

        <button
          onClick={() => setIsContinuousAudioOpen(!isContinuousAudioOpen)}
          className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center transition-colors ${
            isContinuousAudioOpen
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700'
          }`}
          title="Audio Session"
        >
          <Headphones className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">
            {language === 'sv' ? 'Lyssna' : 'Audio'}
          </span>
        </button>

        <button
          onClick={() => setIsCustomizationOpen(true)}
          className="min-h-[44px] min-w-[44px] flex flex-col items-center justify-center text-slate-600 dark:text-slate-300 hover:text-emerald-700 transition-colors"
          title="Preferences & Depth"
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">
            {language === 'sv' ? 'Inställningar' : 'Depth'}
          </span>
        </button>

        <button
          onClick={() => setIsBookmarksOpen(true)}
          className="min-h-[44px] min-w-[44px] flex flex-col items-center justify-center text-slate-600 dark:text-slate-300 hover:text-emerald-700 transition-colors relative"
          title="Saved Reflections"
        >
          <Bookmark className="w-5 h-5" />
          {bookmarks.length > 0 && (
            <span className="absolute top-1.5 right-3 w-3.5 h-3.5 bg-amber-500 text-emerald-950 text-[9px] font-bold rounded-full flex items-center justify-center">
              {bookmarks.length}
            </span>
          )}
          <span className="text-[10px] font-medium tracking-tight mt-0.5">
            {language === 'sv' ? 'Sparat' : 'Saved'}
          </span>
        </button>
      </nav>

      {/* Global Footer */}
      <Footer language={language} />

      {/* Collapsible Preferences & Depth Bottom Sheet */}
      <CustomizationSheet
        isOpen={isCustomizationOpen}
        onClose={() => setIsCustomizationOpen(false)}
        language={language}
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

      {/* Tafsir Drawer (Multiple Scholarly Viewpoints) */}
      <TafsirDrawer
        verse={selectedTafsirVerse}
        isOpen={!!selectedTafsirVerse}
        onClose={() => setSelectedTafsirVerse(null)}
      />

      {/* Reflection Journal Drawer */}
      <ReflectionDrawer
        verse={selectedReflectionVerse}
        isOpen={!!selectedReflectionVerse}
        onClose={() => {
          setSelectedReflectionVerse(null);
          setReflections(StorageService.getReflections());
        }}
        language={language}
      />

      {/* Bookmarks & Saved Reflections Modal */}
      <BookmarksModal
        isOpen={isBookmarksOpen}
        onClose={() => {
          setIsBookmarksOpen(false);
          setBookmarks(StorageService.getBookmarks());
        }}
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
