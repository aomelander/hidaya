/**
 * @file src/lib/audio/ayahAudioServerService.ts
 * @description Typed server-side Ayah audio metadata service.
 * Selects only safe public metadata columns and resolves by ayah_id + language_code + audio_type.
 * Never exposes database secrets or archive URLs to client code.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export type AudioStreamType = 'translation' | 'tafsir';
export type AyahAudioStatus = 'available' | 'processing' | 'unavailable';

export interface SafeAyahAudioRecord {
  id: string;
  audioUrl: string; // Internal stream endpoint: /api/ayah-audio/[id]
  ayahId: string;
  languageCode: string;
  audioType: AudioStreamType;
  voice?: string;
  durationSeconds?: number;
  attribution?: any;
}

export interface AyahAudioLookupResult {
  status: AyahAudioStatus;
  record?: SafeAyahAudioRecord;
  message?: string;
}

export interface InternalAyahAudioRecord {
  id: string;
  ayah_id: string;
  language_code: string;
  audio_type: string;
  archive_url: string;
  archive_member: string;
  archive_sha256?: string;
  byte_size?: number;
  delivery?: string;
  duration_seconds?: number;
}

function getResolvedSupabaseConfig() {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const envAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
  const envService = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  let resolvedUrl = 'https://kipsrzozphdgbaqrhiok.supabase.co';
  if (envUrl.startsWith('http://') || envUrl.startsWith('https://')) {
    resolvedUrl = envUrl;
  } else if (envAnon.startsWith('http://') || envAnon.startsWith('https://')) {
    resolvedUrl = envAnon;
  }

  let resolvedKey = envService;
  if (!resolvedKey || resolvedKey.startsWith('http')) {
    resolvedKey =
      !envAnon.startsWith('http') && envAnon
        ? envAnon
        : envUrl && !envUrl.startsWith('http')
        ? envUrl
        : 'mock-key';
  }

  const isMock = resolvedKey === 'mock-key';
  return { url: resolvedUrl, key: resolvedKey, isMock };
}

let serverClient: SupabaseClient | null = null;

function getServerSupabaseClient(): SupabaseClient | null {
  if (serverClient) return serverClient;
  const { url, key, isMock } = getResolvedSupabaseConfig();
  if (isMock) return null;

  try {
    serverClient = createClient(url, key, {
      auth: { persistSession: false },
    });
    return serverClient;
  } catch (err) {
    console.warn('Failed to initialize server Supabase client for audio:', err);
    return null;
  }
}

// In-memory cache for Ayah UUID resolution from surahNumber + ayahNumber
const AYAH_ID_CACHE = new Map<string, string>();

/**
 * Resolves an Ayah UUID from surah number and ayah number.
 */
export async function resolveAyahId(
  surahNumber: number,
  ayahNumber: number
): Promise<string | null> {
  const cacheKey = `${surahNumber}:${ayahNumber}`;
  if (AYAH_ID_CACHE.has(cacheKey)) {
    return AYAH_ID_CACHE.get(cacheKey)!;
  }

  const supabase = getServerSupabaseClient();
  if (!supabase) return null;

  try {
    // 1. Find surah UUID
    const { data: surah, error: sErr } = await supabase
      .from('surah')
      .select('id')
      .eq('number', surahNumber)
      .single();

    if (sErr || !surah?.id) return null;

    // 2. Find ayah UUID
    const { data: ayah, error: aErr } = await supabase
      .from('ayah')
      .select('id')
      .eq('surah_id', surah.id)
      .eq('ayah_number', ayahNumber)
      .single();

    if (aErr || !ayah?.id) return null;

    AYAH_ID_CACHE.set(cacheKey, ayah.id);
    return ayah.id;
  } catch (err) {
    console.warn('Error resolving ayah id:', err);
    return null;
  }
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUuid(value?: string | null): value is string {
  return Boolean(value && UUID_REGEX.test(value.trim()));
}

/**
 * Parses a composite ayah reference like "3:134" or "94:5-6" into surahNumber and primary ayahNumber.
 */
export function parseCompositeAyahKey(raw?: string | null): { surahNumber: number; ayahNumber: number } | null {
  if (!raw || typeof raw !== 'string' || !raw.includes(':')) return null;
  const [surahPart, versePart] = raw.trim().split(':');
  const surahNumber = parseInt(surahPart, 10);
  const firstVerse = parseInt((versePart || '').split('-')[0].trim(), 10);
  if (!isNaN(surahNumber) && surahNumber >= 1 && surahNumber <= 114 && !isNaN(firstVerse) && firstVerse >= 1) {
    return { surahNumber, ayahNumber: firstVerse };
  }
  return null;
}

/**
 * Looks up safe audio metadata for an Ayah, language, and stream type.
 * Returns only minimum safe public fields without exposing internal archive parameters.
 */
export async function lookupAyahAudio(params: {
  ayahId?: string;
  surahNumber?: number;
  ayahNumber?: number;
  languageCode: string;
  audioType: AudioStreamType;
}): Promise<AyahAudioLookupResult> {
  const { languageCode, audioType } = params;
  const rawAyahId = params.ayahId?.trim();
  let ayahId = isValidUuid(rawAyahId) ? rawAyahId : undefined;
  let surahNumber = params.surahNumber;
  let ayahNumber = params.ayahNumber;

  if (!ayahId && rawAyahId) {
    const parsed = parseCompositeAyahKey(rawAyahId);
    if (parsed) {
      surahNumber = surahNumber ?? parsed.surahNumber;
      ayahNumber = ayahNumber ?? parsed.ayahNumber;
    }
  }

  if (!ayahId && surahNumber && ayahNumber) {
    ayahId = (await resolveAyahId(surahNumber, ayahNumber)) || undefined;
  }

  if (!ayahId) {
    return {
      status: 'unavailable',
      message: 'Ayah identifier not found.',
    };
  }

  const supabase = getServerSupabaseClient();
  if (!supabase) {
    // Graceful preview/mock fallback if no database connection
    return {
      status: languageCode === 'ar' ? 'processing' : 'unavailable',
      message: languageCode === 'ar' ? 'Arabic neural audio is in production.' : 'Audio service unavailable.',
    };
  }

  try {
    const { data, error } = await supabase
      .from('ayah_audio')
      .select('id, ayah_id, language_code, audio_type, voice, duration_seconds, attribution')
      .eq('ayah_id', ayahId)
      .eq('language_code', languageCode.toLowerCase())
      .eq('audio_type', audioType)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.warn('Error querying ayah_audio:', error.message);
      return {
        status: 'unavailable',
        message: 'Failed to query audio metadata.',
      };
    }

    if (!data || data.length === 0) {
      // In-production Arabic or missing audio
      if (languageCode.toLowerCase() === 'ar') {
        return {
          status: 'processing',
          message: 'Arabic neural audio is currently in production.',
        };
      }

      return {
        status: 'unavailable',
        message: `${audioType === 'translation' ? 'Translation' : 'Tafsir'} audio is not available for this Ayah in ${languageCode.toUpperCase()}.`,
      };
    }

    const row = data[0];
    return {
      status: 'available',
      record: {
        id: row.id,
        audioUrl: `/api/ayah-audio/${row.id}`,
        ayahId: row.ayah_id,
        languageCode: row.language_code,
        audioType: row.audio_type as AudioStreamType,
        voice: row.voice,
        durationSeconds: row.duration_seconds,
        attribution: row.attribution,
      },
    };
  } catch (err) {
    console.warn('Error in lookupAyahAudio:', err);
    return {
      status: 'unavailable',
      message: 'An error occurred during audio metadata resolution.',
    };
  }
}

/**
 * Retrieves internal record needed by the audio streaming route to locate and extract the archive member.
 * Only callable by the server route /api/ayah-audio/[id].
 */
export async function getInternalAyahAudioRecord(id: string): Promise<InternalAyahAudioRecord | null> {
  if (!isValidUuid(id)) return null;
  const supabase = getServerSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('ayah_audio')
      .select('id, ayah_id, language_code, audio_type, archive_url, archive_member, archive_sha256, byte_size, delivery, duration_seconds')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return data as InternalAyahAudioRecord;
  } catch (err) {
    console.warn('Failed to retrieve internal ayah_audio record:', err);
    return null;
  }
}
