/**
 * @file guidanceService.ts
 * @description Service layer for handling Quranic guidance queries, orchestrating backend API calls,
 * and providing resilient offline/client-side semantic matching.
 */

import { QueryAnalysisResponse, QuranVerseFixture, Language, EntryMode } from '../types';
import { QURAN_FIXTURES } from '../data/quranFixtures';
import { APP_CONFIG } from '../config/appConfig';

/**
 * Backend API raw response format from `/api/guidance`
 */
export interface GuidanceAPIResponse {
  status: 'matched' | 'off-topic' | 'clarification';
  source?: QueryAnalysisResponse['source'];
  matches?: Array<{ id?: string | number; ayah_id?: string | number }>;
  data?: {
    selectedAyahIds?: number[];
    reasoning?: string;
    reflectionPrompt?: string;
  };
  indicator?: string;
  error?: string;
}

/**
 * Checks if a user's query is non-reflective, purely technical, or off-topic.
 * @param query The user's query string
 * @returns boolean indicating if the query is off-topic
 */
export function isQueryOffTopic(query: string): boolean {
  const normalized = query.toLowerCase().trim();
  return APP_CONFIG.OFF_TOPIC_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

/**
 * Pure function providing resilient client-side matching when the server API is unavailable or offline.
 * Matches keywords to verified Quran fixtures without hallucinations.
 *
 * @param queryText The input text from the user
 * @returns Object containing the structured analysis result and matched passages
 */
export function performClientSideGuidanceMatch(queryText: string): {
  analysisResult: QueryAnalysisResponse;
  matchedPassages: QuranVerseFixture[];
} {
  const normalized = queryText.toLowerCase().trim();

  // 1. Off-topic check
  if (isQueryOffTopic(normalized)) {
    return {
      analysisResult: {
        status: 'off-topic',
        offTopicMessage:
          "Hidaya is a reflective companion dedicated to Quranic contemplation for real-life emotions, decisions, and character growth. We couldn't find a direct reflective match for this technical or non-reflective inquiry.",
        suggestedTopics: APP_CONFIG.CURATED_SUGGESTIONS.map((s) => s.label),
        matchedPassageIds: ['3:134', '94:5-6'],
      },
      matchedPassages: [],
    };
  }

  let matched: QuranVerseFixture[] = [];
  let detectedSituation = 'Life contemplation';
  let detectedEmotion = 'Seeking guidance';
  let underlyingNeed = 'Spiritual clarity and grounding';
  let relevanceExplanation = 'This passage provides verified Quranic perspective for your current situation.';

  if (
    normalized.includes('anger') ||
    normalized.includes('work') ||
    normalized.includes('rage') ||
    normalized.includes('boss') ||
    normalized.includes('colleague')
  ) {
    matched = [QURAN_FIXTURES[0]]; // 3:134
    detectedSituation = 'Workplace or interpersonal tension';
    detectedEmotion = 'Anger & Frustration';
    underlyingNeed = 'Restraining wrath and maintaining moral poise';
    relevanceExplanation =
      "Surah Ali 'Imran (3:134) guides you to restrain bubbling anger, pardon the provoking party, and maintain excellence (Ihsan).";
  } else if (
    normalized.includes('burnout') ||
    normalized.includes('overwhelm') ||
    normalized.includes('stress') ||
    normalized.includes('exhaust') ||
    normalized.includes('burden')
  ) {
    matched = [QURAN_FIXTURES[1], QURAN_FIXTURES[12]]; // 94:5-6, 2:286
    detectedSituation = 'Heavy burdens and exhaustion';
    detectedEmotion = 'Overwhelmed & Burned Out';
    underlyingNeed = 'Reassurance that relief is bundled alongside trials';
    relevanceExplanation = 'Surah Ash-Sharh guarantees that ease is intertwined directly with hardship.';
  } else if (
    normalized.includes('grief') ||
    normalized.includes('loss') ||
    normalized.includes('death') ||
    normalized.includes('mourn')
  ) {
    matched = [QURAN_FIXTURES[2]]; // 2:155-156
    detectedSituation = 'Bereavement or sudden loss';
    detectedEmotion = 'Grief & Mourning';
    underlyingNeed = 'Surrendering outcomes to God';
    relevanceExplanation = 'Surah Al-Baqarah anchors the heart in Istirja: we belong to God and to Him we return.';
  } else if (
    normalized.includes('heart') ||
    normalized.includes('anxiety') ||
    normalized.includes('panic') ||
    normalized.includes('fear')
  ) {
    matched = [QURAN_FIXTURES[3]]; // 13:28
    detectedSituation = 'Racing thoughts and inner restlessness';
    detectedEmotion = 'Anxiety';
    underlyingNeed = 'Tranquility through divine remembrance';
    relevanceExplanation = 'Surah Ar-Rad establishes that only divine remembrance restores authentic peace to the heart.';
  } else if (
    normalized.includes('purpose') ||
    normalized.includes('why') ||
    normalized.includes('meaning')
  ) {
    matched = [QURAN_FIXTURES[6]]; // 67:2
    detectedSituation = 'Questioning the meaning of life and death';
    detectedEmotion = 'Existential Curiosity';
    underlyingNeed = 'Viewing life as a crucible for moral beauty';
    relevanceExplanation = 'Surah Al-Mulk clarifies that existence is calibrated to examine who acts with highest sincerity.';
  } else if (
    normalized.includes('parent') ||
    normalized.includes('mother') ||
    normalized.includes('father') ||
    normalized.includes('family')
  ) {
    matched = [QURAN_FIXTURES[4]]; // 17:23-24
    detectedSituation = 'Family dynamics and caring for aging parents';
    detectedEmotion = 'Patience & Compassion';
    underlyingNeed = 'Humbling oneself with wings of mercy';
    relevanceExplanation = 'Surah Al-Isra commands lowering the wing of humility to aging parents with tender prayer.';
  } else {
    // Default fallback to first verified fixture
    matched = [QURAN_FIXTURES[0]];
  }

  return {
    analysisResult: {
      status: 'matched',
      source: 'offline_fallback',
      detectedSituation,
      detectedEmotion,
      underlyingNeed,
      matchedPassageIds: matched.map((m) => m.id),
      relevanceExplanation,
    },
    matchedPassages: matched,
  };
}

/**
 * Service to execute guidance search requests against the API or fallback matcher.
 */
export const GuidanceService = {
  /**
   * Dispatches a guidance search query to the backend API with fallback resilience.
   *
   * @param queryText Search query or reflection prompt
   * @param language Active UI translation language
   * @param mode Optional entry mode override
   * @returns Promise resolving to analysis result and matched passages
   */
  async searchGuidance(
    queryText: string,
    language: Language = 'en',
    _mode?: EntryMode
  ): Promise<{
    analysisResult: QueryAnalysisResponse;
    passages: QuranVerseFixture[];
  }> {
    if (!queryText.trim()) {
      const defaultVerse = QURAN_FIXTURES[0];
      return {
        analysisResult: {
          status: 'matched',
          matchedPassageIds: [defaultVerse.id],
        },
        passages: [defaultVerse],
      };
    }

    try {
      const response = await fetch('/api/guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText, language }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawData = (await response.json()) as GuidanceAPIResponse;
      let passageIds: string[] = [];

      if (rawData.data?.selectedAyahIds) {
        passageIds = rawData.data.selectedAyahIds.map((id) => String(id));
      } else if (rawData.matches) {
        passageIds = rawData.matches.map((m) => String(m.id || m.ayah_id));
      }

      const analysisResult: QueryAnalysisResponse = {
        status: rawData.status || 'matched',
        source: rawData.source,
        detectedSituation: rawData.data?.reasoning || 'Derived from similarity matches',
        detectedEmotion: 'Reflective',
        underlyingNeed: rawData.data?.reflectionPrompt || 'Seeking guidance',
        matchedPassageIds: passageIds,
      };

      if (analysisResult.status === 'matched' && passageIds.length > 0) {
        const matches = passageIds
          .map((id) =>
            QURAN_FIXTURES.find(
              (f) =>
                f.id === id ||
                f.id.startsWith(id) ||
                id.startsWith(f.id) ||
                f.id.split('-')[0] === id.split('-')[0]
            )
          )
          .filter(Boolean) as QuranVerseFixture[];

        return {
          analysisResult,
          passages: matches.length > 0 ? matches : [QURAN_FIXTURES[0]],
        };
      }

      if (analysisResult.status === 'off-topic') {
        return {
          analysisResult,
          passages: [],
        };
      }

      // Default fallback
      return {
        analysisResult,
        passages: [QURAN_FIXTURES[0]],
      };
    } catch (err) {
      console.warn('[GuidanceService] Backend API request failed; using client fallback:', err);
      const fallback = performClientSideGuidanceMatch(queryText);
      return {
        analysisResult: fallback.analysisResult,
        passages: fallback.matchedPassages,
      };
    }
  },
};
