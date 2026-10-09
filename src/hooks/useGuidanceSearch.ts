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

    switch (sessionDepth) {
      case '2min':
        return baseList.slice(0, 1);
      case '10min':
        return baseList.slice(0, 5);
      case '30min':
        return baseList.slice(0, 5);
      case '60min':
      default:
        return baseList;
    }
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

  const handleQuickPillSelect = useCallback(
    (pill: QuickPill, language: Language) => {
      setSearchQuery(pill.query);
      setActiveMode(pill.category);
      executeSearch(pill.query, language, pill.category);
    },
    [executeSearch]
  );

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
