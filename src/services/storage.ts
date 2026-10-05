/**
 * @file storage.ts
 * @description Local-first persistence layer for bookmarks, reflections, user preferences, and recent searches.
 * Guarantees privacy: sensitive reflections are never uploaded to remote servers without user consent.
 */

import {
  UserReflection,
  Language,
  SessionDepth,
  ReciterId,
  ReaderProfile,
  PreferredScholar,
  EntryMode,
} from '../types';
import { APP_CONFIG } from '../config/appConfig';

const { STORAGE_KEYS, DEFAULTS, LIMITS } = APP_CONFIG;

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  totalDaysActive: number;
}

export const StorageService = {
  /**
   * Retrieves bookmarked verse IDs from localStorage.
   * @returns Array of bookmarked verse IDs (e.g. ['3:134'])
   */
  getBookmarks(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return data ? JSON.parse(data) : [DEFAULTS.INITIAL_VERSE_ID];
    } catch {
      return [DEFAULTS.INITIAL_VERSE_ID];
    }
  },

  /**
   * Toggles bookmark state for a given verse ID.
   * @param verseId Quran verse identifier (e.g. "3:134")
   * @returns boolean true if bookmarked, false if unbookmarked
   */
  toggleBookmark(verseId: string): boolean {
    try {
      const current = this.getBookmarks();
      const exists = current.includes(verseId);
      const updated = exists ? current.filter((id) => id !== verseId) : [...current, verseId];
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(updated));
      return !exists;
    } catch {
      return false;
    }
  },

  /**
   * Checks if a verse is currently bookmarked.
   * @param verseId Verse ID to check
   */
  isBookmarked(verseId: string): boolean {
    return this.getBookmarks().includes(verseId);
  },

  /**
   * Retrieves all user reflections keyed by verse ID.
   */
  getReflections(): Record<string, UserReflection> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REFLECTIONS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  /**
   * Retrieves the reflection for a specific verse.
   * @param verseId Verse ID
   */
  getReflection(verseId: string): UserReflection | null {
    const reflections = this.getReflections();
    return reflections[verseId] || null;
  },

  /**
   * Saves or updates a user's reflection notes for a verse.
   * @param verseId Verse ID
   * @param reflection Partial reflection fields to update
   */
  saveReflection(verseId: string, reflection: Partial<UserReflection>): void {
    try {
      const all = this.getReflections();
      const existing = all[verseId] || {
        verseId,
        date: new Date().toISOString(),
        understandNotes: '',
        reflectNotes: '',
        applyNotes: '',
        liveNotes: '',
      };
      all[verseId] = {
        ...existing,
        ...reflection,
        verseId,
        date: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify(all));
    } catch (err) {
      console.error('[StorageService] Error saving reflection:', err);
    }
  },

  /**
   * Deletes a reflection entry.
   * @param verseId Verse ID to delete
   */
  deleteReflection(verseId: string): void {
    try {
      const all = this.getReflections();
      delete all[verseId];
      localStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify(all));
    } catch (err) {
      console.error('[StorageService] Error deleting reflection:', err);
    }
  },

  /**
   * Gets preferred translation language.
   */
  getLanguage(): Language {
    try {
      return (localStorage.getItem(STORAGE_KEYS.LANGUAGE) as Language) || DEFAULTS.LANGUAGE;
    } catch {
      return DEFAULTS.LANGUAGE;
    }
  },

  /**
   * Sets preferred translation language.
   */
  setLanguage(lang: Language): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    } catch {}
  },

  /**
   * Gets font size multiplier for Arabic script.
   */
  getFontSizeMultiplier(): number {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.FONT_SIZE);
      return val ? parseFloat(val) : DEFAULTS.ARABIC_SCALE;
    } catch {
      return DEFAULTS.ARABIC_SCALE;
    }
  },

  /**
   * Sets font size multiplier for Arabic script.
   */
  setFontSizeMultiplier(multiplier: number): void {
    try {
      localStorage.setItem(STORAGE_KEYS.FONT_SIZE, multiplier.toString());
    } catch {}
  },

  /**
   * Gets preference for phonetic transliteration display.
   */
  getShowTransliteration(): boolean {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.SHOW_TRANSLITERATION);
      return val !== null ? val === 'true' : DEFAULTS.SHOW_TRANSLITERATION;
    } catch {
      return DEFAULTS.SHOW_TRANSLITERATION;
    }
  },

  /**
   * Sets preference for phonetic transliteration display.
   */
  setShowTransliteration(show: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SHOW_TRANSLITERATION, String(show));
    } catch {}
  },

  /**
   * Gets dark mode preference.
   */
  getDarkMode(): boolean {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
      return val === 'true';
    } catch {
      return DEFAULTS.DARK_MODE;
    }
  },

  /**
   * Sets dark mode preference.
   */
  setDarkMode(isDark: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, String(isDark));
    } catch {}
  },

  /**
   * Gets high contrast mode preference.
   */
  getHighContrast(): boolean {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.HIGH_CONTRAST);
      return val === 'true';
    } catch {
      return DEFAULTS.HIGH_CONTRAST;
    }
  },

  /**
   * Sets high contrast mode preference.
   */
  setHighContrast(isHigh: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.HIGH_CONTRAST, String(isHigh));
    } catch {}
  },

  /**
   * Retrieves list of recent searches.
   */
  getRecentSearches(): string[] {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
      return val ? JSON.parse(val) : ['Anger at work', 'Anxiety & burnout', 'Purpose of suffering'];
    } catch {
      return ['Anger at work', 'Anxiety & burnout'];
    }
  },

  /**
   * Adds a query to recent searches, avoiding duplicates and limiting list length.
   */
  addRecentSearch(query: string): void {
    if (!query.trim()) return;
    try {
      const current = this.getRecentSearches().filter((q) => q.toLowerCase() !== query.toLowerCase());
      const updated = [query.trim(), ...current].slice(0, LIMITS.MAX_RECENT_SEARCHES);
      localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(updated));
    } catch {}
  },

  /**
   * Gets preferred Quran reciter ID.
   */
  getPreferredReciter(): ReciterId {
    try {
      return (localStorage.getItem(STORAGE_KEYS.RECITER) as ReciterId) || DEFAULTS.PREFERRED_RECITER;
    } catch {
      return DEFAULTS.PREFERRED_RECITER;
    }
  },

  /**
   * Sets preferred Quran reciter ID.
   */
  setPreferredReciter(id: ReciterId): void {
    try {
      localStorage.setItem(STORAGE_KEYS.RECITER, id);
    } catch {}
  },

  /**
   * Gets preferred contemplation session depth.
   */
  getSessionDepth(): SessionDepth {
    try {
      return (localStorage.getItem(STORAGE_KEYS.SESSION_DEPTH) as SessionDepth) || DEFAULTS.SESSION_DEPTH;
    } catch {
      return DEFAULTS.SESSION_DEPTH;
    }
  },

  /**
   * Sets preferred contemplation session depth.
   */
  setSessionDepth(depth: SessionDepth): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSION_DEPTH, depth);
    } catch {}
  },

  /**
   * Gets inquirer / universal perspective mode.
   */
  getInquirerMode(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEYS.INQUIRER_MODE) === 'true';
    } catch {
      return false;
    }
  },

  /**
   * Sets inquirer / universal perspective mode.
   */
  setInquirerMode(enabled: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.INQUIRER_MODE, String(enabled));
    } catch {}
  },

  /**
   * Gets the active reader profile ('adult' | 'teen' | 'kids').
   */
  getReaderProfile(): ReaderProfile {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.READER_PROFILE) as ReaderProfile | null;
      if (val === 'adult' || val === 'teen' || val === 'kids') return val;
      return DEFAULTS.READER_PROFILE;
    } catch {
      return DEFAULTS.READER_PROFILE;
    }
  },

  /**
   * Sets the active reader profile ('adult' | 'teen' | 'kids').
   */
  setReaderProfile(profile: ReaderProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.READER_PROFILE, profile);
    } catch {}
  },

  /**
   * Gets the preferred Classical Tafsir scholar ('Ibn Kathir' | "Al-Sa'di" | 'Al-Muyassar').
   */
  getPreferredScholar(): PreferredScholar {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.SCHOLAR) as PreferredScholar | null;
      if (val === 'Ibn Kathir' || val === "Al-Sa'di" || val === 'Al-Muyassar') return val;
      return DEFAULTS.PREFERRED_SCHOLAR;
    } catch {
      return DEFAULTS.PREFERRED_SCHOLAR;
    }
  },

  /**
   * Sets the preferred Classical Tafsir scholar.
   */
  setPreferredScholar(scholar: PreferredScholar): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SCHOLAR, scholar);
    } catch {}
  },

  /**
   * Gets the preferred entry mode ('moment' | 'questions' | 'growth').
   */
  getEntryMode(): EntryMode {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.ENTRY_MODE) as EntryMode | null;
      if (val === 'moment' || val === 'questions' || val === 'growth') return val;
      return DEFAULTS.DEFAULT_ENTRY_MODE;
    } catch {
      return DEFAULTS.DEFAULT_ENTRY_MODE;
    }
  },

  /**
   * Sets the preferred entry mode.
   */
  setEntryMode(mode: EntryMode): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ENTRY_MODE, mode);
    } catch {}
  },

  /**
   * Gets current daily contemplation streak data.
   */
  getStreakData(): StreakData {
    const today = new Date().toISOString().slice(0, 10);
    const defaultStreak: StreakData = {
      currentStreak: 1,
      longestStreak: 1,
      lastActiveDate: today,
      totalDaysActive: 1,
    };
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.STREAK_DATA);
      if (!raw) return defaultStreak;
      const parsed = JSON.parse(raw) as StreakData;
      return {
        currentStreak: parsed.currentStreak || 1,
        longestStreak: parsed.longestStreak || 1,
        lastActiveDate: parsed.lastActiveDate || today,
        totalDaysActive: parsed.totalDaysActive || 1,
      };
    } catch {
      return defaultStreak;
    }
  },

  /**
   * Records a daily contemplation visit/reflection and updates the streak counter.
   */
  recordDailyVisit(): StreakData {
    const today = new Date().toISOString().slice(0, 10);
    const current = this.getStreakData();

    if (current.lastActiveDate === today) {
      try {
        localStorage.setItem(STORAGE_KEYS.STREAK_DATA, JSON.stringify(current));
      } catch {}
      return current;
    }

    const lastDate = new Date(`${current.lastActiveDate}T00:00:00Z`);
    const todayDate = new Date(`${today}T00:00:00Z`);
    const diffDays = Math.round((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    const nextStreak = diffDays === 1 ? current.currentStreak + 1 : 1;
    const updated: StreakData = {
      currentStreak: nextStreak,
      longestStreak: Math.max(current.longestStreak, nextStreak),
      lastActiveDate: today,
      totalDaysActive: (current.totalDaysActive || 1) + 1,
    };

    try {
      localStorage.setItem(STORAGE_KEYS.STREAK_DATA, JSON.stringify(updated));
    } catch {}
    return updated;
  },
};
