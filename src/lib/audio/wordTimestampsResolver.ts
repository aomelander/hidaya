/**
 * @file src/lib/audio/wordTimestampsResolver.ts
 * @description Zero-cost, zero-lag word-by-word millisecond timestamp and phonetic transliteration
 * resolver for Arabic Quran recitation and multi-phase audio.
 *
 * Uses:
 * 1. Quran.com API v4 (`recitations/{id}/by_ayah/{surah}:{ayah}` + `verses/by_key/{surah}:{ayah}?words=true`)
 *    for exact millisecond `start_ms` / `end_ms` segments (handling Madd elongations and pauses).
 * 2. In-memory + localStorage cache for instant 0ms subsequent access.
 * 3. Syllable-weighted fallback when offline or if a reciter segment is unavailable.
 */

import { Language, ReciterId, WordTimestamp } from '../../types';

const QURAN_COM_RECITER_IDS: Record<ReciterId, number> = {
  alafasy: 7,     // Mishary Rashid Alafasy
  abdulbasit: 2,  // AbdulBaset AbdulSamad (Murattal)
  husary: 6,      // Mahmoud Khalil Al-Husary
  minshawi: 9,    // Mohamed Siddiq al-Minshawi (Murattal)
  ghamadi: 7,     // Fallback to Mishary segment timing profile if Ghamadi segments unavailable
};

export interface ResolvedVerseWordTimestamps {
  verseKey: string;
  reciterId: ReciterId;
  isExact: boolean;
  words: WordTimestamp[];
}

const MEMORY_CACHE = new Map<string, ResolvedVerseWordTimestamps>();
const STORAGE_PREFIX = 'hidaya_wbw_ts_v1:';

/**
 * Estimates relative acoustic weight of an Arabic or Latin word based on character length
 * and Madd (long vowel) letters so fallback timing still respects natural elongation.
 */
export function computeWordAcousticWeight(word: string): number {
  if (!word) return 1;
  const clean = word.replace(/[\u064B-\u0652\u06DF-\u06ED]/g, '');
  // Count Arabic long vowels (Alif, Waw, Ya, Maddah, Dagger Alif) for Madd weighting
  const maddCount = (word.match(/[اويى\u0670\u0653~]/g) || []).length;
  return Math.max(1, clean.length + maddCount * 1.4);
}

/**
 * Builds a deterministic syllable/Madd-weighted WordTimestamp[] array for any list of words
 * and total audio duration in milliseconds.
 */
export function buildWeightedWordTimestamps(
  words: string[],
  durationMs: number,
  transliterationWords?: string[],
  translationWords?: string[]
): WordTimestamp[] {
  if (!words.length) return [];
  const effectiveDuration = durationMs > 0 ? durationMs : words.length * 650;
  const weights = words.map((w) => computeWordAcousticWeight(w));
  const totalWeight = weights.reduce((acc, w) => acc + w, 0) || 1;

  let cursorMs = 0;
  return words.map((word, idx) => {
    const share = (weights[idx] / totalWeight) * effectiveDuration;
    const start_ms = Math.round(cursorMs);
    cursorMs += share;
    const end_ms = idx === words.length - 1 ? Math.round(effectiveDuration) : Math.round(cursorMs);
    return {
      position: idx + 1,
      word_arabic: word,
      word,
      transliteration: transliterationWords?.[idx] || '',
      translation: translationWords?.[idx] || '',
      start_ms,
      end_ms: Math.max(start_ms + 50, end_ms),
    };
  });
}

/**
 * Finds the active 0-based word index from a WordTimestamp[] array given `currentTimeMs`.
 */
export function findActiveWordIndexByMs(
  timestamps: WordTimestamp[] | undefined | null,
  currentTimeMs: number
): number {
  if (!timestamps || timestamps.length === 0 || currentTimeMs < 0) return -1;

  for (let i = 0; i < timestamps.length; i++) {
    const item = timestamps[i];
    if (currentTimeMs >= item.start_ms && currentTimeMs <= item.end_ms) {
      return i;
    }
  }

  // If currentTimeMs falls in a brief micro-pause between word[i].end_ms and word[i+1].start_ms,
  // keep the most recently started word highlighted until the next word begins.
  for (let i = timestamps.length - 1; i >= 0; i--) {
    if (currentTimeMs >= timestamps[i].start_ms) {
      // Only hold if within 600ms of end_ms or before the last word finishes
      if (currentTimeMs <= timestamps[i].end_ms + 600) {
        return i;
      }
      break;
    }
  }

  return -1;
}

/**
 * Fetches and caches exact word-level millisecond timestamps (`start_ms`, `end_ms`) and
 * word-by-word phonetic transliteration & translation from Quran.com API v4.
 * Falls back gracefully to weighted timestamps if offline.
 */
export async function resolveArabicVerseWordTimestamps(params: {
  surahNumber: number;
  verseNumber: number | string;
  reciterId: ReciterId;
  language?: Language;
  fallbackArabicText?: string;
  fallbackTransliteration?: string;
  fallbackDurationMs?: number;
}): Promise<ResolvedVerseWordTimestamps> {
  const {
    surahNumber,
    verseNumber,
    reciterId,
    language = 'en',
    fallbackArabicText = '',
    fallbackTransliteration = '',
    fallbackDurationMs = 0,
  } = params;

  const firstAyah = parseInt(String(verseNumber).split('-')[0].trim(), 10) || 1;
  const verseKey = `${surahNumber}:${firstAyah}`;
  const cacheKey = `${verseKey}:${reciterId}:${language}`;

  if (MEMORY_CACHE.has(cacheKey)) {
    return MEMORY_CACHE.get(cacheKey)!;
  }

  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(STORAGE_PREFIX + cacheKey);
      if (raw) {
        const parsed = JSON.parse(raw) as ResolvedVerseWordTimestamps;
        if (parsed && Array.isArray(parsed.words) && parsed.words.length > 0) {
          MEMORY_CACHE.set(cacheKey, parsed);
          return parsed;
        }
      }
    } catch {
      // Ignore storage read errors
    }
  }

  const quranComReciterId = QURAN_COM_RECITER_IDS[reciterId] || 7;
  const langParam = language === 'fr' ? 'fr' : language === 'sv' ? 'sv' : 'en';

  try {
    const [wordsRes, audioRes] = await Promise.all([
      fetch(
        `https://api.quran.com/api/v4/verses/by_key/${encodeURIComponent(
          verseKey
        )}?words=true&word_fields=text_uthmani,transliteration,translation&language=${langParam}`
      ),
      fetch(
        `https://api.quran.com/api/v4/recitations/${quranComReciterId}/by_ayah/${encodeURIComponent(
          verseKey
        )}`
      ),
    ]);

    if (wordsRes.ok) {
      const wordsJson = (await wordsRes.json()) as {
        verse?: {
          words?: Array<{
            position?: number;
            char_type_name?: string;
            text_uthmani?: string;
            text?: string;
            transliteration?: { text?: string };
            translation?: { text?: string };
          }>;
        };
      };

      const audioJson = audioRes.ok
        ? ((await audioRes.json()) as {
            audio_files?: Array<{
              segments?: Array<number[]>;
            }>;
          })
        : null;

      const rawWords = (wordsJson.verse?.words || []).filter(
        (w) => w.char_type_name !== 'end' && (w.text_uthmani || w.text)
      );

      // Build map of position -> [start_ms, end_ms] from Quran.com segments: [word_position, start_ms, end_ms]
      const segmentMap = new Map<number, { start_ms: number; end_ms: number }>();
      const rawSegments = audioJson?.audio_files?.[0]?.segments || [];
      for (const seg of rawSegments) {
        if (Array.isArray(seg) && seg.length >= 3) {
          const [pos, startMs, endMs] = seg;
          if (typeof pos === 'number' && typeof startMs === 'number' && typeof endMs === 'number') {
            segmentMap.set(pos, { start_ms: startMs, end_ms: endMs });
          }
        }
      }

      if (rawWords.length > 0) {
        const hasExactSegments = segmentMap.size > 0;
        const fallbackArabicList = rawWords.map((w) => (w.text_uthmani || w.text || '').trim());
        const fallbackTranslitList = rawWords.map((w) => (w.transliteration?.text || '').trim());
        const fallbackTransList = rawWords.map((w) => (w.translation?.text || '').trim());

        const weightedFallback = buildWeightedWordTimestamps(
          fallbackArabicList,
          fallbackDurationMs || rawWords.length * 650,
          fallbackTranslitList,
          fallbackTransList
        );

        const words: WordTimestamp[] = rawWords.map((w, idx) => {
          const pos = w.position || idx + 1;
          const exactSeg = segmentMap.get(pos) || segmentMap.get(idx + 1);
          const fallbackItem = weightedFallback[idx];
          return {
            position: idx + 1,
            word_arabic: (w.text_uthmani || w.text || '').trim(),
            word: (w.text_uthmani || w.text || '').trim(),
            transliteration: (w.transliteration?.text || '').trim(),
            translation: (w.translation?.text || '').trim(),
            start_ms: exactSeg ? exactSeg.start_ms : fallbackItem.start_ms,
            end_ms: exactSeg ? exactSeg.end_ms : fallbackItem.end_ms,
          };
        });

        const resolved: ResolvedVerseWordTimestamps = {
          verseKey,
          reciterId,
          isExact: hasExactSegments,
          words,
        };

        MEMORY_CACHE.set(cacheKey, resolved);
        if (typeof window !== 'undefined' && hasExactSegments) {
          try {
            window.localStorage.setItem(STORAGE_PREFIX + cacheKey, JSON.stringify(resolved));
          } catch {
            // Ignore quota errors
          }
        }
        return resolved;
      }
    }
  } catch {
    // Offline or network blocked: fall through to local weighted calculation
  }

  // Fallback using local verse text and transliteration
  const cleanArabicWords = fallbackArabicText
    .replace(/[\u06DD\u06DE\u0660-\u0669]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const cleanTranslitWords = fallbackTransliteration.trim().split(/\s+/).filter(Boolean);

  const fallbackWords = buildWeightedWordTimestamps(
    cleanArabicWords,
    fallbackDurationMs || cleanArabicWords.length * 650,
    cleanTranslitWords
  );

  return {
    verseKey,
    reciterId,
    isExact: false,
    words: fallbackWords,
  };
}
