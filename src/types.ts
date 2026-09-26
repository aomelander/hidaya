export type Language = 'en' | 'sv' | 'fr';

export type EntryMode = 'moment' | 'questions' | 'growth';

export interface TafsirCitation {
  scholar: 'Ibn Kathir' | "Al-Sa'di" | 'Al-Muyassar';
  century?: string;
  sourceBook: string;
  text: string;
}

export interface ReflectionFramework {
  understand: string;
  reflectPrompt: string;
  applyAction: string;
}

export interface WhyThisVerse {
  emotion: string;
  situation: string;
  coreNeed: string;
  spiritualPrinciple: string;
  mappingExplanation: string;
  topics: string[];
}

export interface QuranVerseFixture {
  id: string; // e.g., "3:134"
  surahNumber: number;
  surahNameArabic: string;
  surahNameTransliterated: string;
  surahNameMeaning: string;
  verseNumber: string; // "134" or "155-156"
  juz: number;
  revelationType: 'Meccan' | 'Medinan';
  revelationContext: string;
  arabicText: string;
  transliteration: string;
  translations: {
    en: {
      text: string;
      translator: string;
    };
    sv: {
      text: string;
      translator: string;
    };
    fr: {
      text: string;
      translator: string;
    };
  };
  audioUrl: string; // Reciter audio stream (Mishary Alafasy)
  category: EntryMode;
  topics: string[];
  emotions: string[];
  situations: string[];
  whyThisVerse: WhyThisVerse;
  tafsirCitations: TafsirCitation[];
  reflectionFramework: ReflectionFramework;
}

export interface UserReflection {
  verseId: string;
  date: string;
  understandNotes: string;
  reflectNotes: string;
  applyNotes: string;
  userSituation?: string;
}

export interface QuickPill {
  id: string;
  label: string;
  labelArabic?: string;
  category: EntryMode;
  query: string;
  iconName: string;
  description: string;
}

export interface QueryAnalysisResponse {
  status: 'matched' | 'off-topic' | 'clarification';
  source?: 'direct_lookup' | 'cache' | 'semantic_search' | 'gemini_synthesis' | 'offline_fallback';
  detectedSituation?: string;
  detectedEmotion?: string;
  underlyingNeed?: string;
  matchedPassageIds: string[];
  relevanceExplanation?: string;
  offTopicMessage?: string;
  suggestedTopics?: string[];
}
