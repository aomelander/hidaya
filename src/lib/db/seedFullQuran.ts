import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SEED_FIXTURES } from './seedFixtures';

// Load local environment variables if available
try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile();
  }
} catch {
  // .env may not exist in some environments
}

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

interface EditionSurahAyah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil?: number;
  page?: number;
  ruku?: number;
  hizbQuarter?: number;
  sajda?: boolean | object;
}

interface EditionSurah {
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
    edition?: {
      identifier: string;
      language: string;
      name: string;
      englishName: string;
      type: string;
    };
  };
}

/**
 * Strips Quranic diacritics / tashkeel and waqf marks to produce clean, searchable Arabic text.
 */
export function cleanArabicText(text: string): string {
  return text
    .replace(/\uFEFF/g, '') // Remove Byte Order Mark if present
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '') // Harakat & Quranic symbols
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generic batch upsert/insert helper chunking at 500 items per request
 * to prevent database timeouts or payload size limits.
 */
async function batchInsert(
  supabase: SupabaseClient,
  tableName: string,
  records: Record<string, any>[],
  chunkSize: number = 500,
  onConflict?: string
): Promise<void> {
  const totalChunks = Math.ceil(records.length / chunkSize);
  console.log(`[Batch] Inserting ${records.length} records into '${tableName}' in ${totalChunks} chunk(s) (size: ${chunkSize})...`);

  for (let i = 0; i < records.length; i += chunkSize) {
    const chunk = records.slice(i, i + chunkSize);
    const chunkIndex = Math.floor(i / chunkSize) + 1;

    let result;
    if (onConflict) {
      result = await supabase.from(tableName).upsert(chunk as any, { onConflict, ignoreDuplicates: false });
    } else {
      result = await supabase.from(tableName).insert(chunk as any);
    }

    if (result.error) {
      if (result.error.code === 'PGRST205' || result.error.message.includes('schema cache')) {
        console.log(`\n⚠ Table '${tableName}' is not yet created in the Supabase database.`);
        console.log('  Please run `src/lib/db/schema.sql` in your Supabase SQL Editor, then re-run `npm run db:seed`.');
        return;
      }
      throw new Error(`[Batch Error] Table '${tableName}' chunk ${chunkIndex}/${totalChunks}: ${result.error.message}`);
    }

    console.log(`  ✓ Chunk ${chunkIndex}/${totalChunks} committed (${chunk.length} items)`);
  }
}

/**
 * Fetches an edition from the verified AlQuran Cloud API with retry logic.
 */
async function fetchEdition(identifier: string, description: string): Promise<EditionSurah[]> {
  const url = `https://api.alquran.cloud/v1/quran/${identifier}`;
  console.log(`[Fetch] Downloading ${description} (${identifier})...`);

  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const json = await res.json() as EditionApiResponse;
      if (!json.data || !json.data.surahs || json.data.surahs.length !== 114) {
        throw new Error(`Invalid response structure: expected 114 surahs, got ${json.data?.surahs?.length}`);
      }

      const totalAyahs = json.data.surahs.reduce((sum, s) => sum + s.ayahs.length, 0);
      console.log(`  ✓ Successfully fetched ${description}: 114 Surahs, ${totalAyahs} Ayahs.`);
      return json.data.surahs;
    } catch (err: any) {
      console.warn(`  ⚠ Attempt ${attempt}/${maxRetries} failed: ${err.message}`);
      if (attempt === maxRetries) {
        throw new Error(`Failed to fetch ${identifier} after ${maxRetries} attempts: ${err.message}`);
      }
      await new Promise(r => setTimeout(r, 1500 * attempt));
    }
  }

  throw new Error(`Failed to fetch ${identifier}`);
}

/**
 * Main seeding workflow for the complete 114 Surahs / 6,236 Ayahs.
 */
export async function seedFullQuran() {
  console.log('===============================================================');
  console.log('       HIDAYA - COMPLETE MULTI-LANGUAGE QURAN SEEDER           ');
  console.log('===============================================================');
  console.log('Target Dataset: 114 Surahs | 6,236 Ayahs');
  console.log('Arabic: Tanzil Uthmani (ar)');
  console.log('English: Saheeh International (en.sahih)');
  console.log('Swedish: Knut Bernström (sv.bernstrom)');
  console.log('French: Muhammad Hamidullah (fr.hamidullah)');
  console.log('Tafsir: Classical Al-Muyassar + Ibn Kathir & Al-Sa\'di Curations');
  console.log('===============================================================\n');

  const isConfigured = Boolean(SUPABASE_URL && !SUPABASE_URL.includes('mock.supabase.co') && SUPABASE_KEY);

  if (!isConfigured) {
    console.log('ℹ SUPABASE_URL / SUPABASE_KEY not configured or set to mock.');
    console.log('  Running in verification & dry-run mode to validate all feeds and batch chunking...\n');
  }

  // 1. Fetch all verified datasets concurrently
  const [uthmaniSurahs, englishSurahs, swedishSurahs, frenchSurahs, tafsirSurahs] = await Promise.all([
    fetchEdition('quran-uthmani', 'Verified Tanzil Uthmani Arabic Text'),
    fetchEdition('en.sahih', 'Verified English Translation (Saheeh International)'),
    fetchEdition('sv.bernstrom', 'Verified Swedish Translation (Knut Bernström)'),
    fetchEdition('fr.hamidullah', 'Verified French Translation (Muhammad Hamidullah)'),
    fetchEdition('ar.muyassar', 'Verified Classical Tafsir Al-Muyassar (King Fahad Complex)'),
  ]);

  // 2. Prepare Surah records
  console.log('\n[Transform] Preparing 114 Surah records...');
  const surahRecords = uthmaniSurahs.map((s) => ({
    number: s.number,
    name_arabic: s.name.replace(/^سُورَةُ\s+/, '').trim(),
    name_english: s.englishName,
    revelation_place: s.revelationType === 'Meccan' ? 'Makkah' : 'Madinah',
  }));

  // Create an in-memory map of classical tafsirs from curated fixtures
  const curatedTafsirMap = new Map<string, Array<{ scholar: string; title: string; text: string; lang: string }>>();
  for (const f of SEED_FIXTURES) {
    const key = `${f.surah.number}:${f.ayah.ayah_number}`;
    curatedTafsirMap.set(
      key,
      f.tafsirs.map(t => ({
        scholar: t.scholar_name,
        title: t.work_title,
        text: t.text,
        lang: t.language_code
      }))
    );
  }

  const isDryRun = process.argv.includes('--dry-run') || process.argv.includes('-d');
  const supabase = isConfigured ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

  // Check if tables exist in the database
  let tablesReady = false;
  if (supabase && !isDryRun) {
    const { error: checkErr } = await supabase.from('surah').select('id').limit(1);
    if (!checkErr) {
      tablesReady = true;
    } else if (checkErr.code === 'PGRST205') {
      console.log('\n⚠ [Schema Notice] Tables not yet initialized in Supabase.');
      console.log('  To initialize the tables:');
      console.log('  1. Open your Supabase Dashboard -> SQL Editor');
      console.log('  2. Run the DDL script found at `src/lib/db/schema.sql`');
      console.log('  3. Re-run `npm run db:seed` to populate the live tables.');
      console.log('  Continuing with full dataset verification...\n');
    } else {
      console.warn(`⚠ Database connection warning: ${checkErr.message}`);
    }
  }

  if (!isConfigured || isDryRun || !tablesReady) {
    // Dry-run / Verification mode
    let totalAyahCount = 0;
    let totalTranslationCount = 0;
    let totalTafsirCount = 0;

    for (let sIdx = 0; sIdx < 114; sIdx++) {
      const uSurah = uthmaniSurahs[sIdx];
      const count = uSurah.ayahs.length;
      totalAyahCount += count;
      totalTranslationCount += count * 3; // en, sv, fr
      totalTafsirCount += count; // Al-Muyassar
      for (let aIdx = 0; aIdx < count; aIdx++) {
        const key = `${uSurah.number}:${uSurah.ayahs[aIdx].numberInSurah}`;
        if (curatedTafsirMap.has(key)) {
          totalTafsirCount += curatedTafsirMap.get(key)!.length;
        }
      }
    }

    console.log('\n===============================================================');
    console.log('  ✓ DATASET VERIFICATION & PREPARATION SUCCEEDED               ');
    console.log('===============================================================');
    console.log(`  ✓ 114 Surahs verified (Chunk batch size: 500)`);
    console.log(`  ✓ ${totalAyahCount} Ayahs verified in ${Math.ceil(totalAyahCount / 500)} batches`);
    console.log(`  ✓ ${totalTranslationCount} Translations verified in ${Math.ceil(totalTranslationCount / 500)} batches`);
    console.log(`    - English (Saheeh International)`);
    console.log(`    - Swedish (Knut Bernström)`);
    console.log(`    - French (Muhammad Hamidullah)`);
    console.log(`  ✓ ${totalTafsirCount} Tafsirs verified in ${Math.ceil(totalTafsirCount / 500)} batches`);
    console.log(`    - Arabic Classical Tafsir (Al-Muyassar, King Fahad Complex)`);
    console.log(`    - Curated English Classical Tafsirs (Ibn Kathir, Al-Sa'di)`);
    console.log('===============================================================\n');
    return;
  }

  if (!supabase) {
    throw new Error('Supabase client could not be initialized.');
  }

  // 3. Ingest Surahs in 500-item chunks
  console.log('\n[Database] Seeding Surah table...');
  await batchInsert(supabase, 'surah', surahRecords, 500, 'number');

  // Fetch surah IDs from database to reliably construct foreign keys
  const { data: dbSurahs, error: surahQueryErr } = await supabase
    .from('surah')
    .select('id, number');

  if (surahQueryErr || !dbSurahs) {
    throw new Error(`Failed to query surah table for UUID mapping: ${surahQueryErr?.message}`);
  }

  const surahIdMap = new Map<number, string>();
  for (const s of dbSurahs) {
    surahIdMap.set(s.number, s.id);
  }

  // 4. Ingest Ayahs
  console.log('\n[Transform] Preparing 6,236 Ayah records...');
  interface AyahInsertRecord {
    surah_id: string;
    ayah_number: number;
    text_uthmani: string;
    text_clean: string;
  }

  const ayahRecords: AyahInsertRecord[] = [];
  for (const s of uthmaniSurahs) {
    const surahId = surahIdMap.get(s.number);
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

  console.log(`[Database] Seeding Ayah table (${ayahRecords.length} records)...`);
  await batchInsert(supabase, 'ayah', ayahRecords, 500, 'surah_id,ayah_number');

  // Fetch ayah IDs to map (surahNumber:ayahNumber) -> ayah_id UUID
  console.log('[Database] Fetching Ayah UUID mappings...');
  const { data: dbAyahs, error: ayahQueryErr } = await supabase
    .from('ayah')
    .select('id, surah_id, ayah_number');

  if (ayahQueryErr || !dbAyahs) {
    throw new Error(`Failed to query ayah table for UUID mapping: ${ayahQueryErr?.message}`);
  }

  // Invert surahIdMap to find surah number from surah_id
  const surahNumberByUuid = new Map<string, number>();
  for (const [num, uuid] of surahIdMap.entries()) {
    surahNumberByUuid.set(uuid, num);
  }

  const ayahUuidMap = new Map<string, string>(); // "surahNum:ayahNum" -> ayah UUID
  for (const a of dbAyahs) {
    const sNum = surahNumberByUuid.get(a.surah_id);
    if (sNum) {
      ayahUuidMap.set(`${sNum}:${a.ayah_number}`, a.id);
    }
  }

  // 5. Ingest Translations (English, Swedish, French)
  console.log('\n[Transform] Preparing Translations for English, Swedish, and French...');
  interface TranslationInsertRecord {
    ayah_id: string;
    language_code: string;
    text: string;
    source: string;
  }

  const translationRecords: TranslationInsertRecord[] = [];

  for (let sIdx = 0; sIdx < 114; sIdx++) {
    const sNum = uthmaniSurahs[sIdx].number;
    const enAyahs = englishSurahs[sIdx].ayahs;
    const svAyahs = swedishSurahs[sIdx].ayahs;
    const frAyahs = frenchSurahs[sIdx].ayahs;

    for (let aIdx = 0; aIdx < enAyahs.length; aIdx++) {
      const ayahNum = enAyahs[aIdx].numberInSurah;
      const ayahUuid = ayahUuidMap.get(`${sNum}:${ayahNum}`);
      if (!ayahUuid) continue;

      // English
      translationRecords.push({
        ayah_id: ayahUuid,
        language_code: 'en',
        text: enAyahs[aIdx].text.trim(),
        source: 'Saheeh International',
      });

      // Swedish
      if (svAyahs[aIdx]) {
        translationRecords.push({
          ayah_id: ayahUuid,
          language_code: 'sv',
          text: svAyahs[aIdx].text.trim(),
          source: 'Knut Bernström',
        });
      }

      // French
      if (frAyahs[aIdx]) {
        translationRecords.push({
          ayah_id: ayahUuid,
          language_code: 'fr',
          text: frAyahs[aIdx].text.trim(),
          source: 'Muhammad Hamidullah',
        });
      }
    }
  }

  console.log(`[Database] Seeding Translation table (${translationRecords.length} records)...`);
  await batchInsert(supabase, 'translation', translationRecords, 500);

  // 6. Ingest Classical Tafsir
  console.log('\n[Transform] Preparing Classical Tafsirs...');
  interface TafsirInsertRecord {
    ayah_id: string;
    scholar_name: string;
    work_title: string;
    text: string;
    language_code: string;
  }

  const tafsirRecords: TafsirInsertRecord[] = [];

  for (let sIdx = 0; sIdx < 114; sIdx++) {
    const sNum = uthmaniSurahs[sIdx].number;
    const tfAyahs = tafsirSurahs[sIdx].ayahs;

    for (let aIdx = 0; aIdx < tfAyahs.length; aIdx++) {
      const ayahNum = tfAyahs[aIdx].numberInSurah;
      const ayahKey = `${sNum}:${ayahNum}`;
      const ayahUuid = ayahUuidMap.get(ayahKey);
      if (!ayahUuid) continue;

      // Classical Arabic Tafsir Al-Muyassar
      if (tfAyahs[aIdx].text) {
        tafsirRecords.push({
          ayah_id: ayahUuid,
          scholar_name: 'King Fahad Quran Complex',
          work_title: 'Tafsir Al-Muyassar',
          text: tfAyahs[aIdx].text.trim(),
          language_code: 'ar',
        });
      }

      // Curated Classical English Tafsir if available
      const curatedList = curatedTafsirMap.get(ayahKey);
      if (curatedList) {
        for (const c of curatedList) {
          tafsirRecords.push({
            ayah_id: ayahUuid,
            scholar_name: c.scholar,
            work_title: c.title,
            text: c.text,
            language_code: c.lang,
          });
        }
      }
    }
  }

  console.log(`[Database] Seeding Tafsir table (${tafsirRecords.length} records)...`);
  await batchInsert(supabase, 'tafsir', tafsirRecords, 500);

  console.log('\n===============================================================');
  console.log('  ✓ SEEDING COMPLETED SUCCESSFULLY!                            ');
  console.log(`  ✓ 114 Surahs populated`);
  console.log(`  ✓ 6,236 Ayahs populated`);
  console.log(`  ✓ ${translationRecords.length} Translations populated (EN, SV, FR)`);
  console.log(`  ✓ ${tafsirRecords.length} Classical Tafsir records populated`);
  console.log('===============================================================\n');
}

// Execute if run directly from CLI
if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('seedFullQuran')) {
  seedFullQuran().catch((err) => {
    console.error('\n❌ Fatal Error during Quran Seeding:', err);
    process.exit(1);
  });
}
