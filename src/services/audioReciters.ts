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
  const reciter =
    AVAILABLE_RECITERS.find((r) => r.id === reciterId) || AVAILABLE_RECITERS[0];

  // Extract primary ayah number if given a range like "5-6" or "155-156"
  const cleanAyahStr = verseNumberStr.split('-')[0].trim();
  const ayahNum = parseInt(cleanAyahStr, 10);

  if (isNaN(surahNumber) || isNaN(ayahNum)) {
    // Default fallback to 3:134
    return `${reciter.baseUrl}/003134.mp3`;
  }

  const surahPadded = surahNumber.toString().padStart(3, '0');
  const ayahPadded = ayahNum.toString().padStart(3, '0');

  return `${reciter.baseUrl}/${surahPadded}${ayahPadded}.mp3`;
}
