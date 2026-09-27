import { UserReflection, Language, SessionDepth, ReciterId } from '../types';

const STORAGE_KEYS = {
  BOOKMARKS: 'hidaya_bookmarks',
  REFLECTIONS: 'hidaya_reflections',
  LANGUAGE: 'hidaya_pref_lang',
  FONT_SIZE: 'hidaya_pref_font_size',
  SHOW_TRANSLITERATION: 'hidaya_pref_transliteration',
  DARK_MODE: 'hidaya_pref_dark_mode',
  HIGH_CONTRAST: 'hidaya_pref_high_contrast',
  RECENT_SEARCHES: 'hidaya_recent_searches',
  RECITER: 'hidaya_pref_reciter',
  SESSION_DEPTH: 'hidaya_pref_session_depth',
  INQUIRER_MODE: 'hidaya_pref_inquirer_mode',
};

export const StorageService = {
  getBookmarks(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return data ? JSON.parse(data) : ['3:134'];
    } catch {
      return ['3:134'];
    }
  },

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

  isBookmarked(verseId: string): boolean {
    return this.getBookmarks().includes(verseId);
  },

  getReflections(): Record<string, UserReflection> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REFLECTIONS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  getReflection(verseId: string): UserReflection | null {
    const reflections = this.getReflections();
    return reflections[verseId] || null;
  },

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
      console.error('Error saving reflection', err);
    }
  },

  getLanguage(): Language {
    try {
      return (localStorage.getItem(STORAGE_KEYS.LANGUAGE) as Language) || 'en';
    } catch {
      return 'en';
    }
  },

  setLanguage(lang: Language): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    } catch {}
  },

  getFontSizeMultiplier(): number {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.FONT_SIZE);
      return val ? parseFloat(val) : 1.15;
    } catch {
      return 1.15;
    }
  },

  setFontSizeMultiplier(multiplier: number): void {
    try {
      localStorage.setItem(STORAGE_KEYS.FONT_SIZE, multiplier.toString());
    } catch {}
  },

  getShowTransliteration(): boolean {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.SHOW_TRANSLITERATION);
      return val !== null ? val === 'true' : true;
    } catch {
      return true;
    }
  },

  setShowTransliteration(show: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SHOW_TRANSLITERATION, String(show));
    } catch {}
  },

  getDarkMode(): boolean {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
      return val === 'true';
    } catch {
      return false;
    }
  },

  setDarkMode(isDark: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, String(isDark));
    } catch {}
  },

  getHighContrast(): boolean {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.HIGH_CONTRAST);
      return val === 'true';
    } catch {
      return false;
    }
  },

  setHighContrast(isHigh: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.HIGH_CONTRAST, String(isHigh));
    } catch {}
  },

  getRecentSearches(): string[] {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
      return val ? JSON.parse(val) : ['Anger at work', 'Anxiety & burnout', 'Purpose of suffering'];
    } catch {
      return ['Anger at work', 'Anxiety & burnout'];
    }
  },

  addRecentSearch(query: string): void {
    if (!query.trim()) return;
    try {
      const current = this.getRecentSearches().filter((q) => q.toLowerCase() !== query.toLowerCase());
      const updated = [query.trim(), ...current].slice(0, 8);
      localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(updated));
    } catch {}
  },

  getPreferredReciter(): ReciterId {
    try {
      return (localStorage.getItem(STORAGE_KEYS.RECITER) as ReciterId) || 'alafasy';
    } catch {
      return 'alafasy';
    }
  },

  setPreferredReciter(id: ReciterId): void {
    try {
      localStorage.setItem(STORAGE_KEYS.RECITER, id);
    } catch {}
  },

  getSessionDepth(): SessionDepth {
    try {
      return (localStorage.getItem(STORAGE_KEYS.SESSION_DEPTH) as SessionDepth) || '10min';
    } catch {
      return '10min';
    }
  },

  setSessionDepth(depth: SessionDepth): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSION_DEPTH, depth);
    } catch {}
  },

  getInquirerMode(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEYS.INQUIRER_MODE) === 'true';
    } catch {
      return false;
    }
  },

  setInquirerMode(enabled: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.INQUIRER_MODE, String(enabled));
    } catch {}
  },

  deleteReflection(verseId: string): void {
    try {
      const all = this.getReflections();
      delete all[verseId];
      localStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify(all));
    } catch {}
  },
};
