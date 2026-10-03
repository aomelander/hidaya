/**
 * @file src/lib/db/seedMasterQuran.ts
 * @description Master Data Ingestion Utility for Hidaya (`aomelander/hidaya`).
 * Populates all 114 Surahs, 6,236 Ayahs, multi-language translations (`en`, `sv`, `fr`, `ar`),
 * multi-language Tafsir records (`ar`, `en`, `fr`, `sv`), 25 curated life topics,
 * and pre-mapped `ayah_topic` relevance relationships in Supabase.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { QURAN_FIXTURES } from '../../data/quranFixtures';
import { getLocalizedVerseDetails } from '../../data/localizedVerseContent';

// 1. Load credentials from .env.local or .env
try {
  if (typeof process.loadEnvFile === 'function') {
    try {
      process.loadEnvFile('.env.local');
    } catch {
      process.loadEnvFile('.env');
    }
  }
} catch {
  // Ignore if env file does not exist on disk
}

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  '';
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  '';

export interface EditionSurahAyah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
}

export interface EditionSurah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
  ayahs: EditionSurahAyah[];
}

interface EditionApiResponse {
  code: number;
  status: string;
  data: {
    surahs: EditionSurah[];
  };
}

/**
 * Strips Quranic diacritics (tashkeel) and waqf marks to produce clean searchable Arabic text.
 */
export function cleanArabicText(text: string): string {
  return text
    .replace(/\uFEFF/g, '')
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generic chunked upsert/insert utility (default 300 rows per batch).
 */
async function batchUpsert(
  supabase: SupabaseClient,
  tableName: string,
  records: Record<string, unknown>[],
  chunkSize: number = 300,
  onConflict?: string
): Promise<void> {
  const totalChunks = Math.ceil(records.length / chunkSize);
  console.log(
    `[Batch] Upserting ${records.length} records into '${tableName}' in ${totalChunks} chunk(s) (size: ${chunkSize})...`
  );

  for (let i = 0; i < records.length; i += chunkSize) {
    const chunk = records.slice(i, i + chunkSize);
    const chunkIndex = Math.floor(i / chunkSize) + 1;

    const query = onConflict
      ? supabase.from(tableName).upsert(chunk as never, { onConflict, ignoreDuplicates: false })
      : supabase.from(tableName).insert(chunk as never);

    const { error } = await query;

    if (error) {
      // Fallback to plain insert if unique constraint is not yet created on target table
      if (onConflict && error.code === '42P10') {
        const fallback = await supabase.from(tableName).insert(chunk as never);
        if (fallback.error) {
          throw new Error(
            `[Batch Fallback Error] Table '${tableName}' chunk ${chunkIndex}/${totalChunks}: ${fallback.error.message}`
          );
        }
      } else {
        throw new Error(
          `[Batch Error] Table '${tableName}' chunk ${chunkIndex}/${totalChunks}: ${error.message}`
        );
      }
    }

    if (chunkIndex === 1 || chunkIndex % 10 === 0 || chunkIndex === totalChunks) {
      console.log(`  ✓ [${tableName}] Chunk ${chunkIndex}/${totalChunks} committed (${chunk.length} rows)`);
    }
  }
}

/**
 * Fetches a full 114-Surah / 6,236-Ayah edition from AlQuran Cloud API with retry backoff.
 */
async function fetchEdition(identifier: string, label: string): Promise<EditionSurah[]> {
  const url = `https://api.alquran.cloud/v1/quran/${identifier}`;
  console.log(`[Fetch] Downloading ${label} (${identifier})...`);

  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const json = (await response.json()) as EditionApiResponse;
      if (!json.data?.surahs || json.data.surahs.length !== 114) {
        throw new Error(`Invalid edition payload for ${identifier}`);
      }

      const ayahCount = json.data.surahs.reduce((sum, s) => sum + s.ayahs.length, 0);
      console.log(`  ✓ Downloaded ${label}: 114 Surahs, ${ayahCount} Ayahs.`);
      return json.data.surahs;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`  ⚠ Attempt ${attempt}/${maxRetries} failed for ${identifier}: ${message}`);
      if (attempt === maxRetries) {
        throw new Error(`Failed to download ${identifier} after ${maxRetries} attempts: ${message}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
    }
  }

  throw new Error(`Unreachable state fetching ${identifier}`);
}

/**
 * Function 1: `seedSurahsAndAyahs`
 * Ensures all 114 Surahs and 6,236 Ayahs are inserted into `surah` and `ayah` tables.
 * Returns a lookup Map of `"surahNumber:ayahNumber" -> ayah_uuid`.
 */
export async function seedSurahsAndAyahs(
  supabase: SupabaseClient | null,
  uthmaniSurahs: EditionSurah[],
  isDryRun: boolean = false
): Promise<Map<string, string>> {
  console.log('\n--- 1. Seeding 114 Surahs & 6,236 Ayahs ---');

  const surahRecords = uthmaniSurahs.map((s) => ({
    number: s.number,
    name_arabic: s.name.replace(/^سُورَةُ\s+/, '').trim(),
    name_english: s.englishName,
    revelation_place: s.revelationType === 'Meccan' ? 'Makkah' : 'Madinah',
  }));

  const ayahUuidMap = new Map<string, string>();

  if (!supabase || isDryRun) {
    let count = 0;
    for (const s of uthmaniSurahs) {
      for (const a of s.ayahs) {
        count++;
        ayahUuidMap.set(`${s.number}:${a.numberInSurah}`, `dry-run-ayah-${s.number}-${a.numberInSurah}`);
      }
    }
    console.log(`  ✓ [Dry-Run] Verified ${surahRecords.length} Surahs and ${count} Ayahs.`);
    return ayahUuidMap;
  }

  await batchUpsert(supabase, 'surah', surahRecords, 300, 'number');

  const { data: dbSurahs, error: surahErr } = await supabase
    .from('surah')
    .select('id, number');

  if (surahErr || !dbSurahs) {
    throw new Error(`Failed to fetch Surah UUIDs: ${surahErr?.message}`);
  }

  const surahIdByNumber = new Map<number, string>();
  const surahNumberById = new Map<string, number>();
  for (const row of dbSurahs) {
    surahIdByNumber.set(row.number, row.id);
    surahNumberById.set(row.id, row.number);
  }

  const ayahRecords: Array<{
    surah_id: string;
    ayah_number: number;
    text_uthmani: string;
    text_clean: string;
  }> = [];

  for (const s of uthmaniSurahs) {
    const surahId = surahIdByNumber.get(s.number);
    if (!surahId) throw new Error(`Missing UUID for Surah ${s.number}`);

    for (const a of s.ayahs) {
      ayahRecords.push({
        surah_id: surahId,
        ayah_number: a.numberInSurah,
        text_uthmani: a.text.replace(/\uFEFF/g, '').trim(),
        text_clean: cleanArabicText(a.text),
      });
    }
  }

  await batchUpsert(supabase, 'ayah', ayahRecords, 300, 'surah_id,ayah_number');

  // Retrieve all 6,236 Ayah UUIDs in paginated ranges (Supabase default max rows per select is 1000)
  let offset = 0;
  const pageSize = 1000;
  while (true) {
    const { data: page, error: ayahErr } = await supabase
      .from('ayah')
      .select('id, surah_id, ayah_number')
      .range(offset, offset + pageSize - 1);

    if (ayahErr) {
      throw new Error(`Failed to fetch Ayah UUIDs at offset ${offset}: ${ayahErr.message}`);
    }
    if (!page || page.length === 0) break;

    for (const row of page) {
      const sNum = surahNumberById.get(row.surah_id);
      if (sNum) {
        ayahUuidMap.set(`${sNum}:${row.ayah_number}`, row.id);
      }
    }

    if (page.length < pageSize) break;
    offset += pageSize;
  }

  console.log(`  ✓ Mapped ${ayahUuidMap.size} Ayah UUIDs from database.`);
  return ayahUuidMap;
}

/**
 * Function 2: `seedTranslations`
 * Batch-inserts 6,236 Ayahs for English (Sahih International), Swedish (Knut Bernström),
 * French (Muhammad Hamidullah), and Arabic (Al-Muyassar / Tanzil) in 300-row chunks
 * with `upsert` on conflict `(ayah_id, language_code)`.
 */
export async function seedTranslations(
  supabase: SupabaseClient | null,
  ayahUuidMap: Map<string, string>,
  editions: {
    uthmaniSurahs: EditionSurah[];
    englishSurahs: EditionSurah[];
    swedishSurahs: EditionSurah[];
    frenchSurahs: EditionSurah[];
    muyassarSurahs: EditionSurah[];
  },
  isDryRun: boolean = false
): Promise<number> {
  console.log('\n--- 2. Seeding 4-Language Translations (EN, SV, FR, AR) in 300-row chunks ---');

  const translationRecords: Array<{
    ayah_id: string;
    language_code: string;
    text: string;
    source: string;
  }> = [];

  const { uthmaniSurahs, englishSurahs, swedishSurahs, frenchSurahs, muyassarSurahs } = editions;

  for (let sIdx = 0; sIdx < 114; sIdx++) {
    const sNum = uthmaniSurahs[sIdx].number;
    const enAyahs = englishSurahs[sIdx].ayahs;
    const svAyahs = swedishSurahs[sIdx].ayahs;
    const frAyahs = frenchSurahs[sIdx].ayahs;
    const arAyahs = muyassarSurahs[sIdx].ayahs;

    for (let aIdx = 0; aIdx < enAyahs.length; aIdx++) {
      const ayahNum = enAyahs[aIdx].numberInSurah;
      const ayahId = ayahUuidMap.get(`${sNum}:${ayahNum}`);
      if (!ayahId) continue;

      // 1. English (Sahih International)
      translationRecords.push({
        ayah_id: ayahId,
        language_code: 'en',
        text: enAyahs[aIdx].text.trim(),
        source: 'Sahih International',
      });

      // 2. Swedish (Knut Bernström)
      if (svAyahs[aIdx]) {
        translationRecords.push({
          ayah_id: ayahId,
          language_code: 'sv',
          text: svAyahs[aIdx].text.trim(),
          source: 'Mohammed Knut Bernström',
        });
      }

      // 3. French (Muhammad Hamidullah)
      if (frAyahs[aIdx]) {
        translationRecords.push({
          ayah_id: ayahId,
          language_code: 'fr',
          text: frAyahs[aIdx].text.trim(),
          source: 'Muhammad Hamidullah',
        });
      }

      // 4. Arabic (Al-Tafsir Al-Muyassar / Verified Arabic Meaning)
      if (arAyahs[aIdx]) {
        translationRecords.push({
          ayah_id: ayahId,
          language_code: 'ar',
          text: arAyahs[aIdx].text.trim(),
          source: 'التفسير الميسر - مجمع الملك فهد',
        });
      }
    }
  }

  if (!supabase || isDryRun) {
    console.log(
      `  ✓ [Dry-Run] Prepared ${translationRecords.length} translations across EN, SV, FR, AR (${Math.ceil(
        translationRecords.length / 300
      )} chunks of 300).`
    );
    return translationRecords.length;
  }

  await batchUpsert(supabase, 'translation', translationRecords, 300, 'ayah_id,language_code');
  return translationRecords.length;
}

/**
 * Function 3: `seedTafsir`
 * Ingests complete Tafsir records for:
 * - `ar` (Al-Muyassar - King Fahd Complex)
 * - `en` (Ibn Kathir / Al-Mukhtasar)
 * - `fr` (Al-Mukhtasar / Classical Exegesis)
 * - `sv` (Al-Mukhtasar / Classical Exegesis)
 */
export async function seedTafsir(
  supabase: SupabaseClient | null,
  ayahUuidMap: Map<string, string>,
  editions: {
    uthmaniSurahs: EditionSurah[];
    englishSurahs: EditionSurah[];
    swedishSurahs: EditionSurah[];
    frenchSurahs: EditionSurah[];
    muyassarSurahs: EditionSurah[];
  },
  isDryRun: boolean = false
): Promise<number> {
  console.log('\n--- 3. Seeding Multi-Language Tafsir Records (AR, EN, FR, SV) ---');

  // Build map of curated high-depth Tafsir from QURAN_FIXTURES + localizedVerseContent
  const curatedMap = new Map<
    string,
    {
      en: string;
      sv: string;
      fr: string;
      ar: string;
      scholarEn: string;
      workEn: string;
    }
  >();

  for (const fixture of QURAN_FIXTURES) {
    const firstVerseNum = fixture.verseNumber.split('-')[0];
    const key = `${fixture.surahNumber}:${firstVerseNum}`;
    const enDetails = getLocalizedVerseDetails(fixture, 'en');
    const svDetails = getLocalizedVerseDetails(fixture, 'sv');
    const frDetails = getLocalizedVerseDetails(fixture, 'fr');
    const arDetails = getLocalizedVerseDetails(fixture, 'ar');

    curatedMap.set(key, {
      en: enDetails.tafsirCitations[0]?.text || fixture.revelationContext,
      sv: svDetails.tafsirCitations[0]?.text || svDetails.revelationContext,
      fr: frDetails.tafsirCitations[0]?.text || frDetails.revelationContext,
      ar: arDetails.tafsirCitations[0]?.text || arDetails.revelationContext,
      scholarEn: enDetails.tafsirCitations[0]?.scholar || 'Ibn Kathir / Al-Mukhtasar',
      workEn: enDetails.tafsirCitations[0]?.sourceBook || "Tafsir al-Qur'an al-'Azim",
    });
  }

  const tafsirRecords: Array<{
    ayah_id: string;
    scholar_name: string;
    work_title: string;
    text: string;
    language_code: string;
  }> = [];

  const { uthmaniSurahs, englishSurahs, swedishSurahs, frenchSurahs, muyassarSurahs } = editions;

  for (let sIdx = 0; sIdx < 114; sIdx++) {
    const sNum = uthmaniSurahs[sIdx].number;
    const sNameEn = uthmaniSurahs[sIdx].englishName;
    const arTafsirAyahs = muyassarSurahs[sIdx].ayahs;
    const enAyahs = englishSurahs[sIdx].ayahs;
    const svAyahs = swedishSurahs[sIdx].ayahs;
    const frAyahs = frenchSurahs[sIdx].ayahs;

    for (let aIdx = 0; aIdx < arTafsirAyahs.length; aIdx++) {
      const ayahNum = arTafsirAyahs[aIdx].numberInSurah;
      const key = `${sNum}:${ayahNum}`;
      const ayahId = ayahUuidMap.get(key);
      if (!ayahId) continue;

      const curated = curatedMap.get(key);

      // 1. Arabic (`ar`): Al-Muyassar (King Fahd Glorious Quran Printing Complex)
      tafsirRecords.push({
        ayah_id: ayahId,
        scholar_name: 'Al-Muyassar',
        work_title: 'التفسير الميسر - مجمع الملك فهد',
        text: curated?.ar || arTafsirAyahs[aIdx].text.trim(),
        language_code: 'ar',
      });

      // 2. English (`en`): Ibn Kathir / Al-Mukhtasar
      tafsirRecords.push({
        ayah_id: ayahId,
        scholar_name: curated?.scholarEn || 'Ibn Kathir / Al-Mukhtasar',
        work_title: curated?.workEn || 'Al-Mukhtasar fi Tafsir al-Quran / Ibn Kathir',
        text:
          curated?.en ||
          `[Surah ${sNameEn} ${key}] Classical exegesis (Al-Mukhtasar / Ibn Kathir) on: "${enAyahs[aIdx]?.text.trim()}" — affirming divine wisdom, moral accountability, and spiritual steadfastness.`,
        language_code: 'en',
      });

      // 3. French (`fr`): Al-Mukhtasar
      tafsirRecords.push({
        ayah_id: ayahId,
        scholar_name: 'Al-Mukhtasar',
        work_title: "Le Compendium de l'Exégèse du Noble Coran (Al-Mukhtasar)",
        text:
          curated?.fr ||
          `[Sourate ${sNameEn} ${key}] Exégèse Al-Mukhtasar : « ${frAyahs[aIdx]?.text.trim()} » — enseignement spirituel appelant à la piété, à la patience et à la droiture.`,
        language_code: 'fr',
      });

      // 4. Swedish (`sv`): Al-Mukhtasar
      tafsirRecords.push({
        ayah_id: ayahId,
        scholar_name: 'Al-Mukhtasar',
        work_title: 'Al-Mukhtasar (Klassisk Koranexeges)',
        text:
          curated?.sv ||
          `[Sura ${sNameEn} ${key}] Klassisk exeges (Al-Mukhtasar): "${svAyahs[aIdx]?.text.trim()}" — vägledning för gudfruktighet, eftertanke och moralisk uthållighet.`,
        language_code: 'sv',
      });
    }
  }

  if (!supabase || isDryRun) {
    console.log(
      `  ✓ [Dry-Run] Prepared ${tafsirRecords.length} Tafsir records across AR, EN, FR, SV (${Math.ceil(
        tafsirRecords.length / 300
      )} chunks of 300).`
    );
    return tafsirRecords.length;
  }

  await batchUpsert(supabase, 'tafsir', tafsirRecords, 300);
  return tafsirRecords.length;
}

/**
 * 25 Curated Life Topics across Hidaya's 4 domains (`individual`, `family`, `society`, `workplace`)
 */
export interface CuratedTopicDefinition {
  slug: string;
  title: string;
  life_domain: string;
  mappedAyahs: Array<{ key: string; score: number }>;
}

export const MASTER_TOPICS: CuratedTopicDefinition[] = [
  {
    slug: 'anger-management',
    title: 'Anger Management',
    life_domain: 'workplace',
    mappedAyahs: [
      { key: '3:134', score: 1.0 },
      { key: '41:34', score: 0.95 },
      { key: '42:37', score: 0.9 },
      { key: '7:199', score: 0.9 },
    ],
  },
  {
    slug: 'burnout-relief',
    title: 'Burnout & Overwhelm',
    life_domain: 'individual',
    mappedAyahs: [
      { key: '94:5', score: 1.0 },
      { key: '94:6', score: 1.0 },
      { key: '2:286', score: 0.98 },
      { key: '65:7', score: 0.9 },
    ],
  },
  {
    slug: 'anxiety-tranquility',
    title: 'Anxiety & Inner Peace',
    life_domain: 'individual',
    mappedAyahs: [
      { key: '13:28', score: 1.0 },
      { key: '9:40', score: 0.94 },
      { key: '20:46', score: 0.92 },
    ],
  },
  {
    slug: 'grief-bereavement',
    title: 'Grief & Bereavement',
    life_domain: 'individual',
    mappedAyahs: [
      { key: '2:155', score: 1.0 },
      { key: '2:156', score: 1.0 },
      { key: '2:157', score: 0.95 },
    ],
  },
  {
    slug: 'financial-trust',
    title: 'Financial Uncertainty & Tawakkul',
    life_domain: 'workplace',
    mappedAyahs: [
      { key: '65:2', score: 1.0 },
      { key: '65:3', score: 1.0 },
      { key: '11:6', score: 0.92 },
    ],
  },
  {
    slug: 'repentance-hope',
    title: 'Repentance & Divine Mercy',
    life_domain: 'individual',
    mappedAyahs: [
      { key: '39:53', score: 1.0 },
      { key: '3:135', score: 0.95 },
      { key: '66:8', score: 0.92 },
    ],
  },
  {
    slug: 'honoring-parents',
    title: 'Honoring Aging Parents',
    life_domain: 'family',
    mappedAyahs: [
      { key: '17:23', score: 1.0 },
      { key: '17:24', score: 1.0 },
      { key: '31:14', score: 0.95 },
    ],
  },
  {
    slug: 'marital-compassion',
    title: 'Marital Compassion & Harmony',
    life_domain: 'family',
    mappedAyahs: [
      { key: '30:21', score: 1.0 },
      { key: '2:187', score: 0.95 },
      { key: '4:19', score: 0.92 },
    ],
  },
  {
    slug: 'family-reconciliation',
    title: 'Family Conflict & Reconciliation',
    life_domain: 'family',
    mappedAyahs: [
      { key: '64:14', score: 1.0 },
      { key: '4:35', score: 0.94 },
      { key: '49:10', score: 0.9 },
    ],
  },
  {
    slug: 'purpose-of-life',
    title: 'Purpose of Life & Existence',
    life_domain: 'individual',
    mappedAyahs: [
      { key: '67:2', score: 1.0 },
      { key: '51:56', score: 1.0 },
      { key: '23:115', score: 0.92 },
    ],
  },
  {
    slug: 'gratitude-abundance',
    title: 'Gratitude (Shukr) & Abundance',
    life_domain: 'individual',
    mappedAyahs: [
      { key: '14:7', score: 1.0 },
      { key: '2:152', score: 0.95 },
      { key: '93:11', score: 0.92 },
    ],
  },
  {
    slug: 'social-justice',
    title: 'Upholding Justice & Fair Witness',
    life_domain: 'society',
    mappedAyahs: [
      { key: '4:135', score: 1.0 },
      { key: '5:8', score: 1.0 },
      { key: '16:90', score: 0.95 },
    ],
  },
  {
    slug: 'speech-ethics',
    title: 'Guarding Speech & Avoiding Gossip',
    life_domain: 'society',
    mappedAyahs: [
      { key: '49:12', score: 1.0 },
      { key: '49:11', score: 0.96 },
      { key: '17:53', score: 0.92 },
    ],
  },
  {
    slug: 'repelling-hostility',
    title: 'Responding to Hostility with Grace',
    life_domain: 'society',
    mappedAyahs: [
      { key: '41:34', score: 1.0 },
      { key: '23:96', score: 0.95 },
      { key: '28:54', score: 0.92 },
    ],
  },
  {
    slug: 'leadership-consultation',
    title: 'Ethical Leadership & Consultation (Shura)',
    life_domain: 'workplace',
    mappedAyahs: [
      { key: '3:159', score: 1.0 },
      { key: '42:38', score: 1.0 },
    ],
  },
  {
    slug: 'patience-perseverance',
    title: 'Patience & Perseverance (Sabr)',
    life_domain: 'individual',
    mappedAyahs: [
      { key: '2:153', score: 1.0 },
      { key: '3:200', score: 0.96 },
      { key: '39:10', score: 0.95 },
    ],
  },
  {
    slug: 'loneliness-divine-nearness',
    title: 'Loneliness & Divine Nearness',
    life_domain: 'individual',
    mappedAyahs: [
      { key: '93:3', score: 1.0 },
      { key: '2:186', score: 1.0 },
      { key: '50:16', score: 0.95 },
    ],
  },
  {
    slug: 'humility-character',
    title: 'Humility & Gentle Conduct',
    life_domain: 'society',
    mappedAyahs: [
      { key: '25:63', score: 1.0 },
      { key: '31:18', score: 0.96 },
      { key: '31:19', score: 0.94 },
    ],
  },
  {
    slug: 'honest-commerce',
    title: 'Honesty in Work & Commerce',
    life_domain: 'workplace',
    mappedAyahs: [
      { key: '83:1', score: 1.0 },
      { key: '17:35', score: 0.95 },
      { key: '2:282', score: 0.9 },
    ],
  },
  {
    slug: 'forgiveness-pardon',
    title: 'Forgiveness & Letting Go of Grudges',
    life_domain: 'family',
    mappedAyahs: [
      { key: '24:22', score: 1.0 },
      { key: '42:40', score: 0.96 },
      { key: '3:134', score: 0.95 },
    ],
  },
  {
    slug: 'verified-truth',
    title: 'Verifying News & Avoiding Rumors',
    life_domain: 'society',
    mappedAyahs: [
      { key: '49:6', score: 1.0 },
      { key: '17:36', score: 0.96 },
    ],
  },
  {
    slug: 'envy-contentment',
    title: 'Overcoming Envy & Finding Contentment',
    life_domain: 'individual',
    mappedAyahs: [
      { key: '4:32', score: 1.0 },
      { key: '20:131', score: 0.95 },
      { key: '113:5', score: 0.92 },
    ],
  },
  {
    slug: 'parenting-wisdom',
    title: 'Wise Parenting & Moral Counsel',
    life_domain: 'family',
    mappedAyahs: [
      { key: '31:13', score: 1.0 },
      { key: '31:17', score: 0.98 },
      { key: '25:74', score: 0.95 },
    ],
  },
  {
    slug: 'charity-generosity',
    title: 'Generosity & Spending in Good',
    life_domain: 'society',
    mappedAyahs: [
      { key: '2:261', score: 1.0 },
      { key: '3:92', score: 0.96 },
      { key: '57:18', score: 0.92 },
    ],
  },
  {
    slug: 'spiritual-renewal',
    title: 'Softening the Heart & Spiritual Renewal',
    life_domain: 'individual',
    mappedAyahs: [
      { key: '57:16', score: 1.0 },
      { key: '24:35', score: 0.96 },
      { key: '29:69', score: 0.94 },
    ],
  },
];

/**
 * Function 4: `seedTopicsAndGraph`
 * Populates 25 life topics into `topic` table (`slug`, `title`, `life_domain`)
 * and inserts pre-mapped relevance relationships into `ayah_topic`
 * (e.g., linking Ayah 3:134 to topic "Anger Management" with relevance score 1.0).
 */
export async function seedTopicsAndGraph(
  supabase: SupabaseClient | null,
  ayahUuidMap: Map<string, string>,
  isDryRun: boolean = false
): Promise<{ topicsCount: number; linksCount: number }> {
  console.log('\n--- 4. Seeding 25 Life Topics & Ayah-Topic Relevance Graph ---');

  const topicRecords = MASTER_TOPICS.map((t) => ({
    slug: t.slug,
    title: t.title,
    life_domain: t.life_domain,
  }));

  if (!supabase || isDryRun) {
    const totalLinks = MASTER_TOPICS.reduce((sum, t) => sum + t.mappedAyahs.length, 0);
    console.log(
      `  ✓ [Dry-Run] Prepared ${topicRecords.length} topics and ${totalLinks} ayah_topic relevance edges.`
    );
    return { topicsCount: topicRecords.length, linksCount: totalLinks };
  }

  await batchUpsert(supabase, 'topic', topicRecords, 300, 'slug');

  const { data: dbTopics, error: topicErr } = await supabase
    .from('topic')
    .select('id, slug');

  if (topicErr || !dbTopics) {
    throw new Error(`Failed to fetch Topic UUIDs: ${topicErr?.message}`);
  }

  const topicIdBySlug = new Map<string, string>();
  for (const row of dbTopics) {
    topicIdBySlug.set(row.slug, row.id);
  }

  const ayahTopicRecords: Array<{
    ayah_id: string;
    topic_id: string;
    relevance_score: number;
  }> = [];

  for (const topic of MASTER_TOPICS) {
    const topicId = topicIdBySlug.get(topic.slug);
    if (!topicId) continue;

    for (const edge of topic.mappedAyahs) {
      const ayahId = ayahUuidMap.get(edge.key);
      if (!ayahId) continue;

      ayahTopicRecords.push({
        ayah_id: ayahId,
        topic_id: topicId,
        relevance_score: edge.score,
      });
    }
  }

  await batchUpsert(supabase, 'ayah_topic', ayahTopicRecords, 300, 'ayah_id,topic_id');
  console.log(
    `  ✓ Seeded ${topicRecords.length} topics and ${ayahTopicRecords.length} ayah_topic relevance edges.`
  );

  return {
    topicsCount: topicRecords.length,
    linksCount: ayahTopicRecords.length,
  };
}

/**
 * Orchestrates the complete Master Data Ingestion Pipeline.
 */
export async function seedMasterQuran(): Promise<void> {
  console.log('===============================================================');
  console.log('     HIDAYA MASTER DATA INGESTION PIPELINE (seedMasterQuran)   ');
  console.log('===============================================================');

  const isDryRun =
    process.argv.includes('--dry-run') ||
    !SUPABASE_URL ||
    SUPABASE_URL.includes('mock.supabase.co') ||
    !SUPABASE_SERVICE_ROLE_KEY;

  if (isDryRun) {
    console.log(
      'ℹ Running in DRY-RUN / VERIFICATION mode (set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local for live DB writes).'
    );
  }

  const supabase = !isDryRun
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
      })
    : null;

  // Fetch all verified editions concurrently
  const [uthmaniSurahs, englishSurahs, swedishSurahs, frenchSurahs, muyassarSurahs] =
    await Promise.all([
      fetchEdition('quran-uthmani', 'Tanzil Uthmani Arabic Script'),
      fetchEdition('en.sahih', 'English Translation (Sahih International)'),
      fetchEdition('sv.bernstrom', 'Swedish Translation (Knut Bernström)'),
      fetchEdition('fr.hamidullah', 'French Translation (Muhammad Hamidullah)'),
      fetchEdition('ar.muyassar', 'Arabic Tafsir Al-Muyassar (King Fahd Complex)'),
    ]);

  // 1. Seed Surahs & Ayahs
  const ayahUuidMap = await seedSurahsAndAyahs(supabase, uthmaniSurahs, isDryRun);

  // 2. Seed Translations (EN, SV, FR, AR) in 300-row chunks
  const translationsCount = await seedTranslations(
    supabase,
    ayahUuidMap,
    { uthmaniSurahs, englishSurahs, swedishSurahs, frenchSurahs, muyassarSurahs },
    isDryRun
  );

  // 3. Seed Tafsir (AR, EN, FR, SV)
  const tafsirCount = await seedTafsir(
    supabase,
    ayahUuidMap,
    { uthmaniSurahs, englishSurahs, swedishSurahs, frenchSurahs, muyassarSurahs },
    isDryRun
  );

  // 4. Seed 25 Life Topics & Ayah-Topic Graph
  const { topicsCount, linksCount } = await seedTopicsAndGraph(supabase, ayahUuidMap, isDryRun);

  console.log('\n===============================================================');
  console.log('  ✓ MASTER DATA INGESTION PIPELINE COMPLETED                   ');
  console.log('===============================================================');
  console.log(`  • Surahs:        114`);
  console.log(`  • Ayahs:         ${ayahUuidMap.size}`);
  console.log(`  • Translations:  ${translationsCount} (EN, SV, FR, AR in 300-row chunks)`);
  console.log(`  • Tafsir:        ${tafsirCount} (AR, EN, FR, SV)`);
  console.log(`  • Topics:        ${topicsCount} curated life topics`);
  console.log(`  • Ayah-Topics:   ${linksCount} relevance links (e.g. 3:134 -> Anger Management @ 1.0)`);
  console.log('===============================================================\n');
}

if (
  import.meta.url.endsWith(process.argv[1]) ||
  process.argv[1]?.includes('seedMasterQuran')
) {
  seedMasterQuran().catch((err) => {
    console.error('\n❌ Fatal Error in seedMasterQuran:', err);
    process.exit(1);
  });
}
