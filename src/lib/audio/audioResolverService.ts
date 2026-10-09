/**
 * @file src/lib/audio/audioResolverService.ts
 * @description Client-safe audio resolver service for stored neural translation & tafsir audio.
 * Interacts with server-side /api/ayah-audio routes and Service Worker cache (`hidaya-audio-v2`).
 * Preserves Quran recitation via src/services/audioReciters.ts.
 */

export type StoredAudioType = 'translation' | 'tafsir';
export type AudioStreamStatus = 'available' | 'processing' | 'unavailable';

export interface StoredAudioMetadata {
  status: AudioStreamStatus;
  record?: {
    id: string;
    audioUrl: string; // Internal stream endpoint: /api/ayah-audio/[id]
    ayahId: string;
    languageCode: string;
    audioType: StoredAudioType;
    voice?: string;
    durationSeconds?: number;
    attribution?: any;
  };
  message?: string;
}

export const AUDIO_CACHE_NAME = 'hidaya-audio-v2';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resolves stored neural audio metadata for translation or tafsir from the server API.
 * Never connects directly to Supabase with service keys on the client.
 */
export async function fetchAyahAudioMetadata(params: {
  surahNumber: number;
  ayahNumber: number | string;
  language: string;
  type: StoredAudioType;
  ayahId?: string;
  signal?: AbortSignal;
}): Promise<StoredAudioMetadata> {
  const { surahNumber, ayahNumber, language, type, ayahId, signal } = params;

  // Primary verse number for lookup
  const cleanAyah = String(ayahNumber).split('-')[0].trim();

  const queryParams = new URLSearchParams({
    surah: String(surahNumber),
    verse: cleanAyah,
    lang: (language || 'en').toLowerCase(),
    type,
  });

  if (ayahId && UUID_REGEX.test(ayahId.trim())) {
    queryParams.set('ayahId', ayahId.trim());
  }

  try {
    const res = await fetch(`/api/ayah-audio/metadata?${queryParams.toString()}`, {
      signal,
    });
    if (!res.ok) {
      return {
        status: 'unavailable',
        message: `HTTP error ${res.status} resolving audio stream`,
      };
    }

    const data = (await res.json()) as StoredAudioMetadata;
    return data;
  } catch (err) {
    console.warn('Network error resolving audio metadata:', err);
    return {
      status: 'unavailable',
      message: 'Network error connecting to audio resolver service.',
    };
  }
}

/**
 * Verifies whether an audio URL is saved in the Service Worker hidaya-audio-v2 cache.
 */
export async function isAudioUrlCached(audioUrl: string): Promise<boolean> {
  if (typeof window === 'undefined' || !('caches' in window) || !audioUrl) {
    return false;
  }

  try {
    const cache = await window.caches.open(AUDIO_CACHE_NAME);
    const match = await cache.match(audioUrl);
    return Boolean(match);
  } catch {
    return false;
  }
}

/**
 * Caches an audio stream URL directly into the Service Worker hidaya-audio-v2 cache.
 */
export async function cacheAudioUrlInServiceWorker(audioUrl: string): Promise<boolean> {
  if (typeof window === 'undefined' || !('caches' in window) || !audioUrl) {
    return false;
  }

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
      window.dispatchEvent(
        new CustomEvent('hidaya-offline-cache-updated', {
          detail: { audioUrl, cached: true },
        })
      );
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Failed to cache audio stream in Service Worker:', err);
    return false;
  }
}

/**
 * Removes an audio stream URL from the Service Worker hidaya-audio-v2 cache.
 */
export async function removeAudioUrlFromServiceWorker(audioUrl: string): Promise<boolean> {
  if (typeof window === 'undefined' || !('caches' in window) || !audioUrl) {
    return false;
  }

  try {
    const cache = await window.caches.open(AUDIO_CACHE_NAME);
    const deleted = await cache.delete(audioUrl);
    window.dispatchEvent(
      new CustomEvent('hidaya-offline-cache-updated', {
        detail: { audioUrl, cached: false },
      })
    );
    return deleted;
  } catch {
    return false;
  }
}
