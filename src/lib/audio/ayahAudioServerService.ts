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

let serverClient: SupabaseClient | null = null;

function getServerSupabaseClient(): SupabaseClient | null {
  if (serverClient) return serverClient;
  const url = process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
  if (!url || !key) return null;

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
  if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114 || !Number.isInteger(ayahNumber) || ayahNumber < 1 || ayahNumber > 286) return null;
  const cacheKey = `${surahNumber}:${ayahNumber}`;
  if (AYAH_ID_CACHE.has(cacheKey)) {
    return AYAH_ID_CACHE.get(cacheKey)!;
  }

  const supabase = getServerSupabaseClient();
  if (supabase) {
    try {
      const { data: surah } = await supabase
        .from('surah')
        .select('id')
        .eq('number', surahNumber)
        .single();

      if (surah?.id) {
        const { data: ayah } = await supabase
          .from('ayah')
          .select('id')
          .eq('surah_id', surah.id)
          .eq('ayah_number', ayahNumber)
          .single();

        if (ayah?.id) {
          if (AYAH_ID_CACHE.size >= 6236) AYAH_ID_CACHE.delete(AYAH_ID_CACHE.keys().next().value!);
          AYAH_ID_CACHE.set(cacheKey, ayah.id);
          return ayah.id;
        }
      }
    } catch {
      // Fallback below
    }
  }

  return null;
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

function normalizeString(s?: string | null): string {
  if (!s) return '';
  return s.toLowerCase().replace(/['"`\-_\s—]/g, '').trim();
}

export function isKnownClassicalScholar(source?: string | null): boolean {
  if (!source) return false;
  const s = normalizeString(source);
  return (
    s.includes('kathir') ||
    s.includes('كثير') ||
    s.includes('sadi') ||
    s.includes('السعدي') ||
    s.includes('muyassar') ||
    s.includes('الميسر') ||
    s.includes('sharawi') ||
    s.includes('الشعراوي') ||
    s.includes('mukhtasar') ||
    s.includes('المختصر') ||
    s.includes('tabari') ||
    s.includes('qurtubi')
  );
}

export function matchesAttributionSource(
  attribution: any,
  requestedSource?: string,
  audioType: AudioStreamType = 'translation'
): boolean {
  if (!attribution) return false;
  if (!requestedSource) return false;

  const rawScholar = attribution.scholar_name || attribution.scholar || '';
  const rawWork = attribution.work_title || '';
  const rawSource = attribution.source || '';

  const reqNorm = normalizeString(requestedSource);
  const scholarNorm = normalizeString(rawScholar);
  const workNorm = normalizeString(rawWork);
  const sourceNorm = normalizeString(rawSource);

  if (!reqNorm) return false;

  // Direct normalized match against any attribution field
  if (scholarNorm && reqNorm === scholarNorm) return true;
  if (workNorm && reqNorm === workNorm) return true;
  if (sourceNorm && reqNorm === sourceNorm) return true;

  // Sahih / Saheeh International normalization (both spellings exist in ayah_audio)
  const isReqSahih = reqNorm.includes('sahih') || reqNorm.includes('saheeh');
  const isAttSahih =
    (scholarNorm && (scholarNorm.includes('sahih') || scholarNorm.includes('saheeh'))) ||
    (sourceNorm && (sourceNorm.includes('sahih') || sourceNorm.includes('saheeh')));
  if (isReqSahih && isAttSahih) {
    return true;
  }

  // Knut Bernström / Mohammed Knut Bernström normalization
  const isReqBern = reqNorm.includes('bernstrom');
  const isAttBern =
    (scholarNorm && scholarNorm.includes('bernstrom')) ||
    (sourceNorm && sourceNorm.includes('bernstrom'));
  if (isReqBern && isAttBern) {
    return true;
  }

  // Muhammad Hamidullah normalization
  const isReqHamid = reqNorm.includes('hamidullah');
  const isAttHamid =
    (scholarNorm && scholarNorm.includes('hamidullah')) ||
    (sourceNorm && sourceNorm.includes('hamidullah'));
  if (isReqHamid && isAttHamid) {
    return true;
  }

  // Classical Tafsir scholars & works
  if (audioType === 'tafsir') {
    // Ibn Kathir
    const isReqKathir = reqNorm.includes('kathir') || reqNorm.includes('كثير');
    const isAttKathir =
      (scholarNorm && (scholarNorm.includes('kathir') || scholarNorm.includes('كثير'))) ||
      (workNorm && (workNorm.includes('kathir') || workNorm.includes('كثير')));
    if (isReqKathir && isAttKathir) return true;

    // Al-Sa'di
    const isReqSadi = reqNorm.includes('sadi') || reqNorm.includes('السعدي');
    const isAttSadi =
      (scholarNorm && (scholarNorm.includes('sadi') || scholarNorm.includes('السعدي'))) ||
      (workNorm && (workNorm.includes('sadi') || workNorm.includes('السعدي')));
    if (isReqSadi && isAttSadi) return true;

    // Al-Muyassar
    const isReqMuyassar = reqNorm.includes('muyassar') || reqNorm.includes('الميسر');
    const isAttMuyassar =
      (scholarNorm && (scholarNorm.includes('muyassar') || scholarNorm.includes('الميسر'))) ||
      (workNorm && (workNorm.includes('muyassar') || workNorm.includes('الميسر')));
    if (isReqMuyassar && isAttMuyassar) return true;

    // Al-Sha'rawi
    const isReqSharawi = reqNorm.includes('sharawi') || reqNorm.includes('الشعراوي');
    const isAttSharawi =
      (scholarNorm && (scholarNorm.includes('sharawi') || scholarNorm.includes('الشعراوي'))) ||
      (workNorm && (workNorm.includes('sharawi') || workNorm.includes('الشعراوي')));
    if (isReqSharawi && isAttSharawi) return true;

    // Al-Mukhtasar
    const isReqMukhtasar = reqNorm.includes('mukhtasar') || reqNorm.includes('المختصر');
    const isAttMukhtasar =
      (scholarNorm && (scholarNorm.includes('mukhtasar') || scholarNorm.includes('المختصر'))) ||
      (workNorm && (workNorm.includes('mukhtasar') || workNorm.includes('المختصر')));
    if (isReqMukhtasar && isAttMukhtasar) return true;

    // Substring match if length >= 4
    if (reqNorm.length >= 4) {
      if (scholarNorm && (scholarNorm.includes(reqNorm) || reqNorm.includes(scholarNorm))) return true;
      if (workNorm && (workNorm.includes(reqNorm) || reqNorm.includes(workNorm))) return true;
    }
  }

  return false;
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
  source?: string;
}): Promise<AyahAudioLookupResult> {
  const { languageCode, audioType } = params;
  if (!['en', 'sv', 'fr', 'ar'].includes(languageCode) || !['translation', 'tafsir'].includes(audioType) || !params.source) {
    return { status: 'unavailable' };
  }
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

  if (surahNumber && ayahNumber) {
    ayahId = (await resolveAyahId(surahNumber, ayahNumber)) || undefined;
  }

  if (!ayahId) {
    return {
      status: 'unavailable',
      message: 'Ayah identifier not found.',
    };
  }

  const supabase = getServerSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('ayah_audio')
        .select('id, ayah_id, language_code, audio_type, voice, duration_seconds, attribution')
        .eq('ayah_id', ayahId)
        .eq('language_code', languageCode.toLowerCase())
        .eq('audio_type', audioType)
        .order('created_at', { ascending: false })
        .limit(100);

      if (!error && data && data.length > 0) {
        // 1. Try to find candidate matching the requested source/scholar
        let row = data.find((candidate) => {
          return candidate.ayah_id === ayahId &&
            candidate.language_code === languageCode.toLowerCase() &&
            candidate.audio_type === audioType &&
            matchesAttributionSource(candidate.attribution, params.source, audioType);
        });

        // 2. Fallback for tafsir: If the user requested a verified classical scholar/tafsir
        // but that specific scholar is not recorded for this ayah, fall back to any available
        // verified classical tafsir recording available for that ayah in the target language.
        if (!row && audioType === 'tafsir' && isKnownClassicalScholar(params.source)) {
          row = data.find((candidate) => {
            return candidate.ayah_id === ayahId &&
              candidate.language_code === languageCode.toLowerCase() &&
              candidate.audio_type === audioType;
          });
        }

        // 3. Fallback for translation: if source was loosely specified and only one translation recording exists
        if (!row && audioType === 'translation' && data.length === 1) {
          const onlyRow = data[0];
          if (onlyRow.ayah_id === ayahId && onlyRow.language_code === languageCode.toLowerCase() && onlyRow.audio_type === audioType) {
            row = onlyRow;
          }
        }

        if (!row) return { status: 'unavailable' };

        const attScholar = typeof row.attribution?.scholar_name === 'string'
          ? row.attribution.scholar_name
          : typeof row.attribution?.scholar === 'string'
          ? row.attribution.scholar
          : undefined;

        const attSource = typeof row.attribution?.source === 'string'
          ? row.attribution.source
          : typeof row.attribution?.work_title === 'string'
          ? row.attribution.work_title
          : undefined;

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
            attribution: {
              source: attSource,
              scholar: attScholar,
            },
          },
        };
      }
    } catch {
      // Missing database records remain unavailable.
    }
  }


  return {
    status: 'unavailable',
    message: `${audioType === 'translation' ? 'Translation' : 'Tafsir'} audio is not available for this Ayah in ${languageCode.toUpperCase()}.`,
  };
}

/**
 * Retrieves internal record needed by the audio streaming route to locate and extract the archive member.
 * Only callable by the server route /api/ayah-audio/[id].
 */
export async function getInternalAyahAudioRecord(id: string): Promise<InternalAyahAudioRecord | null> {
  if (!isValidUuid(id)) return null;

  // 2. Check Supabase if configured
  const supabase = getServerSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('ayah_audio')
        .select('id, ayah_id, language_code, audio_type, archive_url, archive_member, archive_sha256, byte_size, delivery, duration_seconds')
        .eq('id', id)
        .single();

      if (!error && data) {
        return data as InternalAyahAudioRecord;
      }
    } catch (err) {
      console.warn('Failed to retrieve internal ayah_audio record from DB:', err);
    }
  }

  return null;
}
