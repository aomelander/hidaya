/**
 * @file src/services/offlineCacheService.ts
 * @description Client-side Offline Cache & Service Worker synchronization service.
 * Manages offline caching for:
 * 1. All built-in verified Quranic passages, translations (en, sv, fr, ar), and classical Tafsir.
 * 2. Any bookmarked or searched passages.
 * 3. Optional per-verse audio recitations (MP3) on user demand.
 */

import { QuranVerseFixture } from '../types';
import { QURAN_FIXTURES } from '../data/quranFixtures';

export const PASSAGES_CACHE_NAME = 'hidaya-passages-v2';
export const AUDIO_CACHE_NAME = 'hidaya-audio-v2';
const LOCAL_CACHED_PASSAGES_KEY = 'hidaya_offline_passages_v2';
const LOCAL_CACHED_AUDIO_KEY = 'hidaya_offline_audio_urls_v2';

export interface OfflineCacheStats {
  cachedPassagesCount: number;
  cachedAudioCount: number;
  isOfflineReady: boolean;
}

function isCacheStorageSupported(): boolean {
  return typeof window !== 'undefined' && 'caches' in window;
}

export const OfflineCacheService = {
  /**
   * Precaches all built-in verified Quranic passages and translations (en, sv, fr, ar)
   * plus any previously bookmarked or searched verses into CacheStorage and localStorage.
   */
  async precacheAllBuiltInPassages(extraVerses: QuranVerseFixture[] = []): Promise<OfflineCacheStats> {
    const mergedMap = new Map<string, QuranVerseFixture>();
    for (const v of QURAN_FIXTURES) {
      mergedMap.set(v.id, v);
    }
    for (const v of extraVerses) {
      if (v && v.id) mergedMap.set(v.id, v);
    }

    const existingLocal = this.getCachedPassagesFromLocal();
    for (const v of existingLocal) {
      if (v && v.id && !mergedMap.has(v.id)) {
        mergedMap.set(v.id, v);
      }
    }

    const allVerses = Array.from(mergedMap.values());
    await this.cachePassages(allVerses);
    return this.getCacheStats();
  },

  /**
   * Stores an array of QuranVerseFixture objects (Arabic, translations, Tafsir)
   * into both CacheStorage (`hidaya-passages-v2`) and localStorage fallback.
   */
  async cachePassages(verses: QuranVerseFixture[]): Promise<void> {
    if (!verses || verses.length === 0 || typeof window === 'undefined') return;

    // 1. Update localStorage mirror for synchronous offline access
    try {
      const current = this.getCachedPassagesFromLocal();
      const map = new Map<string, QuranVerseFixture>();
      for (const item of current) map.set(item.id, item);
      for (const item of verses) map.set(item.id, item);
      localStorage.setItem(
        LOCAL_CACHED_PASSAGES_KEY,
        JSON.stringify(Array.from(map.values()))
      );
    } catch {
      // Ignore quota errors
    }

    // 2. Write each passage record into CacheStorage (`hidaya-passages-v2`)
    if (isCacheStorageSupported()) {
      try {
        const cache = await window.caches.open(PASSAGES_CACHE_NAME);
        await Promise.all(
          verses.map((verse) => {
            const url = `/offline-data/verse/${encodeURIComponent(verse.id)}.json`;
            const response = new Response(JSON.stringify(verse), {
              headers: {
                'Content-Type': 'application/json',
                'X-Hidaya-Cached-At': new Date().toISOString(),
              },
            });
            return cache.put(url, response);
          })
        );
      } catch {
        // Fallback already stored in localStorage
      }
    }

    // 3. Notify active Service Worker if controlling the page
    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_PASSAGES',
          passages: verses,
        });
      }
    } catch {}

    window.dispatchEvent(new CustomEvent('hidaya-offline-cache-updated'));
  },

  /**
   * Synchronously reads cached passages from localStorage mirror (or returns QURAN_FIXTURES).
   */
  getCachedPassagesFromLocal(): QuranVerseFixture[] {
    if (typeof window === 'undefined') return QURAN_FIXTURES;
    try {
      const raw = localStorage.getItem(LOCAL_CACHED_PASSAGES_KEY);
      if (!raw) return QURAN_FIXTURES;
      const parsed = JSON.parse(raw) as QuranVerseFixture[];
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : QURAN_FIXTURES;
    } catch {
      return QURAN_FIXTURES;
    }
  },

  /**
   * Checks whether a specific verse's audio URL is cached for offline playback.
   */
  async isAudioCached(audioUrl: string): Promise<boolean> {
    if (!audioUrl || typeof window === 'undefined') return false;

    if (isCacheStorageSupported()) {
      try {
        const cache = await window.caches.open(AUDIO_CACHE_NAME);
        const match = await cache.match(audioUrl);
        if (match) return true;
      } catch {}
    }

    try {
      const urls = this.getTrackedAudioUrls();
      return urls.includes(audioUrl);
    } catch {
      return false;
    }
  },

  /**
   * Caches a verse's audio MP3 file into `hidaya-audio-v2` for offline listening.
   * Uses CORS fetch first and falls back to no-cors opaque response if needed.
   */
  async cacheVerseAudio(audioUrl: string): Promise<boolean> {
    if (!audioUrl || !isCacheStorageSupported()) return false;

    try {
      const cache = await window.caches.open(AUDIO_CACHE_NAME);
      let response: Response;
      try {
        response = await fetch(audioUrl, { mode: 'cors' });
      } catch {
        response = await fetch(audioUrl, { mode: 'no-cors' });
      }

      if (response && (response.ok || response.type === 'opaque')) {
        await cache.put(audioUrl, response);
        this.trackAudioUrl(audioUrl, true);
        window.dispatchEvent(new CustomEvent('hidaya-offline-cache-updated'));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  /**
   * Removes a cached verse audio file from `hidaya-audio-v2`.
   */
  async removeVerseAudio(audioUrl: string): Promise<boolean> {
    if (!audioUrl || !isCacheStorageSupported()) return false;

    try {
      const cache = await window.caches.open(AUDIO_CACHE_NAME);
      await cache.delete(audioUrl);
      this.trackAudioUrl(audioUrl, false);
      window.dispatchEvent(new CustomEvent('hidaya-offline-cache-updated'));
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Toggles offline caching for a verse's audio URL.
   * @returns boolean true if now cached, false if removed
   */
  async toggleVerseAudioCache(audioUrl: string): Promise<boolean> {
    const alreadyCached = await this.isAudioCached(audioUrl);
    if (alreadyCached) {
      await this.removeVerseAudio(audioUrl);
      return false;
    } else {
      return await this.cacheVerseAudio(audioUrl);
    }
  },

  /**
   * Caches audio files for a list of verses (e.g. all bookmarked verses).
   */
  async cacheAudioForVerses(verses: QuranVerseFixture[]): Promise<number> {
    let successCount = 0;
    for (const verse of verses) {
      if (verse.audioUrl) {
        const ok = await this.cacheVerseAudio(verse.audioUrl);
        if (ok) successCount++;
      }
    }
    return successCount;
  },

  /**
   * Clears all cached audio MP3 files while preserving cached Quranic text & translations.
   */
  async clearAllAudioCache(): Promise<void> {
    if (isCacheStorageSupported()) {
      try {
        await window.caches.delete(AUDIO_CACHE_NAME);
      } catch {}
    }
    try {
      localStorage.removeItem(LOCAL_CACHED_AUDIO_KEY);
    } catch {}
    window.dispatchEvent(new CustomEvent('hidaya-offline-cache-updated'));
  },

  /**
   * Computes current offline cache statistics for the Journal and Preferences tabs.
   */
  async getCacheStats(): Promise<OfflineCacheStats> {
    const localPassages = this.getCachedPassagesFromLocal();
    let cachedPassagesCount = localPassages.length;
    let cachedAudioCount = this.getTrackedAudioUrls().length;

    if (isCacheStorageSupported()) {
      try {
        const passageCache = await window.caches.open(PASSAGES_CACHE_NAME);
        const passageKeys = await passageCache.keys();
        const verseKeys = passageKeys.filter((req) =>
          req.url.includes('/offline-data/verse/')
        );
        if (verseKeys.length > cachedPassagesCount) {
          cachedPassagesCount = verseKeys.length;
        }

        const audioCache = await window.caches.open(AUDIO_CACHE_NAME);
        const audioKeys = await audioCache.keys();
        cachedAudioCount = audioKeys.length;
      } catch {}
    }

    return {
      cachedPassagesCount,
      cachedAudioCount,
      isOfflineReady: cachedPassagesCount > 0,
    };
  },

  getTrackedAudioUrls(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(LOCAL_CACHED_AUDIO_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  trackAudioUrl(url: string, add: boolean): void {
    if (typeof window === 'undefined') return;
    try {
      const current = this.getTrackedAudioUrls().filter((u) => u !== url);
      const next = add ? [...current, url] : current;
      localStorage.setItem(LOCAL_CACHED_AUDIO_KEY, JSON.stringify(next));
    } catch {}
  },
};
