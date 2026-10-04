import { createClient } from '@supabase/supabase-js';

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL)!;
const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)!;
const supabase = createClient(url, key);

async function verify() {
  const { count: surahCount } = await supabase.from('surah').select('*', { count: 'exact', head: true });
  const { count: ayahCount } = await supabase.from('ayah').select('*', { count: 'exact', head: true });
  const { count: transCount } = await supabase.from('translation').select('*', { count: 'exact', head: true });
  const { count: tafsirCount } = await supabase.from('tafsir').select('*', { count: 'exact', head: true });
  
  const { count: topicCount } = await supabase.from('topic').select('*', { count: 'exact', head: true });
  const { count: ayahTopicCount } = await supabase.from('ayah_topic').select('*', { count: 'exact', head: true });
  const { count: embCount } = await supabase.from('ayah').select('id', { count: 'exact', head: true }).not('embedding', 'is', null);
  const { data: sample } = await supabase.from('ayah').select('embedding').not('embedding', 'is', null).limit(1);
  const emb = sample?.[0]?.embedding;
  const parsed = typeof emb === 'string' ? JSON.parse(emb) : emb;

  console.log(`Tables Verification:`);
  console.log(`- Surahs: ${surahCount}`);
  console.log(`- Ayahs: ${ayahCount}`);
  console.log(`- Translations: ${transCount}`);
  console.log(`- Tafsirs: ${tafsirCount}`);
  console.log(`- Topics: ${topicCount}`);
  console.log(`- Ayah-Topic Links: ${ayahTopicCount}`);
  console.log(`- Ayahs with Embeddings: ${embCount} / ${ayahCount} (dim: ${parsed?.length})`);
}

verify();
