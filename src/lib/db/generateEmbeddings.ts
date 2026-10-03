/**
 * @file src/lib/db/generateEmbeddings.ts
 * @description Rate-Limited Vector Embedding Generator for Hidaya (`aomelander/hidaya`).
 * Queries `ayah` where `embedding IS NULL` (up to 1000 rows per run), processes in chunks
 * of 10 with a 1500ms delay between requests and a 10s pause on 429 / quota errors,
 * and supports `--check` (`npm run db:embed-check`) to inspect progress out of 6,236 Ayahs.
 */

import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

// Load credentials from .env.local or .env (built-in Node env loader, zero external dotenv dependency)
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

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  '';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  '';
const geminiApiKey = process.env.GEMINI_API_KEY || '';

const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004';
const FALLBACK_EMBEDDING_MODEL = 'gemini-embedding-2-preview';
const TARGET_DIMENSIONS = Number(process.env.EMBEDDING_DIMENSIONS) || 1536;
const BATCH_SIZE = 10;
const DELAY_MS = 1500; // 1.5s delay keeps requests safely under 15 RPM free-tier limit

/**
 * Normalizes or truncates/pads an embedding vector to match the database vector column dimension.
 */
function normalizeDimensions(values: number[], targetDim: number): number[] {
  if (values.length === targetDim) return values;
  if (values.length > targetDim) {
    return values.slice(0, targetDim);
  }
  const padded = new Array(targetDim).fill(0);
  for (let i = 0; i < values.length; i++) {
    padded[i] = values[i];
  }
  return padded;
}

/**
 * Checks and prints how many Ayahs currently have populated embeddings out of 6,236.
 */
export async function checkEmbeddingsCount(): Promise<void> {
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('mock.supabase.co')) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  const { count, error } = await supabase
    .from('ayah')
    .select('id', { count: 'exact', head: true })
    .not('embedding', 'is', null);

  if (error) {
    console.error('❌ Error checking embeddings count:', error.message);
  } else {
    console.log(`✅ Ayahs with populated embeddings: ${count ?? 0} / 6236`);
  }
}

/**
 * Rate-limited generator that processes unembedded Ayahs in batches of 10 with 1500ms pacing.
 */
export async function generateEmbeddings(): Promise<void> {
  if (process.argv.includes('--check')) {
    await checkEmbeddingsCount();
    return;
  }

  if (!supabaseUrl || !supabaseKey || !geminiApiKey || supabaseUrl.includes('mock.supabase.co')) {
    console.error('❌ Missing environment variables in .env.local (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY)');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  const ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  await checkEmbeddingsCount();
  console.log('🔄 Fetching Ayahs with missing embeddings...');

  // 1. Fetch only rows where embedding is NULL (limit 1000 per run)
  const { data: pendingAyahs, error } = await supabase
    .from('ayah')
    .select('id, text_clean, text_uthmani')
    .is('embedding', null)
    .limit(1000);

  if (error) {
    console.error('❌ Error fetching pending ayahs:', error.message);
    return;
  }

  if (!pendingAyahs || pendingAyahs.length === 0) {
    console.log('🎉 All Ayahs already have populated embeddings!');
    return;
  }

  console.log(
    `📊 Processing next ${pendingAyahs.length} pending Ayahs in batches of ${BATCH_SIZE} (${DELAY_MS}ms delay)...`
  );

  let activeModel = EMBEDDING_MODEL;

  for (let i = 0; i < pendingAyahs.length; i += BATCH_SIZE) {
    const chunk = pendingAyahs.slice(i, i + BATCH_SIZE);

    for (const ayah of chunk) {
      try {
        const textToEmbed = ayah.text_clean || ayah.text_uthmani;

        let response;
        try {
          response = await ai.models.embedContent({
            model: activeModel,
            contents: [textToEmbed],
          });
        } catch (modelErr: unknown) {
          const msg = modelErr instanceof Error ? modelErr.message : String(modelErr);
          if (
            (msg.includes('404') || msg.includes('NOT_FOUND')) &&
            activeModel !== FALLBACK_EMBEDDING_MODEL
          ) {
            console.warn(
              `⚠️ Model '${activeModel}' not found; switching to '${FALLBACK_EMBEDDING_MODEL}'...`
            );
            activeModel = FALLBACK_EMBEDDING_MODEL;
            response = await ai.models.embedContent({
              model: activeModel,
              contents: [textToEmbed],
            });
          } else {
            throw modelErr;
          }
        }

        const rawVector = response.embeddings?.[0]?.values;

        if (rawVector && rawVector.length > 0) {
          const normalizedVector = normalizeDimensions(rawVector, TARGET_DIMENSIONS);

          const { error: updateError } = await supabase
            .from('ayah')
            .update({ embedding: JSON.stringify(normalizedVector) })
            .eq('id', ayah.id);

          if (updateError) {
            console.error(
              `❌ Failed to save embedding for Ayah ID ${ayah.id}:`,
              updateError.message
            );
          }
        }
      } catch (err: unknown) {
        const errMessage = err instanceof Error ? err.message : String(err);
        const errStatus = (err as { status?: number })?.status;

        if (
          errMessage.toLowerCase().includes('quota') ||
          errMessage.includes('429') ||
          errMessage.includes('RESOURCE_EXHAUSTED') ||
          errStatus === 429
        ) {
          console.warn('⚠️ Quota limit reached. Pausing for 10 seconds...');
          await new Promise((res) => setTimeout(res, 10000));
        } else {
          console.error(`❌ API error on Ayah ID ${ayah.id}:`, errMessage);
        }
      }

      // 1.5s delay per item to respect free-tier RPM limits
      await new Promise((res) => setTimeout(res, DELAY_MS));
    }

    console.log(
      `✅ Progress: ${Math.min(i + BATCH_SIZE, pendingAyahs.length)} / ${pendingAyahs.length} processed.`
    );
  }

  console.log('🏁 Batch run completed. Re-run "npm run db:embed" if more pending rows remain.');
}

if (
  import.meta.url.endsWith(process.argv[1]) ||
  process.argv[1]?.includes('generateEmbeddings')
) {
  generateEmbeddings().catch((err) => {
    console.error('\n❌ Fatal Error in generateEmbeddings:', err);
    process.exit(1);
  });
}
