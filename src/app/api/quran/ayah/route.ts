/**
 * @file src/app/api/quran/ayah/route.ts
 * @description Fetches a verified Quranic ayah (Uthmani Arabic + certified human translation + classical tafsir + adjacent verse numbers)
 * for any surah (1-114) and ayah number.
 * Priority:
 * 1. Curated local QURAN_FIXTURES (instant rich tafsir + reflections)
 * 2. Supabase database (`surah`, `ayah`, `translation`, `tafsir`)
 * 3. Verified AlQuran Cloud canonical editions (`quran-uthmani`, `en.sahih`, `sv.bernstrom`, `fr.hamidullah`, `ar.muyassar`)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { QURAN_FIXTURES } from '../../../../data/quranFixtures';
import { getSurahMeta } from '../../../../data/surahCatalog';
import { Language, QuranVerseFixture, TafsirCitation } from '../../../../types';

function getServerSupabase() {
  const url = process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
  if (!url || !key) return null;
  try {
    return createClient(url, key, { auth: { persistSession: false } });
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const surahNum = Math.max(1, Math.min(114, parseInt(searchParams.get('surah') || '1', 10) || 1));
  const surahMeta = getSurahMeta(surahNum);
  const ayahNum = Math.max(
    1,
    Math.min(surahMeta.ayahCount, parseInt(searchParams.get('ayah') || '1', 10) || 1)
  );
  const langParam = (searchParams.get('lang') || 'en').toLowerCase();
  const language: Language =
    langParam === 'sv' || langParam === 'fr' || langParam === 'ar' ? langParam : 'en';

  const exactId = `${surahNum}:${ayahNum}`;

  // 1. Check exact match in curated QURAN_FIXTURES first
  const fixtureMatch = QURAN_FIXTURES.find(
    (f) => f.id === exactId || (f.surahNumber === surahNum && f.verseNumber === String(ayahNum))
  );

  // 2. Query Supabase if configured
  const supabase = getServerSupabase();
  if (supabase) {
    try {
      const { data: surahRow } = await supabase
        .from('surah')
        .select('id, number, name_arabic, name_english, revelation_place')
        .eq('number', surahNum)
        .maybeSingle();

      if (surahRow) {
        const { data: ayahRow } = await supabase
          .from('ayah')
          .select('id, ayah_number, text_uthmani, text_clean')
          .eq('surah_id', surahRow.id)
          .eq('ayah_number', ayahNum)
          .maybeSingle();

        if (ayahRow) {
          const [{ data: transRows }, { data: tafsirRows }] = await Promise.all([
            supabase
              .from('translation')
              .select('language_code, text, source')
              .eq('ayah_id', ayahRow.id),
            supabase
              .from('tafsir')
              .select(
                'scholar_name, work_title, text, language_code, source_type, source_reference, original_arabic_raw, verification_status'
              )
              .eq('ayah_id', ayahRow.id),
          ]);

          const translationsMap: QuranVerseFixture['translations'] = {
            en: { text: '', translator: 'Sahih International' },
            sv: { text: '', translator: 'Mohammed Knut Bernström' },
            fr: { text: '', translator: 'Muhammad Hamidullah' },
          };

          for (const tr of transRows || []) {
            const lc = tr.language_code?.toLowerCase();
            if (lc === 'en' || lc === 'sv' || lc === 'fr' || lc === 'ar') {
              (translationsMap as any)[lc] = {
                text: tr.text,
                translator: tr.source,
              };
            }
          }

          // Merge any curated translations if DB lacked one
          if (fixtureMatch) {
            if (!translationsMap.en.text && fixtureMatch.translations.en?.text) {
              translationsMap.en = fixtureMatch.translations.en;
            }
            if (!translationsMap.sv.text && fixtureMatch.translations.sv?.text) {
              translationsMap.sv = fixtureMatch.translations.sv;
            }
            if (!translationsMap.fr.text && fixtureMatch.translations.fr?.text) {
              translationsMap.fr = fixtureMatch.translations.fr;
            }
          }

          const dbCitations: TafsirCitation[] = (tafsirRows || []).map((t) => ({
            scholar: t.scholar_name,
            sourceBook: t.work_title,
            text: t.text,
            languageCode: t.language_code,
            sourceType: (t.source_type as any) || 'classical_book',
            sourceReference: t.source_reference || undefined,
            originalArabicRaw: t.original_arabic_raw || undefined,
            verificationStatus: (t.verification_status as any) || 'verified_canonical',
          }));

          const combinedCitations =
            dbCitations.length > 0
              ? dbCitations
              : fixtureMatch?.tafsirCitations || [];

          const paddedSurah = String(surahNum).padStart(3, '0');
          const paddedAyah = String(ayahNum).padStart(3, '0');

          const builtVerse: QuranVerseFixture = {
            id: exactId,
            surahNumber: surahNum,
            surahNameArabic: surahMeta.nameArabic,
            surahNameTransliterated: surahMeta.nameTransliterated,
            surahNameMeaning: surahMeta.meaning[language] || surahMeta.meaning.en,
            verseNumber: String(ayahNum),
            juz: surahMeta.juzStart,
            revelationType: surahMeta.revelationType,
            revelationContext: fixtureMatch?.revelationContext || '',
            arabicText: ayahRow.text_uthmani,
            transliteration: fixtureMatch?.transliteration || '',
            translations: translationsMap,
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
            tafsirCitations: combinedCitations,
            reflectionFramework: fixtureMatch?.reflectionFramework || {
              understand: '',
              reflectPrompt: '',
              applyAction: '',
            },
            surroundingVerses: fixtureMatch?.surroundingVerses,
          };

          return NextResponse.json({
            verse: builtVerse,
            surahMeta,
            ayahNumber: ayahNum,
            totalAyahs: surahMeta.ayahCount,
          });
        }
      }
    } catch (err) {
      console.warn('[api/quran/ayah] Supabase lookup fallback:', err);
    }
  }

  // 3. If fixtureMatch exists directly, return it
  if (fixtureMatch) {
    return NextResponse.json({
      verse: fixtureMatch,
      surahMeta,
      ayahNumber: ayahNum,
      totalAyahs: surahMeta.ayahCount,
    });
  }

  // 4. Verified AlQuran Cloud canonical editions fallback for any of the 6,236 ayahs
  try {
    const editionMap: Record<Language, { edition: string; translator: string }> = {
      en: { edition: 'en.sahih', translator: 'Sahih International' },
      sv: { edition: 'sv.bernstrom', translator: 'Mohammed Knut Bernström' },
      fr: { edition: 'fr.hamidullah', translator: 'Muhammad Hamidullah' },
      ar: { edition: 'ar.muyassar', translator: 'التفسير الميسر' },
    };
    const targetEdition = editionMap[language] || editionMap.en;
    const editionsUrl = `https://api.alquran.cloud/v1/ayah/${surahNum}:${ayahNum}/editions/quran-uthmani,en.sahih,sv.bernstrom,fr.hamidullah,ar.muyassar`;

    const res = await fetch(editionsUrl, { headers: { Accept: 'application/json' } });
    if (res.ok) {
      const payload = (await res.json()) as {
        data?: Array<{
          text: string;
          juz?: number;
          page?: number;
          hizbQuarter?: number;
          edition?: { identifier: string; language: string; englishName: string };
        }>;
      };
      const items = payload.data || [];
      const uthmaniItem = items.find((i) => i.edition?.identifier === 'quran-uthmani') || items[0];
      const enItem = items.find((i) => i.edition?.identifier === 'en.sahih');
      const svItem = items.find((i) => i.edition?.identifier === 'sv.bernstrom');
      const frItem = items.find((i) => i.edition?.identifier === 'fr.hamidullah');
      const arMuyassarItem = items.find((i) => i.edition?.identifier === 'ar.muyassar');

      const paddedSurah = String(surahNum).padStart(3, '0');
      const paddedAyah = String(ayahNum).padStart(3, '0');

      const tafsirCitations: TafsirCitation[] = [];
      if (arMuyassarItem?.text) {
        tafsirCitations.push({
          scholar: 'Al-Muyassar',
          century: 'Contemporary',
          sourceBook: 'Al-Tafsir Al-Muyassar (King Fahd Complex)',
          text: arMuyassarItem.text,
          languageCode: 'ar',
          sourceType: 'classical_book',
          sourceReference: `Al-Tafsir Al-Muyassar, Surah ${surahNum}:${ayahNum}`,
          originalArabicRaw: arMuyassarItem.text,
          verificationStatus: 'verified_canonical',
        });
      }

      const builtVerse: QuranVerseFixture = {
        id: exactId,
        surahNumber: surahNum,
        surahNameArabic: surahMeta.nameArabic,
        surahNameTransliterated: surahMeta.nameTransliterated,
        surahNameMeaning: surahMeta.meaning[language] || surahMeta.meaning.en,
        verseNumber: String(ayahNum),
        juz: uthmaniItem?.juz || surahMeta.juzStart,
        revelationType: surahMeta.revelationType,
        revelationContext: '',
        arabicText: uthmaniItem?.text || '',
        transliteration: '',
        translations: {
          en: {
            text: enItem?.text || '',
            translator: editionMap.en.translator,
          },
          sv: {
            text: svItem?.text || '',
            translator: editionMap.sv.translator,
          },
          fr: {
            text: frItem?.text || '',
            translator: editionMap.fr.translator,
          },
          ...(arMuyassarItem?.text
            ? {
                ar: {
                  text: arMuyassarItem.text,
                  translator: editionMap.ar.translator,
                },
              }
            : {}),
        },
        audioUrl: `https://everyayah.com/data/Alafasy_128kbps/${paddedSurah}${paddedAyah}.mp3`,
        category: 'moment',
        topics: [surahMeta.nameTransliterated],
        emotions: [],
        situations: [],
        whyThisVerse: {
          emotion: '',
          situation: '',
          coreNeed: '',
          spiritualPrinciple: '',
          mappingExplanation: '',
          topics: [],
        },
        tafsirCitations,
        reflectionFramework: {
          understand: '',
          reflectPrompt: '',
          applyAction: '',
        },
      };

      return NextResponse.json({
        verse: builtVerse,
        surahMeta,
        ayahNumber: ayahNum,
        totalAyahs: surahMeta.ayahCount,
        juz: uthmaniItem?.juz || surahMeta.juzStart,
        page: uthmaniItem?.page,
        hizbQuarter: uthmaniItem?.hizbQuarter,
      });
    }
  } catch (err) {
    console.warn('[api/quran/ayah] AlQuran Cloud fallback error:', err);
  }

  return NextResponse.json(
    { error: 'Unable to load requested verse', surah: surahNum, ayah: ayahNum },
    { status: 404 }
  );
}
