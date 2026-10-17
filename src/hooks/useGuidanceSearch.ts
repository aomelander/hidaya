"use client";

/**
 * @file useGuidanceSearch.ts
 * @description Custom hook orchestrating Quranic guidance queries, session filtering,
 * passage selection, and automatic offline caching of searched/selected verses.
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  Language,
  EntryMode,
  LifeSphere,
  SessionDepth,
  QuranVerseFixture,
  QueryAnalysisResponse,
  QuickPill,
} from '../types';
import { QURAN_FIXTURES } from '../data/quranFixtures';
import { GuidanceService } from '../services/guidanceService';
import { StorageService } from '../services/storage';
import { OfflineCacheService } from '../services/offlineCacheService';
import { getDictionary } from '../lib/i18n/dictionaries';

export function useGuidanceSearch(activeLanguage: Language = 'en') {
  const [activeMode, setActiveMode] = useState<EntryMode>('moment');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSphere, setActiveSphere] = useState<LifeSphere>('all');
  const [sessionDepth, setSessionDepth] = useState<SessionDepth>('10min');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<QueryAnalysisResponse | null>(null);
  const [selectedPassages, setSelectedPassages] = useState<QuranVerseFixture[]>([]);
  const requestIdRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const prevLanguageRef = useRef<Language>(activeLanguage);
  const lastExecutedQueryRef = useRef<string>('');

  // Filter passages according to active life sphere and session depth
  const displayedPassages = useMemo(() => {
    let baseList = selectedPassages;
    if (activeSphere !== 'all') {
      const filtered = selectedPassages.filter((p) => p.lifeSphere === activeSphere);
      if (filtered.length > 0) {
        baseList = filtered;
      } else {
        const sphereFixtures = QURAN_FIXTURES.filter((p) => p.lifeSphere === activeSphere);
        baseList = sphereFixtures.length > 0 ? sphereFixtures : selectedPassages;
      }
    }

    // When in continuous Quran reading mode (all passages belong to the same Surah or sequential reading),
    // never truncate to 5 cards: allow continuous reading of the whole Surah, 15, or 100 verses according to user preferences!
    const isConsecutiveSurahSequence =
      baseList.length > 1 &&
      baseList.every((p) => p.surahNumber === baseList[0].surahNumber);

    if (isConsecutiveSurahSequence) {
      return baseList;
    }

    // Only apply session depth slice if we are in general guidance situation search
    if (baseList.length > 5) {
      switch (sessionDepth) {
        case '2min':
          return baseList.slice(0, 1);
        case '10min':
          return baseList.slice(0, 5);
        case '30min':
          return baseList.slice(0, 15);
        case '60min':
        default:
          return baseList;
      }
    }

    return baseList;
  }, [selectedPassages, activeSphere, sessionDepth]);

  // Execute guidance query and automatically cache returned passages for offline reading
  const executeSearch = useCallback(
    async (queryText: string, language: Language, modeOverride?: EntryMode) => {
      if (!queryText.trim()) return;
      const currentRequestId = ++requestIdRef.current;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;
      lastExecutedQueryRef.current = queryText;

      const mode = modeOverride || activeMode;
      setIsAnalyzing(true);
      StorageService.addRecentSearch(queryText);

      try {
        const { analysisResult: result, passages } = await GuidanceService.searchGuidance(
          queryText,
          language,
          mode,
          controller.signal
        );

        // Ignore late responses from superseded requests or previous language selection
        if (currentRequestId !== requestIdRef.current || controller.signal.aborted) {
          return;
        }

        setAnalysisResult(result);
        setSelectedPassages(passages);
        if (passages.length > 0) {
          OfflineCacheService.cachePassages(passages);
        }
      } catch (err) {
        if (currentRequestId !== requestIdRef.current || controller.signal.aborted) {
          return;
        }
        console.error('[useGuidanceSearch] Search error:', err);
      } finally {
        if (currentRequestId === requestIdRef.current && !controller.signal.aborted) {
          setIsAnalyzing(false);
        }
      }
    },
    [activeMode]
  );

  // On language change: cancel in-flight search, clear stale language-specific analysis/passages, and re-fetch in new language
  useEffect(() => {
    if (prevLanguageRef.current === activeLanguage) return;
    prevLanguageRef.current = activeLanguage;

    requestIdRef.current += 1;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Clear stale analysis result from previous language immediately
    setAnalysisResult(null);

    const activeQuery = (searchQuery || lastExecutedQueryRef.current).trim();
    if (activeQuery && selectedPassages.length > 0) {
      void executeSearch(activeQuery, activeLanguage, activeMode);
    } else {
      setIsAnalyzing(false);
    }
  }, [activeLanguage, searchQuery, selectedPassages.length, activeMode, executeSearch]);

  const handleSelectSpecificVerse = useCallback((verse: QuranVerseFixture) => {
    requestIdRef.current += 1;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsAnalyzing(false);
    setSelectedPassages([verse]);
    OfflineCacheService.cachePassages([verse]);
    setAnalysisResult({
      status: 'matched',
      detectedSituation: verse.whyThisVerse.situation,
      detectedEmotion: verse.whyThisVerse.emotion,
      underlyingNeed: verse.whyThisVerse.coreNeed,
      matchedPassageIds: [verse.id],
      relevanceExplanation: verse.whyThisVerse.mappingExplanation,
    });
  }, []);

  const PILL_TO_VERSE_MAP: Record<string, string> = useMemo(
    () => ({
      'anger-work': '3:134',
      'burnout-anxiety': '94:5-6',
      'grief-loss': '2:155-156',
      'restless-heart': '13:28',
      'lonely-abandoned': '93:3-5',
      'career-decisions': '65:2-3',
      'exams-future': '65:2-3',
      'guilt-regret': '21:87-88',
      'gratitude-joy': '14:7',
      'purpose-existence': '67:2',
      'suffering-tragedy': '57:22-23',
      'justice-oppression': '45:22',
      'responding-to-hostility': '41:34',
      'humility-daily-life': '25:63',
      'purifying-speech': '49:12',
      'patience-provocation': '31:17-18',
      'generosity-money': '2:286',
      'family-parents': '17:23-24',
    }),
    []
  );

  const handleQuickPillSelect = useCallback(
    (pill: QuickPill, language: Language) => {
      const dict = getDictionary(language);
      const localizedQuery =
        language === 'ar' && pill.labelArabic
          ? pill.labelArabic
          : dict.quickPills?.[pill.id] || pill.label || pill.query;

      setSearchQuery(localizedQuery);
      setActiveMode(pill.category);

      const targetVerseId = PILL_TO_VERSE_MAP[pill.id];
      const directFixture = targetVerseId
        ? QURAN_FIXTURES.find((f) => f.id === targetVerseId)
        : null;

      if (directFixture) {
        handleSelectSpecificVerse(directFixture);
      } else {
        executeSearch(pill.query, language, pill.category);
      }
    },
    [PILL_TO_VERSE_MAP, executeSearch, handleSelectSpecificVerse]
  );

  return {
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
  };
}
