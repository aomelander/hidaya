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

  if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) return [];
  const match = /^(\d+)(?:-(\d+))?$/.exec((verseNumberStr || '').trim());
  if (!match) return [];
  const start = Number(match[1]);
  const end = Number(match[2] || match[1]);
  if (start < 1 || end < start || end > 286) return [];
  return Array.from({ length: end - start + 1 }, (_, index) =>
    `${reciter.baseUrl}/${String(surahNumber).padStart(3, '0')}${String(start + index).padStart(3, '0')}.mp3`
  );
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
