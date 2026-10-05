/**
 * @file audioReciters.ts
 * @description Master catalog of verified Murattal Quran reciters with EveryAyah stream formatting.
 */

import { ReciterId, ReciterInfo } from '../types';

/**
 * List of publicly available Murattal reciters from EveryAyah.com.
 */
export const AVAILABLE_RECITERS: ReciterInfo[] = [
  {
    id: 'alafasy',
    name: 'Mishary Rashid Alafasy',
    subname: 'Kuwait • Modern Reverent',
    style: 'Murattal (Emotive)',
    baseUrl: 'https://everyayah.com/data/Alafasy_128kbps',
  },
  {
    id: 'abdulbasit',
    name: 'Abdul Basit Abdul Samad',
    subname: 'Egypt • Golden Era',
    style: 'Murattal (Calm & Slow)',
    baseUrl: 'https://everyayah.com/data/Abdul_Basit_Murattal_192kbps',
  },
  {
    id: 'husary',
    name: 'Mahmoud Khalil Al-Husary',
    subname: 'Egypt • Master of Tajweed',
    style: 'Murattal (Pedagogical & Clear)',
    baseUrl: 'https://everyayah.com/data/Husary_128kbps',
  },
  {
    id: 'minshawi',
    name: 'Muhammad Siddiq Al-Minshawi',
    subname: 'Egypt • Deep Reverence & Tearful Tone',
    style: 'Murattal (Khashi\')',
    baseUrl: 'https://everyayah.com/data/Minshawy_Murattal_128kbps',
  },
  {
    id: 'ghamadi',
    name: 'Saad Al-Ghamdi',
    subname: 'Saudi Arabia • Melodic Warmth',
    style: 'Murattal (Smooth Pace)',
    baseUrl: 'https://everyayah.com/data/Ghamadi_40kbps',
  },
];

/**
 * Computes the ordered array of MP3 stream URLs for a single verse or consecutive verse range
 * (e.g. "134" -> [003134.mp3], "5-6" -> [094005.mp3, 094006.mp3], capped at 3 consecutive verses max).
 */
export function getAudioUrlsForVerseRange(
  surahNumber: number,
  verseNumberStr: string,
  reciterId: ReciterId = 'alafasy'
): string[] {
  const reciter =
    AVAILABLE_RECITERS.find((r) => r.id === reciterId) || AVAILABLE_RECITERS[0];

  const surahPadded = (isNaN(surahNumber) ? 3 : surahNumber).toString().padStart(3, '0');
  const trimmed = (verseNumberStr || '').trim();

  if (trimmed.includes('-')) {
    const [startRaw, endRaw] = trimmed.split('-').map((s) => parseInt(s.trim(), 10));
    if (!isNaN(startRaw) && !isNaN(endRaw) && endRaw >= startRaw) {
      // Strictly cap at 3 consecutive verses maximum
      const cappedEnd = Math.min(endRaw, startRaw + 2);
      const urls: string[] = [];
      for (let v = startRaw; v <= cappedEnd; v++) {
        urls.push(`${reciter.baseUrl}/${surahPadded}${v.toString().padStart(3, '0')}.mp3`);
      }
      return urls;
    }
  }

  const singleAyah = parseInt(trimmed, 10);
  if (isNaN(singleAyah)) {
    return [`${reciter.baseUrl}/003134.mp3`];
  }

  return [`${reciter.baseUrl}/${surahPadded}${singleAyah.toString().padStart(3, '0')}.mp3`];
}

/**
 * Computes the standardized MP3 audio stream URL for a given Surah and Ayah.
 * Handles single ayah numbers as well as hyphenated ranges (e.g. "5-6" -> selects first ayah 5).
 *
 * @param surahNumber Surah number (1 to 114)
 * @param verseNumberStr Ayah number string (e.g. "134" or "155-156")
 * @param reciterId Chosen reciter identifier (defaults to 'alafasy')
 * @returns Direct MP3 stream URL
 */
export function getAudioUrlForVerse(
  surahNumber: number,
  verseNumberStr: string,
  reciterId: ReciterId = 'alafasy'
): string {
  return getAudioUrlsForVerseRange(surahNumber, verseNumberStr, reciterId)[0];
}
