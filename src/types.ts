export type Language = 'en' | 'sv' | 'fr';

export type EntryMode = 'moment' | 'questions' | 'growth';

export type LifeSphere = 'all' | 'individual' | 'family' | 'society';

export type SessionDepth = '2min' | '10min' | '30min' | '60min';

export type ReciterId = 'alafasy' | 'abdulbasit' | 'husary' | 'ghamadi';

export interface ReciterInfo {
  id: ReciterId;
  name: string;
  subname: string;
  style: string;
  baseUrl: string;
}

export interface TafsirCitation {
  scholar: 'Ibn Kathir' | "Al-Sa'di" | 'Al-Muyassar';
  century?: string;
  sourceBook: string;
  text: string;
}

export interface LinguisticRoot {
  termArabic: string;
  termTransliterated: string;
  root: string;
  literalImagery: {
    en: string;
    sv: string;
    fr: string;
  };
  spiritualDepth: {
    en: string;
    sv: string;
    fr: string;
  };
}

export interface HalaqahPrompts {
  discussionQuestions: {
    en: string[];
    sv: string[];
    fr: string[];
  };
  familyCommitment: {
    en: string;
    sv: string;
    fr: string;
  };
}

export interface ReflectionFramework {
  understand: string;
  reflectPrompt: string;
  applyAction: string;
  livePrompt?: string; // Step 4: Live & Carry ("How can this show in how you live?")
}

export interface WhyThisVerse {
  emotion: string;
  situation: string;
  coreNeed: string;
  spiritualPrinciple: string;
  mappingExplanation: string;
  topics: string[];
}

export interface SurroundingVerse {
  verseNumber: string;
  arabicText: string;
  translations: {
    en: string;
    sv: string;
    fr: string;
  };
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
  notSaying?: {
    en: string;
    sv: string;
    fr: string;
  };
  surroundingVerses?: {
    before?: SurroundingVerse;
    after?: SurroundingVerse;
  };
  lifeSphere?: 'individual' | 'family' | 'society';
  linguisticRoots?: LinguisticRoot[];
  halaqahPrompts?: HalaqahPrompts;
}

export interface UserReflection {
  verseId: string;
  date: string;
  understandNotes: string;
  reflectNotes: string;
  applyNotes: string;
  liveNotes?: string; // Step 4: One thing I will carry today
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
