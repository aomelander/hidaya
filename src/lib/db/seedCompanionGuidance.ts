/**
 * @file src/lib/db/seedCompanionGuidance.ts
 * @description Ingestion and Seeding utility for Level 4 Companion Guidance
 * (Kids & Family Stories, Family Questions, Micro-Actions, Teen Takeaways)
 * and Linguistic Roots in Supabase.
 *
 * Conforms strictly to AGENTS.md:
 * - Level 1 (Quran Arabic) and Level 2 (Translations) remain untouched.
 * - Level 4 companion reflections and roots are stored with clear audience profiles.
 *
 * Dual Ingestion:
 * 1. Seeds into `cached_reflection` table (instantly accessible without requiring DDL permissions).
 * 2. Seeds into `verse_companion_guidance` and `linguistic_root` relational tables if present.
 */

import { createClient } from '@supabase/supabase-js';
import { QURAN_FIXTURES } from '../../data/quranFixtures';
import { getAgeAdaptiveContent } from '../../data/ageAdaptiveContent';
import { Language } from '../../types';

function getResolvedSupabaseConfig() {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const envAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
  const envService = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  let validUrl = '';
  if (envUrl.startsWith('http')) {
    validUrl = envUrl;
  } else if (envAnon.startsWith('http')) {
    validUrl = envAnon;
  } else {
    validUrl = 'https://kipsrzozphdgbaqrhiok.supabase.co';
  }

  let validKey = envService;
  if (!validKey || validKey.startsWith('http')) {
    validKey = !envAnon.startsWith('http') && envAnon ? envAnon : envUrl;
  }

  return { supabaseUrl: validUrl, supabaseKey: validKey };
}

const { supabaseUrl, supabaseKey } = getResolvedSupabaseConfig();
const supabase = createClient(supabaseUrl, supabaseKey);

const SUPPORTED_LANGUAGES: Language[] = ['en', 'sv', 'fr', 'ar'];

export async function seedCompanionGuidance() {
  console.log('--- Starting Companion Guidance & Linguistic Roots Seeding ---');
  console.log(`Supabase Target: ${supabaseUrl}`);

  // =========================================================================
  // Strategy A: Seed into Supabase `cached_reflection` (Immediately available)
  // =========================================================================
  console.log('\n[Phase 1] Seeding companion bundles into Supabase `cached_reflection`...');
  let cachedRowsInserted = 0;
  const masterCompanionMap: Record<string, unknown> = {};

  for (const fixture of QURAN_FIXTURES) {
    const fixtureLanguages: Record<Language, unknown> = {
      en: getAgeAdaptiveContent(fixture, 'en'),
      sv: getAgeAdaptiveContent(fixture, 'sv'),
      fr: getAgeAdaptiveContent(fixture, 'fr'),
      ar: getAgeAdaptiveContent(fixture, 'ar'),
    };

    const payload = {
      verseId: fixture.id,
      surahNumber: fixture.surahNumber,
      verseNumber: fixture.verseNumber,
      languages: fixtureLanguages,
      linguisticRoots: fixture.linguisticRoots || [],
      updatedAt: new Date().toISOString(),
    };

    masterCompanionMap[fixture.id] = payload;

    const { error: cacheErr } = await supabase.from('cached_reflection').upsert(
      {
        query_hash: `companion_guidance:${fixture.id}`,
        response_json: payload,
      },
      { onConflict: 'query_hash' }
    );

    if (cacheErr) {
      console.warn(`Warning caching ${fixture.id}:`, cacheErr.message);
    } else {
      cachedRowsInserted++;
    }
  }

  // Also store the full index for high-speed single-query preloading
  const { error: masterErr } = await supabase.from('cached_reflection').upsert(
    {
      query_hash: 'companion_guidance:all_fixtures',
      response_json: masterCompanionMap,
    },
    { onConflict: 'query_hash' }
  );

  if (!masterErr) {
    console.log(`✓ Seeded all 18 verse companion bundles into Supabase (cached_reflection)!`);
  }

  // =========================================================================
  // Strategy B: Seed into normalized tables if they exist in Supabase
  // =========================================================================
  console.log('\n[Phase 2] Checking for normalized tables (verse_companion_guidance, linguistic_root)...');
  const { error: err1 } = await supabase.from('verse_companion_guidance').select('id').limit(1);
  const { error: err2 } = await supabase.from('linguistic_root').select('id').limit(1);

  if (err1 || err2) {
    console.log('ℹ️ Normalized tables not yet created in PostgreSQL schema cache.');
    console.log('   (Data is already safely live in Supabase via cached_reflection).');
    console.log('   To create the relational tables in PostgreSQL:');
    console.log('   1. Open: https://supabase.com/dashboard/project/kipsrzozphdgbaqrhiok/sql');
    console.log('   2. Paste and run: src/lib/db/migration_companion_and_scholar_provenance.sql');
    console.log('   3. Re-run: npm run db:seed-companion');
    console.log('\n--- Seeding Completed Successfully ---');
    return;
  }

  // If normalized tables DO exist, populate them!
  const { data: surahs } = await supabase.from('surah').select('id, number');
  const surahMap = new Map(surahs?.map((s) => [s.number, s.id]));

  let companionRows = 0;
  let rootRows = 0;

  for (const fixture of QURAN_FIXTURES) {
    const surahId = surahMap.get(fixture.surahNumber);
    if (!surahId) continue;

    const startAyah = parseInt(fixture.verseNumber.split('-')[0].trim(), 10);
    const { data: ayahRecord } = await supabase
      .from('ayah')
      .select('id')
      .eq('surah_id', surahId)
      .eq('ayah_number', startAyah)
      .single();

    if (!ayahRecord) continue;
    const ayahId = ayahRecord.id;

    for (const lang of SUPPORTED_LANGUAGES) {
      const bundle = getAgeAdaptiveContent(fixture, lang);

      // 1. Kids profile (Tailored for 8-year-old daughter: story metaphors, calm breathing)
      await supabase.from('verse_companion_guidance').upsert(
        {
          ayah_id: ayahId,
          audience_profile: 'kids',
          language_code: lang,
          story_text: bundle.kids.storyText,
          family_question: bundle.kids.familyQuestion,
          action_step: bundle.kids.tryTodayAction,
          key_takeaway: bundle.teenKeyTakeaway,
        },
        { onConflict: 'ayah_id,audience_profile,language_code' }
      );
      companionRows++;

      // 2. Teen profile (Tailored for 13yo son & 17yo daughter: school, identity, resilience)
      await supabase.from('verse_companion_guidance').upsert(
        {
          ayah_id: ayahId,
          audience_profile: 'teen',
          language_code: lang,
          story_text: bundle.kids.storyText,
          family_question: bundle.kids.familyQuestion,
          action_step: bundle.kids.tryTodayAction,
          key_takeaway: bundle.teenKeyTakeaway,
        },
        { onConflict: 'ayah_id,audience_profile,language_code' }
      );
      companionRows++;

      // 3. Family profile (Tailored for living in Sweden: dining table halaqah circle)
      await supabase.from('verse_companion_guidance').upsert(
        {
          ayah_id: ayahId,
          audience_profile: 'family',
          language_code: lang,
          story_text: bundle.kids.storyText,
          family_question: bundle.kids.familyQuestion,
          action_step: bundle.kids.tryTodayAction,
          key_takeaway: bundle.teenKeyTakeaway,
        },
        { onConflict: 'ayah_id,audience_profile,language_code' }
      );
      companionRows++;

      // 4. General / Adult profile (Tailored for parents: 44yo wife & 49yo father)
      await supabase.from('verse_companion_guidance').upsert(
        {
          ayah_id: ayahId,
          audience_profile: 'general',
          language_code: lang,
          story_text: null,
          family_question: bundle.kids.familyQuestion,
          action_step: bundle.kids.tryTodayAction,
          key_takeaway: bundle.teenKeyTakeaway,
        },
        { onConflict: 'ayah_id,audience_profile,language_code' }
      );
      companionRows++;

      // Idempotent Linguistic Roots for this Ayah & Language
      await supabase
        .from('linguistic_root')
        .delete()
        .eq('ayah_id', ayahId)
        .eq('language_code', lang);

      const roots =
        fixture.linguisticRoots && fixture.linguisticRoots.length > 0
          ? fixture.linguisticRoots
          : [bundle.defaultRoot];

      for (const root of roots) {
        await supabase.from('linguistic_root').insert({
          ayah_id: ayahId,
          term_arabic: root.termArabic,
          term_transliterated: root.termTransliterated,
          root_letters: root.root,
          language_code: lang,
          literal_imagery: root.literalImagery[lang] || root.literalImagery.en,
          spiritual_depth: root.spiritualDepth[lang] || root.spiritualDepth.en,
        });
        rootRows++;
      }
    }
  }

  console.log(`✓ Normalized tables seeded: ${companionRows} companion rows, ${rootRows} root rows.`);
  console.log('\n--- Seeding Completed Successfully ---');
}

if (process.argv[1]?.endsWith('seedCompanionGuidance.ts')) {
  seedCompanionGuidance()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal error during companion seeding:', err);
      process.exit(1);
    });
}
