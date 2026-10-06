/**
 * @file appConfig.ts
 * @description Centralized configuration parameters, default constants, and storage keys for Hidaya.
 * Eliminates magic strings and hardcoded values across the application.
 */

import { Language, SessionDepth, ExplanationDepth, ReciterId, EntryMode, PreferredScholar } from '../types';

export const APP_CONFIG = {
  APP_NAME: 'Hidaya',
  APP_NAME_ARABIC: 'هِدَايَة',
  TAGLINE: 'Quran Guidance for Your Moment: From Mushaf to Human to Life',
  
  // Default Application Preferences
  DEFAULTS: {
    LANGUAGE: 'en' as Language,
    ARABIC_SCALE: 1.15,
    READING_SCALE: 1.0,
    SHOW_TRANSLITERATION: true,
    DARK_MODE: false,
    HIGH_CONTRAST: false,
    SESSION_DEPTH: '10min' as SessionDepth,
    EXPLANATION_DEPTH: 'context' as ExplanationDepth,
    PREFERRED_RECITER: 'alafasy' as ReciterId,
    PREFERRED_SCHOLAR: 'Ibn Kathir' as PreferredScholar,
    INITIAL_VERSE_ID: '3:134',
    DEFAULT_ENTRY_MODE: 'moment' as EntryMode,
    READER_PROFILE: 'adult' as const,
  },

  // Local Storage Keys
  STORAGE_KEYS: {
    BOOKMARKS: 'hidaya_bookmarks',
    REFLECTIONS: 'hidaya_reflections',
    LANGUAGE: 'hidaya_pref_lang',
    FONT_SIZE: 'hidaya_pref_font_size',
    READING_SCALE: 'hidaya_pref_reading_scale',
    SHOW_TRANSLITERATION: 'hidaya_pref_transliteration',
    DARK_MODE: 'hidaya_pref_dark_mode',
    HIGH_CONTRAST: 'hidaya_pref_high_contrast',
    RECENT_SEARCHES: 'hidaya_recent_searches',
    RECITER: 'hidaya_pref_reciter',
    SCHOLAR: 'hidaya_pref_scholar',
    ENTRY_MODE: 'hidaya_pref_entry_mode',
    SESSION_DEPTH: 'hidaya_pref_session_depth',
    INQUIRER_MODE: 'hidaya_pref_inquirer_mode',
    READER_PROFILE: 'hidaya_pref_reader_profile',
    STREAK_DATA: 'hidaya_streak_data',
  },

  // Limits and Thresholds
  LIMITS: {
    MAX_RECENT_SEARCHES: 8,
    MIN_ARABIC_SCALE: 0.9,
    MAX_ARABIC_SCALE: 1.6,
    ARABIC_SCALE_STEP: 0.1,
    MAX_TEXT_SANITIZE_LENGTH: 800,
  },

  // Keywords that classify queries as outside the spiritual/reflective guidance scope
  OFF_TOPIC_KEYWORDS: [
    'code',
    'python',
    'javascript',
    'typescript',
    'bitcoin',
    'crypto',
    'gambling',
    'weather',
    'recipe',
    'hack',
    'sports betting',
    'stock pick',
  ],

  // Suggested curated topics for off-topic or empty states
  CURATED_SUGGESTIONS: [
    { label: 'Anger at work', query: 'Anger at work, speech control, and patience' },
    { label: 'Burnout & Overwhelm', query: 'Burnout, stress, finding ease with hardship' },
    { label: 'Patience with Family', query: 'Patience with parents and family friction' },
    { label: 'Purpose of Life', query: 'What is the purpose of life and death?' },
    { label: 'Restless Heart', query: 'Restless heart, anxiety, need peace' },
  ],
} as const;
