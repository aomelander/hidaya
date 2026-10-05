export type Language = 'en' | 'sv' | 'fr' | 'ar';

export type EntryMode = 'moment' | 'questions' | 'growth';

export type LifeSphere = 'all' | 'individual' | 'family' | 'society';

export type SessionDepth = '2min' | '10min' | '30min' | '60min';

export type ExplanationDepth = 'simple' | 'context' | 'tafsir' | 'study';

export type AudioPlaybackMode = 'quran_only' | 'quran_translation' | 'quran_tafsir';

export type PreferredScholar = 'Ibn Kathir' | "Al-Sa'di" | 'Al-Muyassar' | "Al-Sha'rawi" | 'Al-Bouti';

export type TafsirSourceType =
  | 'classical_book'
  | 'expert_transcription'
  | 'ai_translated_expert'
  | 'ai_synthesis';

export type TafsirVerificationStatus =
  | 'verified_canonical'
  | 'transcription_verified'
  | 'ai_translated_pending_review'
  | 'ai_synthesized';

export type ReciterId = 'alafasy' | 'abdulbasit' | 'husary' | 'minshawi' | 'ghamadi';

export interface ReciterInfo {
  id: ReciterId;
  name: string;
  subname: string;
  style: string;
  baseUrl: string;
}

export interface TafsirCitation {
  scholar: PreferredScholar | string;
  century?: string;
  sourceBook: string;
  text: string;
  // Provenance & Transparency Fields (AGENTS.md strict attribution):
  sourceType?: TafsirSourceType;
  sourceReference?: string;
  originalArabicRaw?: string;
  verificationStatus?: TafsirVerificationStatus;
  aiModel?: string;
  translationDisclaimer?: string;
}

export interface LinguisticRoot {
  termArabic: string;
  termTransliterated: string;
  root: string;
  literalImagery: {
    en: string;
    sv: string;
    fr: string;
    ar?: string;
  };
  spiritualDepth: {
    en: string;
    sv: string;
    fr: string;
    ar?: string;
  };
}

export interface HalaqahPrompts {
  discussionQuestions: {
    en: string[];
    sv: string[];
    fr: string[];
    ar?: string[];
  };
  familyCommitment: {
    en: string;
    sv: string;
    fr: string;
    ar?: string;
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
    ar?: string;
  };
}

export interface CompanionGuidanceBundle {
  kids?: {
    title?: string;
    storyText: string;
    familyQuestionTitle?: string;
    familyQuestion: string;
    tryTodayLabel?: string;
    tryTodayAction: string;
  };
  teenKeyTakeaway?: string;
  teenGlossary?: Array<{ term: string; meaning: string }>;
  defaultRoot?: LinguisticRoot;
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
    ar?: {
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
    ar?: string;
  };
  surroundingVerses?: {
    before?: SurroundingVerse;
    after?: SurroundingVerse;
  };
  lifeSphere?: 'individual' | 'family' | 'society';
  linguisticRoots?: LinguisticRoot[];
  halaqahPrompts?: HalaqahPrompts;
  companionGuidance?: Record<Language, CompanionGuidanceBundle> | CompanionGuidanceBundle;
}

export type ReaderProfile = 'adult' | 'teen' | 'kids';

export type ReflectionMood = 'calm' | 'anxious' | 'grateful' | 'hopeful' | 'overwhelmed';

export interface UserReflection {
  verseId: string;
  date: string;
  understandNotes: string;
  reflectNotes: string;
  applyNotes: string;
  liveNotes?: string; // Step 4: One thing I will carry today
  userSituation?: string;
  mood?: ReflectionMood;
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

export interface LicenseRegistryEntry {
  id: string;
  sourceName: string;
  sourceOrg: string;
  contentType: 'Quran Text' | 'Translation' | 'Tafsir' | 'Audio Recitation';
  language: string;
  license: string;
  canDisplay: boolean;
  canStore: boolean;
  canExport: boolean;
  attributionRule: string;
  verificationAudit: string;
}

export type PerspectiveMode = 'devotional' | 'inquirer';

export type ScholarReviewStatus = 'verified' | 'reviewed' | 'pending' | 'flagged';

export interface EditorialReviewEntry {
  verseId: string;
  reviewerName: string;
  institution: string;
  status: ScholarReviewStatus;
  mappingConfidence: number; // 0 - 100%
  theologicalNotes: string;
  boundaryConfirmed: boolean;
  lastAudited: string;
}


