/**
 * @file src/app/api/quran/sequence/route.ts
 * @description Fetches a consecutive sequential slice of Quranic ayahs for a given surah (1-114).
 * Used for sequential reading continuation (e.g. finish the surah, next 15 verses, next 100 verses)
 * starting from a clicked Ayah.
 */

import { NextRequest, NextResponse } from 'next/server';
import { QURAN_FIXTURES } from '../../../../data/quranFixtures';
import { getSurahMeta } from '../../../../data/surahCatalog';
import { Language, QuranVerseFixture, TafsirCitation } from '../../../../types';

// In-memory cache for surah payloads to guarantee sub-millisecond sequential navigation
const SURAH_CACHE = new Map<number, any>();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const surahNum = Math.max(1, Math.min(114, parseInt(searchParams.get('surah') || '1', 10) || 1));
  const surahMeta = getSurahMeta(surahNum);
  const totalAyahs = surahMeta.ayahCount;

  const fromAyah = Math.max(1, Math.min(totalAyahs, parseInt(searchParams.get('from') || '1', 10) || 1));
  const rawTo = parseInt(searchParams.get('to') || String(totalAyahs), 10);
  const toAyah = Math.max(fromAyah, Math.min(totalAyahs, isNaN(rawTo) ? totalAyahs : rawTo));

  const langParam = (searchParams.get('lang') || 'en').toLowerCase();
  const language: Language =
    langParam === 'sv' || langParam === 'fr' || langParam === 'ar' ? langParam : 'en';

  try {
    let editionsData = SURAH_CACHE.get(surahNum);

    if (!editionsData) {
      const editionsUrl = `https://api.alquran.cloud/v1/surah/${surahNum}/editions/quran-uthmani,en.sahih,sv.bernstrom,fr.hamidullah,ar.muyassar`;
      const res = await fetch(editionsUrl, {
        headers: { Accept: 'application/json' },
        next: { revalidate: 86400 },
      });

      if (res.ok) {
        const payload = (await res.json()) as { data?: any[] };
        if (payload.data && Array.isArray(payload.data)) {
          editionsData = payload.data;
          SURAH_CACHE.set(surahNum, editionsData);
        }
      }
    }

    const uthmaniEdition = editionsData?.find((e: any) => e.edition?.identifier === 'quran-uthmani') || editionsData?.[0];
    const enEdition = editionsData?.find((e: any) => e.edition?.identifier === 'en.sahih');
    const svEdition = editionsData?.find((e: any) => e.edition?.identifier === 'sv.bernstrom');
    const frEdition = editionsData?.find((e: any) => e.edition?.identifier === 'fr.hamidullah');
    const arMuyassarEdition = editionsData?.find((e: any) => e.edition?.identifier === 'ar.muyassar');

    const verses: QuranVerseFixture[] = [];

    for (let ayah = fromAyah; ayah <= toAyah; ayah++) {
      const exactId = `${surahNum}:${ayah}`;

      // Check if rich curated fixture exists in QURAN_FIXTURES
      const fixtureMatch = QURAN_FIXTURES.find(
        (f) => f.id === exactId || (f.surahNumber === surahNum && f.verseNumber === String(ayah))
      );

      const ayahIdx = ayah - 1;
      const uthmaniAyah = uthmaniEdition?.ayahs?.[ayahIdx];
      const enAyah = enEdition?.ayahs?.[ayahIdx];
      const svAyah = svEdition?.ayahs?.[ayahIdx];
      const frAyah = frEdition?.ayahs?.[ayahIdx];
      const arMuyassarAyah = arMuyassarEdition?.ayahs?.[ayahIdx];

      const paddedSurah = String(surahNum).padStart(3, '0');
      const paddedAyah = String(ayah).padStart(3, '0');

      const tafsirCitations: TafsirCitation[] = fixtureMatch?.tafsirCitations ? [...fixtureMatch.tafsirCitations] : [];
      if (arMuyassarAyah?.text && !tafsirCitations.some((c) => c.scholar === 'Al-Muyassar')) {
        tafsirCitations.push({
          scholar: 'Al-Muyassar',
          century: 'Contemporary',
          sourceBook: 'Al-Tafsir Al-Muyassar (King Fahd Complex)',
          text: arMuyassarAyah.text,
          languageCode: 'ar',
          sourceType: 'classical_book',
          sourceReference: `Al-Tafsir Al-Muyassar, Surah ${surahNum}:${ayah}`,
          originalArabicRaw: arMuyassarAyah.text,
          verificationStatus: 'verified_canonical',
        });
      }

      const verseObj: QuranVerseFixture = {
        id: exactId,
        surahNumber: surahNum,
        surahNameArabic: surahMeta.nameArabic,
        surahNameTransliterated: surahMeta.nameTransliterated,
        surahNameMeaning: surahMeta.meaning[language] || surahMeta.meaning.en,
        verseNumber: String(ayah),
        juz: uthmaniAyah?.juz || surahMeta.juzStart,
        revelationType: surahMeta.revelationType,
        revelationContext: fixtureMatch?.revelationContext || '',
        arabicText: uthmaniAyah?.text || fixtureMatch?.arabicText || '',
        transliteration: fixtureMatch?.transliteration || '',
        translations: {
          en: fixtureMatch?.translations?.en || {
            text: enAyah?.text || '',
            translator: 'Sahih International',
          },
          sv: fixtureMatch?.translations?.sv || {
            text: svAyah?.text || '',
            translator: 'Mohammed Knut Bernström',
          },
          fr: fixtureMatch?.translations?.fr || {
            text: frAyah?.text || '',
            translator: 'Muhammad Hamidullah',
          },
          ar: {
            text: uthmaniAyah?.text || fixtureMatch?.arabicText || '',
            translator: 'القرآن الكريم (رسم عثماني)',
          },
        },
        audioUrl: `https://everyayah.com/data/Alafasy_128kbps/${paddedSurah}${paddedAyah}.mp3`,
        category: fixtureMatch?.category || 'moment',
        topics: fixtureMatch?.topics || [surahMeta.nameTransliterated],
        emotions: fixtureMatch?.emotions || [],
        situations: fixtureMatch?.situations || [],
        whyThisVerse: fixtureMatch?.whyThisVerse || {
          emotion: '',
          situation: '',
          coreNeed: '',
          spiritualPrinciple: '',
          mappingExplanation: '',
          topics: [],
        },
        tafsirCitations,
        reflectionFramework: fixtureMatch?.reflectionFramework || {
          understand: '',
          reflectPrompt: '',
          applyAction: '',
        },
        surroundingVerses: fixtureMatch?.surroundingVerses,
      };

      verses.push(verseObj);
    }

    return NextResponse.json({
      verses,
      totalAyahs,
      fromAyah,
      toAyah,
      surahMeta,
    });
  } catch (err) {
    console.error('[api/quran/sequence] Error fetching sequence:', err);
    return NextResponse.json(
      { error: 'Failed to fetch sequential verses' },
      { status: 500 }
    );
  }
}
