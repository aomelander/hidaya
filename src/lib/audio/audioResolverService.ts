import { saveAudio } from './boundedAudioCache';
import { WordTimestamp } from '../../types';
/**
 * @file src/lib/audio/audioResolverService.ts
 * @description Client-safe audio resolver service for stored neural translation & tafsir audio.
 * Interacts with server-side /api/ayah-audio routes and Service Worker cache (`hidaya-audio-v3`).
 * Preserves Quran recitation via src/services/audioReciters.ts.
 */

export type StoredAudioType = 'translation' | 'tafsir';
export type AudioStreamStatus = 'available' | 'processing' | 'unavailable';

export interface StoredAudioMetadata {
  status: AudioStreamStatus;
  audioUrls?: string[];
  record?: {
    id: string;
    audioUrl: string; // Internal stream endpoint: /api/ayah-audio/[id]
    ayahId: string;
    languageCode: string;
    audioType: StoredAudioType;
    voice?: string;
    durationSeconds?: number;
    attribution?: any;
    timestamps?: WordTimestamp[];
  };
  message?: string;
}

export const AUDIO_CACHE_NAME = 'hidaya-audio-v3';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Client-side in-memory cache and in-flight request deduplication map
const METADATA_IN_MEMORY_CACHE = new Map<string, { data: StoredAudioMetadata; timestamp: number }>();
const METADATA_IN_FLIGHT_REQUESTS = new Map<string, Promise<StoredAudioMetadata>>();
const MAX_CLIENT_METADATA_CACHE = 250;
const CLIENT_METADATA_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export function clearClientAudioMetadataCache(): void {
  METADATA_IN_MEMORY_CACHE.clear();
  METADATA_IN_FLIGHT_REQUESTS.clear();
}

/**
 * Resolves stored neural audio metadata for translation or tafsir from the server API.
 * Never connects directly to Supabase with service keys on the client.
 * Features in-memory caching and in-flight deduplication for instant 0ms repeated resolution.
 */
export async function fetchAyahAudioMetadata(params: {
  surahNumber: number;
  ayahNumber: number | string;
  language: string;
  type: StoredAudioType;
  ayahId?: string;
  signal?: AbortSignal;
  source?: string;
}): Promise<StoredAudioMetadata> {
  const { surahNumber, ayahNumber, language, type, ayahId, signal } = params;

  // Primary verse number for lookup
  const cleanAyah = String(ayahNumber).split('-')[0].trim();
  if (!cleanAyah) return { status: 'unavailable' };

  const cacheKey = `${surahNumber}:${cleanAyah}:${(language || 'en').toLowerCase()}:${type}:${params.source || ''}:${ayahId || ''}`;
  const now = Date.now();

  if (signal?.aborted) {
    return { status: 'unavailable', message: 'Aborted' };
  }

  const cached = METADATA_IN_MEMORY_CACHE.get(cacheKey);
  if (cached && now - cached.timestamp < CLIENT_METADATA_CACHE_TTL_MS) {
    return cached.data;
  }

  // Deduplicate concurrent in-flight requests for identical parameters
  const existingInFlight = METADATA_IN_FLIGHT_REQUESTS.get(cacheKey);
  if (existingInFlight && !signal?.aborted) {
    return existingInFlight;
  }

  const queryParams = new URLSearchParams({
    surah: String(surahNumber),
    verse: cleanAyah,
    lang: (language || 'en').toLowerCase(),
    type,
  });

  if (params.source) {
    queryParams.set('source', params.source);
  }

  if (ayahId && UUID_REGEX.test(ayahId.trim())) {
    queryParams.set('ayahId', ayahId.trim());
  }

  const fetchPromise = (async (): Promise<StoredAudioMetadata> => {
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
      if (data.record && (data.record.languageCode !== language || data.record.audioType !== type)) {
        return { status: 'unavailable' };
      }

      // Cache positive response in client memory
      if (data.status === 'available') {
        if (METADATA_IN_MEMORY_CACHE.size >= MAX_CLIENT_METADATA_CACHE) {
          const oldestKey = METADATA_IN_MEMORY_CACHE.keys().next().value;
          if (oldestKey) METADATA_IN_MEMORY_CACHE.delete(oldestKey);
        }
        METADATA_IN_MEMORY_CACHE.set(cacheKey, { data, timestamp: now });
      }

      return data;
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return { status: 'unavailable', message: 'Aborted' };
      }
      console.warn('Network error resolving audio metadata:', err);
      return {
        status: 'unavailable',
        message: 'Network error connecting to audio resolver service.',
      };
    }
  })();

  if (!signal?.aborted) {
    METADATA_IN_FLIGHT_REQUESTS.set(cacheKey, fetchPromise);
    fetchPromise.finally(() => {
      METADATA_IN_FLIGHT_REQUESTS.delete(cacheKey);
    });
  }

  return fetchPromise;
}

/**
 * Verifies whether an audio URL is saved in the Service Worker hidaya-audio-v3 cache.
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
 * Caches an audio stream URL directly into the Service Worker hidaya-audio-v3 cache.
 */
export async function cacheAudioUrlInServiceWorker(audioUrl: string): Promise<boolean> {
  if (typeof window === 'undefined' || !('caches' in window) || !audioUrl) {
    return false;
  }

  try {
    if (await saveAudio(audioUrl)) {
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
 * Removes an audio stream URL from the Service Worker hidaya-audio-v3 cache.
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

/** Resolve every visible ayah independently; never substitute a first-ayah recording for a range. */
export async function fetchAyahAudioPlaylist(params: Parameters<typeof fetchAyahAudioMetadata>[0] & { verseNumbers: number[] }): Promise<StoredAudioMetadata> {
  if (!params.verseNumbers.length || params.verseNumbers.length > 286) return { status: 'unavailable' };
  if (params.signal?.aborted) return { status: 'unavailable' };

  const records = await Promise.all(
    params.verseNumbers.map((ayahNumber) =>
      fetchAyahAudioMetadata({ ...params, ayahNumber, ayahId: undefined })
    )
  );

  if (params.signal?.aborted) return { status: 'unavailable' };
  const validRecords = records.filter((metadata) => metadata.status === 'available' && metadata.record);
  if (!validRecords.length) {
    return { status: 'unavailable' };
  }

  return { ...validRecords[0], audioUrls: validRecords.map((metadata) => metadata.record!.audioUrl) };
}
