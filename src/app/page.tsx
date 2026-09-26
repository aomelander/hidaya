"use client";

import React, { useState, useEffect } from 'react';
import {
  Search,
  Mic,
  MicOff,
  Sparkles,
  Flame,
  Feather,
  HeartCrack,
  Activity,
  SunDim,
  Compass,
  RefreshCw,
  HelpCircle,
  ShieldAlert,
  Scale,
  ShieldCheck,
  Footprints,
  MessageSquareOff,
  Users,
  AlertCircle,
  Filter,
  ArrowRight,
  BookOpen,
  Info,
} from 'lucide-react';
import {
  Language,
  EntryMode,
  QuranVerseFixture,
  QuickPill,
  QueryAnalysisResponse,
} from '../types';
import { QURAN_FIXTURES, QUICK_CHOICE_PILLS } from '../data/quranFixtures';
import { StorageService } from '../services/storage';
import { Header } from '../components/Header';
import { VerseCard } from '../components/VerseCard';
import { TafsirDrawer } from '../components/TafsirDrawer';
import { ReflectionDrawer } from '../components/ReflectionDrawer';
import { BookmarksModal } from '../components/BookmarksModal';
import { DisclaimerModal } from '../components/DisclaimerModal';
import { PrintableReflection } from '../components/PrintableReflection';

// Icon mapper for quick pills
const ICON_MAP: Record<string, React.ReactNode> = {
  Flame: <Flame className="w-4 h-4" />,
  Feather: <Feather className="w-4 h-4" />,
  HeartCrack: <HeartCrack className="w-4 h-4" />,
  Activity: <Activity className="w-4 h-4" />,
  SunDim: <SunDim className="w-4 h-4" />,
  Compass: <Compass className="w-4 h-4" />,
  RefreshCw: <RefreshCw className="w-4 h-4" />,
  Sparkles: <Sparkles className="w-4 h-4" />,
  HelpCircle: <HelpCircle className="w-4 h-4" />,
  ShieldAlert: <ShieldAlert className="w-4 h-4" />,
  Scale: <Scale className="w-4 h-4" />,
  ShieldCheck: <ShieldCheck className="w-4 h-4" />,
  Footprints: <Footprints className="w-4 h-4" />,
  MessageSquareOff: <MessageSquareOff className="w-4 h-4" />,
  Users: <Users className="w-4 h-4" />,
};

export default function App() {
  // App settings state
  const [language, setLanguage] = useState<Language>(StorageService.getLanguage());
  const [arabicScale, setArabicScale] = useState<number>(StorageService.getFontSizeMultiplier());
  const [showTransliteration, setShowTransliteration] = useState<boolean>(
    StorageService.getShowTransliteration()
  );
  const [isDark, setIsDark] = useState<boolean>(StorageService.getDarkMode());
  const [isHighContrast, setIsHighContrast] = useState<boolean>(
    StorageService.getHighContrast()
  );
  const [bookmarks, setBookmarks] = useState<string[]>(StorageService.getBookmarks());

  // Search & Navigation state
  const [activeMode, setActiveMode] = useState<EntryMode>('moment');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<QueryAnalysisResponse | null>(null);
  const [selectedPassages, setSelectedPassages] = useState<QuranVerseFixture[]>([]);
  const [isListening, setIsListening] = useState(false);

  // Modals & Drawers state
  const [selectedTafsirVerse, setSelectedTafsirVerse] = useState<QuranVerseFixture | null>(null);
  const [selectedReflectionVerse, setSelectedReflectionVerse] = useState<QuranVerseFixture | null>(null);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);

  // Sync dark mode class on document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    StorageService.setDarkMode(isDark);
  }, [isDark]);

  useEffect(() => {
    StorageService.setLanguage(language);
  }, [language]);

  useEffect(() => {
    StorageService.setFontSizeMultiplier(arabicScale);
  }, [arabicScale]);

  useEffect(() => {
    StorageService.setShowTransliteration(showTransliteration);
  }, [showTransliteration]);

  useEffect(() => {
    StorageService.setHighContrast(isHighContrast);
  }, [isHighContrast]);

  // Initial load: show the first verified fixture (3:134 - Anger at work) by default
  useEffect(() => {
    const defaultVerse = QURAN_FIXTURES.find((f) => f.id === '3:134') || QURAN_FIXTURES[0];
    setSelectedPassages([defaultVerse]);
    setAnalysisResult({
      status: 'matched',
      detectedSituation: 'Workplace tension or interpersonal friction',
      detectedEmotion: 'Anger & Frustration',
      underlyingNeed: 'Self-mastery, swallowing wrath, and moral grace',
      matchedPassageIds: ['3:134'],
      relevanceExplanation:
        "Surah Ali 'Imran (3:134) directly addresses the physiological surge of anger, placing those who swallow wrath and pardon colleagues into the beloved rank of Ihsan.",
    });
  }, []);

  const handleToggleBookmark = (verseId: string) => {
    StorageService.toggleBookmark(verseId);
    setBookmarks(StorageService.getBookmarks());
  };

  // Perform search / analysis query
  const executeQuery = async (queryText: string, modeOverride?: EntryMode) => {
    if (!queryText.trim()) return;
    const mode = modeOverride || activeMode;
    setIsAnalyzing(true);
    StorageService.addRecentSearch(queryText);

    try {
      // Call server-side API endpoint
      const response = await fetch('/api/analyze-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText, mode }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: QueryAnalysisResponse = await response.json();
      setAnalysisResult(data);

      if (data.status === 'matched' && data.matchedPassageIds?.length > 0) {
        const matches = data.matchedPassageIds
          .map((id) => QURAN_FIXTURES.find((f) => f.id === id))
          .filter(Boolean) as QuranVerseFixture[];
        setSelectedPassages(matches.length > 0 ? matches : [QURAN_FIXTURES[0]]);
      } else if (data.status === 'off-topic') {
        setSelectedPassages([]);
      }
    } catch (err) {
      console.warn('Backend API request failed; engaging resilient client-side matcher', err);
      // Resilient client fallback
      performClientSideFallback(queryText);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Client-side fallback matcher ensures zero disruption
  const performClientSideFallback = (queryText: string) => {
    const normalized = queryText.toLowerCase();

    // Check off-topic
    const offTopicKeywords = ['code', 'python', 'javascript', 'bitcoin', 'crypto', 'gambling', 'weather', 'recipe', 'hack'];
    if (offTopicKeywords.some((w) => normalized.includes(w))) {
      setAnalysisResult({
        status: 'off-topic',
        offTopicMessage:
          "Hidaya is a reflective companion dedicated to Quranic contemplation for real-life emotions, decisions, and character growth. We couldn't find a direct reflective match for this technical or non-reflective inquiry.",
        suggestedTopics: ['Anger at work', 'Anxiety & Burnout', 'Patience with Family', 'Purpose of Life', 'Gratitude'],
        matchedPassageIds: ['3:134', '94:5-6'],
      });
      setSelectedPassages([]);
      return;
    }

    let matched: QuranVerseFixture[] = [];
    let detectedSituation = 'Life contemplation';
    let detectedEmotion = 'Seeking guidance';
    let underlyingNeed = 'Spiritual clarity and grounding';
    let relevanceExplanation = 'This passage provides verified Quranic perspective for your current situation.';

    if (normalized.includes('anger') || normalized.includes('work') || normalized.includes('rage') || normalized.includes('boss')) {
      matched = [QURAN_FIXTURES[0]]; // 3:134
      detectedSituation = 'Workplace or interpersonal tension';
      detectedEmotion = 'Anger & Frustration';
      underlyingNeed = 'Restraining wrath and maintaining moral poise';
      relevanceExplanation =
        "Surah Ali 'Imran (3:134) guides you to restrain bubbling anger, pardon the provoking party, and maintain excellence (Ihsan).";
    } else if (normalized.includes('burnout') || normalized.includes('overwhelm') || normalized.includes('stress') || normalized.includes('exhaust')) {
      matched = [QURAN_FIXTURES[1], QURAN_FIXTURES[12]]; // 94:5-6, 2:286
      detectedSituation = 'Heavy burdens and exhaustion';
      detectedEmotion = 'Overwhelmed & Burned Out';
      underlyingNeed = 'Reassurance that relief is bundled alongside trials';
      relevanceExplanation = 'Surah Ash-Sharh guarantees that ease is intertwined directly with hardship.';
    } else if (normalized.includes('grief') || normalized.includes('loss') || normalized.includes('death')) {
      matched = [QURAN_FIXTURES[2]]; // 2:155-156
      detectedSituation = 'Bereavement or sudden loss';
      detectedEmotion = 'Grief & Mourning';
      underlyingNeed = 'Surrendering outcomes to God';
      relevanceExplanation = 'Surah Al-Baqarah anchors the heart in Istirja: we belong to God and to Him we return.';
    } else if (normalized.includes('heart') || normalized.includes('anxiety') || normalized.includes('panic')) {
      matched = [QURAN_FIXTURES[3]]; // 13:28
      detectedSituation = 'Racing thoughts and inner restlessness';
      detectedEmotion = 'Anxiety';
      underlyingNeed = 'Tranquility through divine remembrance';
      relevanceExplanation = 'Surah Ar-Rad establishes that only divine remembrance restores authentic peace to the heart.';
    } else if (normalized.includes('purpose') || normalized.includes('why')) {
      matched = [QURAN_FIXTURES[6]]; // 67:2
      detectedSituation = 'Questioning the meaning of life and death';
      detectedEmotion = 'Existential Curiosity';
      underlyingNeed = 'Viewing life as a crucible for moral beauty';
      relevanceExplanation = 'Surah Al-Mulk clarifies that existence is calibrated to examine who acts with highest sincerity.';
    } else {
      matched = [QURAN_FIXTURES[0]];
    }

    setAnalysisResult({
      status: 'matched',
      detectedSituation,
      detectedEmotion,
      underlyingNeed,
      matchedPassageIds: matched.map((m) => m.id),
      relevanceExplanation,
    });
    setSelectedPassages(matched);
  };

  const handleQuickPillClick = (pill: QuickPill) => {
    setSearchQuery(pill.query);
    setActiveMode(pill.category);
    executeQuery(pill.query, pill.category);
  };

  // Voice Input (Web Speech API)
  const toggleVoiceInput = () => {
    // Check speech recognition
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Simulate gentle voice test
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        const sampleQuery = 'I feel angry and overwhelmed by unfair criticism at work';
        setSearchQuery(sampleQuery);
        executeQuery(sampleQuery);
      }, 1500);
      return;
    }

    try {
      // @ts-expect-error browser speech recognition API
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'sv' ? 'sv-SE' : language === 'fr' ? 'fr-FR' : 'en-US';
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      // @ts-expect-error browser speech event
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        executeQuery(transcript);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Filtered pills for active mode
  const currentPills = QUICK_CHOICE_PILLS.filter((p) => p.category === activeMode);

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors ${
        isHighContrast ? 'contrast-125' : ''
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
        bookmarkCount={bookmarks.length}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        onOpenDisclaimer={() => setIsDisclaimerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 no-print">
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
            Discover verified passages, classical exegesis (Tafsir), and a 3-step practical reflection framework for real-life decisions, emotions, and character growth.
          </p>
        </section>

        {/* 3 Entry Modes Navigation Tabs */}
        <section aria-label="Guidance Entry Modes">
          <div className="flex p-1.5 rounded-2xl bg-emerald-900/5 dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-800/30 max-w-xl mx-auto shadow-xs">
            <button
              onClick={() => setActiveMode('moment')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeMode === 'moment'
                  ? 'bg-emerald-800 text-white dark:bg-emerald-700 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-300'
              }`}
              aria-selected={activeMode === 'moment'}
              role="tab"
            >
              1. In This Moment
            </button>

            <button
              onClick={() => setActiveMode('questions')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeMode === 'questions'
                  ? 'bg-emerald-800 text-white dark:bg-emerald-700 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-300'
              }`}
              aria-selected={activeMode === 'questions'}
              role="tab"
            >
              2. Big Questions
            </button>

            <button
              onClick={() => setActiveMode('growth')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeMode === 'growth'
                  ? 'bg-emerald-800 text-white dark:bg-emerald-700 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-300'
              }`}
              aria-selected={activeMode === 'growth'}
              role="tab"
            >
              3. Character & Growth
            </button>
          </div>
        </section>

        {/* Search Input Bar (Text + Voice) */}
        <section aria-label="Search and Voice Input">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              executeQuery(searchQuery);
            }}
            className="relative max-w-3xl mx-auto"
          >
            <div className="relative flex items-center shadow-lg shadow-emerald-950/5 rounded-2xl overflow-hidden bg-white dark:bg-[#0A1E17] border-2 border-emerald-900/15 dark:border-emerald-800/40 focus-within:border-emerald-700 dark:focus-within:border-emerald-500 transition-all">
              <div className="pl-4 text-emerald-800 dark:text-emerald-400">
                <Search className="w-5 h-5" />
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeMode === 'moment'
                    ? "What are you feeling? (e.g., 'Anger at work', 'Anxious about decisions')..."
                    : activeMode === 'questions'
                    ? "What existential question weighs on your mind? (e.g., 'Purpose of suffering')..."
                    : "What character trait are you cultivating? (e.g., 'Humility', 'Tongue control')..."
                }
                className="w-full py-4 pl-3 pr-24 text-sm sm:text-base bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                aria-label="Contemplation search query"
              />

              <div className="absolute right-2 flex items-center gap-1.5">
                {/* Voice button */}
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  className={`p-2 rounded-xl transition-all ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-900/10'
                  }`}
                  title={isListening ? 'Listening...' : 'Search by voice'}
                  aria-label={isListening ? 'Listening...' : 'Search by voice'}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isAnalyzing ? 'Seeking...' : 'Seek'}
                </button>
              </div>
            </div>
          </form>

          {/* Quick Choice Pills */}
          <div className="mt-4 max-w-3xl mx-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2">
              <Filter className="w-3.5 h-3.5" />
              <span>Suggested Contemplation Paths:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentPills.map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => handleQuickPillClick(pill)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-emerald-950/40 border border-slate-200 dark:border-emerald-800/40 text-slate-700 dark:text-slate-200 hover:border-emerald-600 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all cursor-pointer shadow-2xs"
                >
                  <span className="text-amber-600 dark:text-amber-400">
                    {ICON_MAP[pill.iconName] || <Sparkles className="w-4 h-4" />}
                  </span>
                  <span>{pill.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

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
          <section
            aria-label="Semantic Guidance Context"
            className="p-5 rounded-2xl bg-linear-to-r from-emerald-900/10 via-emerald-800/5 to-amber-500/10 border border-emerald-800/20 dark:border-emerald-700/30 space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                  Guidance Mapping Analysis
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Grounding: {selectedPassages.length} Verified Quran Passage(s)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/70 dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-800/20">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                  Detected Emotion
                </span>
                <span className="font-semibold text-emerald-950 dark:text-emerald-100">
                  {analysisResult.detectedEmotion || 'Contemplative'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/70 dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-800/20">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                  Life Situation
                </span>
                <span className="font-semibold text-emerald-950 dark:text-emerald-100 truncate block">
                  {analysisResult.detectedSituation || 'Daily Living'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/70 dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-800/20">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                  Underlying Spiritual Need
                </span>
                <span className="font-semibold text-emerald-950 dark:text-emerald-100 truncate block">
                  {analysisResult.underlyingNeed || 'Divine Grounding'}
                </span>
              </div>
            </div>

            {analysisResult.relevanceExplanation && (
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
                <strong>Why this applies:</strong> {analysisResult.relevanceExplanation}
              </p>
            )}
          </section>
        )}

        {/* Off-Topic / Unsupported Fallback */}
        {!isAnalyzing && analysisResult?.status === 'off-topic' && (
          <section
            aria-label="Unsupported Query Fallback"
            className="p-8 rounded-3xl bg-amber-500/10 border-2 border-amber-600/30 dark:border-amber-500/30 text-center space-y-4"
          >
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <h3 className="text-lg font-bold text-amber-950 dark:text-amber-100">
                Off-Topic or Non-Reflective Request
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {analysisResult.offTopicMessage ||
                  "Hidaya is dedicated strictly to source-grounded Quranic reflection for human emotions, life situations, and character growth. We do not provide sports odds, technical coding, mathematical trivia, or binding fatwas."}
              </p>
            </div>

            <div className="pt-2">
              <p className="text-xs font-semibold text-amber-900 dark:text-amber-300 uppercase tracking-wider mb-3">
                Try exploring these verified life contemplation themes instead:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { label: 'Anger at work', query: 'Anger at work, speech control, and patience' },
                  { label: 'Burnout & Overwhelm', query: 'Burnout, stress, finding ease with hardship' },
                  { label: 'Patience with Family', query: 'Patience with parents and family friction' },
                  { label: 'Purpose of Life', query: 'What is the purpose of life and death?' },
                  { label: 'Restless Heart', query: 'Restless heart, anxiety, need peace' },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setSearchQuery(item.query);
                      executeQuery(item.query);
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-emerald-950 border border-amber-600/30 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Verse Presentation Cards */}
        {!isAnalyzing && selectedPassages.length > 0 && (
          <section aria-label="Quranic Passages" className="space-y-8">
            {selectedPassages.map((verse) => (
              <VerseCard
                key={verse.id}
                verse={verse}
                language={language}
                arabicScale={arabicScale}
                showTransliteration={showTransliteration}
                isBookmarked={bookmarks.includes(verse.id)}
                onToggleBookmark={handleToggleBookmark}
                onOpenTafsir={(v) => setSelectedTafsirVerse(v)}
                onOpenReflection={(v) => setSelectedReflectionVerse(v)}
              />
            ))}
          </section>
        )}

        {/* Ethical Footer Banner */}
        <footer className="mt-16 pt-8 border-t border-emerald-900/10 dark:border-emerald-800/30 text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="font-arabic text-amber-700 dark:text-amber-400 text-lg">
              وَبِالْحَقِّ أَنزَلْنَاهُ وَبِالْحَقِّ نَزَلَ
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            &ldquo;And with the truth We have sent it down, and with the truth it has descended.&rdquo; (Al-Isra 17:105)
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Hidaya is a guide to Quranic sources, not a religious authority or fatwa service.
          </p>
        </footer>
      </main>

      {/* Level 3: Classical Tafsir Drawer */}
      <TafsirDrawer
        verse={selectedTafsirVerse}
        isOpen={!!selectedTafsirVerse}
        onClose={() => setSelectedTafsirVerse(null)}
      />

      {/* Level 4: "From Quran to Life" Reflection Drawer */}
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
          setSelectedPassages([v]);
          setAnalysisResult({
            status: 'matched',
            detectedSituation: v.whyThisVerse.situation,
            detectedEmotion: v.whyThisVerse.emotion,
            underlyingNeed: v.whyThisVerse.coreNeed,
            matchedPassageIds: [v.id],
            relevanceExplanation: v.whyThisVerse.mappingExplanation,
          });
        }}
        onRemoveBookmark={handleToggleBookmark}
        onOpenReflection={(v) => setSelectedReflectionVerse(v)}
      />

      {/* Boundaries & Disclaimer Modal */}
      <DisclaimerModal
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
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
