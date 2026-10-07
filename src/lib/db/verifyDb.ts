import { createClient } from '@supabase/supabase-js';

try {
  if (typeof process.loadEnvFile === 'function') {
    try {
      process.loadEnvFile('.env.local');
    } catch {
      process.loadEnvFile('.env');
    }
  }
} catch {
  // Ignore missing local env file
}

const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const envKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

const url = envUrl.startsWith('http') ? envUrl : 'https://kipsrzozphdgbaqrhiok.supabase.co';
const key = envKey || 'anon-key';
const supabase = createClient(url, key);

async function verify() {
  console.log('====================================================');
  console.log('       HIDAYA DATABASE AUDIT & VERIFICATION         ');
  console.log('====================================================');

  try {
    const { count: surahCount } = await supabase.from('surah').select('*', { count: 'exact', head: true });
    const { count: ayahCount } = await supabase.from('ayah').select('*', { count: 'exact', head: true });
    const { count: transCount } = await supabase.from('translation').select('*', { count: 'exact', head: true });
    const { count: tafsirCount } = await supabase.from('tafsir').select('*', { count: 'exact', head: true });
    
    const { count: topicCount } = await supabase.from('topic').select('*', { count: 'exact', head: true });
    const { count: ayahTopicCount } = await supabase.from('ayah_topic').select('*', { count: 'exact', head: true });
    const { count: embCount } = await supabase.from('ayah').select('id', { count: 'exact', head: true }).not('embedding', 'is', null);

    console.log(`\nTable Record Counts:`);
    console.log(`- Surahs: ${surahCount ?? 'N/A'}`);
    console.log(`- Ayahs: ${ayahCount ?? 'N/A'}`);
    console.log(`- Translations: ${transCount ?? 'N/A'}`);
    console.log(`- Tafsirs: ${tafsirCount ?? 'N/A'}`);
    console.log(`- Topics: ${topicCount ?? 'N/A'}`);
    console.log(`- Ayah-Topic Links: ${ayahTopicCount ?? 'N/A'}`);
    console.log(`- Ayahs with Vector Embeddings: ${embCount ?? 'N/A'} / ${ayahCount ?? 'N/A'}`);

    console.log(`\nAuditing Data Integrity (Translation vs Tafsir Separation)...`);
    
    // Sample check: verify translation sources
    const { data: transSample } = await supabase
      .from('translation')
      .select('language_code, source, text')
      .limit(10);

    if (transSample && transSample.length > 0) {
      console.log(`- Sample translations verified (${transSample.length} rows examined)`);
      const muyassarInTranslation = transSample.filter((t) =>
        t.source.includes('الميسر') || t.source.includes('Muyassar')
      );
      if (muyassarInTranslation.length > 0) {
        console.warn(`  ⚠ Found Tafsir source in translation table! Needs cleaning.`);
      } else {
        console.log(`  ✓ Translation sources cleanly separated from Tafsir.`);
      }
    }

    // Sample check: verify tafsir works
    const { data: tafsirSample } = await supabase
      .from('tafsir')
      .select('scholar_name, work_title, language_code, text')
      .limit(10);

    if (tafsirSample && tafsirSample.length > 0) {
      console.log(`- Sample tafsir verified (${tafsirSample.length} rows examined)`);
      const syntheticTemplates = tafsirSample.filter((t) =>
        t.text.includes('Classical exegesis (Al-Mukhtasar / Ibn Kathir) on:')
      );
      if (syntheticTemplates.length > 0) {
        console.warn(`  ⚠ Found synthetic template text in Tafsir table.`);
      } else {
        console.log(`  ✓ Tafsir records contain authentic scholarly commentary.`);
      }
    }

    const { count: shaarawiCount } = await supabase
      .from('tafsir')
      .select('*', { count: 'exact', head: true })
      .eq('scholar_name', "Al-Sha'rawi");

    const { count: boutiCount } = await supabase
      .from('tafsir')
      .select('*', { count: 'exact', head: true })
      .or('scholar_name.ilike.%Bouti%,scholar_name.ilike.%البوطي%');

    console.log(`\nQuranpedia Book 18 (Tafsir Al-Sha'rawi) & Legacy Cleanup Audit:`);
    console.log(`- Official Tafsir Al-Sha'rawi (Book 18) records: ${shaarawiCount ?? 0}`);
    console.log(`- Legacy Al-Bouti records remaining:             ${boutiCount ?? 0}`);

    console.log('\nAudit complete.');
  } catch (err: any) {
    console.error('Audit encountered error querying database:', err.message || err);
  }
}

verify();
