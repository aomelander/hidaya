import { ReciterId, ReciterInfo } from '../types';

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
    id: 'ghamadi',
    name: 'Saad Al-Ghamdi',
    subname: 'Saudi Arabia • Melodic Warmth',
    style: 'Murattal (Smooth Pace)',
    baseUrl: 'https://everyayah.com/data/Ghamadi_40kbps',
  },
];

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
    return `${reciter.baseUrl}/003134.mp3`;
  }

  const surahPadded = surahNumber.toString().padStart(3, '0');
  const ayahPadded = ayahNum.toString().padStart(3, '0');

  return `${reciter.baseUrl}/${surahPadded}${ayahPadded}.mp3`;
}
