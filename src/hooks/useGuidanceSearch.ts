"use client";

/**
 * @file useGuidanceSearch.ts
 * @description Custom hook orchestrating Quranic guidance queries, session filtering,
 * passage selection, and automatic offline caching of searched/selected verses.
 */

import { useState, useCallback, useMemo } from 'react';
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

export function useGuidanceSearch(_initialLanguage: Language = 'en') {
  const [activeMode, setActiveMode] = useState<EntryMode>('moment');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSphere, setActiveSphere] = useState<LifeSphere>('all');
  const [sessionDepth, setSessionDepth] = useState<SessionDepth>('10min');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<QueryAnalysisResponse | null>(null);
  const [selectedPassages, setSelectedPassages] = useState<QuranVerseFixture[]>([]);

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
      const mode = modeOverride || activeMode;
      setIsAnalyzing(true);
      StorageService.addRecentSearch(queryText);

      try {
        const { analysisResult: result, passages } = await GuidanceService.searchGuidance(
          queryText,
          language,
          mode
        );
        setAnalysisResult(result);
        setSelectedPassages(passages);
        if (passages.length > 0) {
          OfflineCacheService.cachePassages(passages);
        }
      } catch (err) {
        console.error('[useGuidanceSearch] Search error:', err);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [activeMode]
  );

  const handleQuickPillSelect = useCallback(
    (pill: QuickPill, language: Language) => {
      setSearchQuery(pill.query);
      setActiveMode(pill.category);
      executeSearch(pill.query, language, pill.category);
    },
    [executeSearch]
  );

  const handleSelectSpecificVerse = useCallback((verse: QuranVerseFixture) => {
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
