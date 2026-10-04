/**
 * @file src/lib/db/generateEmbeddings.ts
 * @description Quota-Safe Batch Vector Embedding Generator for Hidaya (`aomelander/hidaya`).
 * Uses `batchEmbedContents` (50 Ayahs per single HTTP request) with `gemini-embedding-2-preview`
 * (`outputDimensionality: 1536`), a 4.5-second inter-batch pause (~13 RPM, well below the
 * 15 RPM free-tier limit), and exponential backoff on 429 / RESOURCE_EXHAUSTED responses.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Load credentials from .env.local or .env if present
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

const EMBEDDING_MODELS = [
  'gemini-embedding-001',
  'gemini-embedding-2-preview',
];
const TARGET_DIMENSIONS = Number(process.env.EMBEDDING_DIMENSIONS) || 1536;
const BATCH_SIZE = 50; // 50 ayahs embedded per 1 API call via batchEmbedContents
const DELAY_BETWEEN_BATCHES_MS = 31000; // Free tier allows 100 embedded items/min -> 50 items every 31s runs with zero 429s

interface AyahRowForEmbedding {
  id: string;
  surah_id: string;
  ayah_number: number;
  text_clean: string;
  text_uthmani: string;
  translation?: Array<{ text: string; language_code: string }>;
}

/**
 * Normalizes or truncates/pads an embedding vector to exactly TARGET_DIMENSIONS (1536).
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
export async function checkEmbeddingsCount(existingClient?: SupabaseClient): Promise<number> {
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('mock.supabase.co')) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
    return 0;
  }

  const supabase =
    existingClient ||
    createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

  const { count, error } = await supabase
    .from('ayah')
    .select('id', { count: 'exact', head: true })
    .not('embedding', 'is', null);

  if (error) {
    console.error('❌ Error checking embeddings count:', error.message);
    return 0;
  }

  console.log(`✅ Ayahs with populated embeddings: ${count ?? 0} / 6236`);
  return count ?? 0;
}

class DailyQuotaExhaustedError extends Error {
  model: string;
  constructor(model: string, message: string) {
    super(message);
    this.name = 'DailyQuotaExhaustedError';
    this.model = model;
  }
}

/**
 * Calls Gemini `batchEmbedContents` to embed up to 50 Ayahs in a single HTTP request,
 * with automatic exponential backoff if a per-minute 429 occurs, or throws DailyQuotaExhaustedError
 * if the 1,000-requests/day per-model cap is reached so the caller can rotate to the next model.
 */
async function fetchBatchEmbeddings(
  texts: string[],
  model: string,
  attempt: number = 1
): Promise<Array<{ values: number[] }>> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:batchEmbedContents?key=${geminiApiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'aistudio-build',
    },
    body: JSON.stringify({
      requests: texts.map((text) => ({
        model: `models/${model}`,
        content: { parts: [{ text }] },
        outputDimensionality: TARGET_DIMENSIONS,
      })),
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    if (errText.includes('RequestsPerDay') || errText.includes('limit: 1000')) {
      throw new DailyQuotaExhaustedError(
        model,
        `Daily free-tier limit (1,000 embeddings/day) reached for model '${model}'.`
      );
    }

    if ((res.status === 429 || errText.toLowerCase().includes('quota')) && attempt <= 5) {
      const waitMs = 20000 * attempt;
      console.warn(
        `⚠️ Per-minute 429 rate limit hit on '${model}' (attempt ${attempt}/5). Pausing ${waitMs / 1000}s...`
      );
      await new Promise((r) => setTimeout(r, waitMs));
      return fetchBatchEmbeddings(texts, model, attempt + 1);
    }
    throw new Error(`Gemini batchEmbedContents HTTP ${res.status}: ${errText}`);
  }

  const data = (await res.json()) as {
    embeddings?: Array<{ values: number[] }>;
  };

  if (!data.embeddings || data.embeddings.length !== texts.length) {
    throw new Error(
      `Expected ${texts.length} embeddings, received ${data.embeddings?.length ?? 0}`
    );
  }

  return data.embeddings;
}

/**
 * Generates and stores 1536-dimensional embeddings for all remaining Ayahs where `embedding IS NULL`.
 */
export async function generateEmbeddings(): Promise<void> {
  if (process.argv.includes('--check')) {
    await checkEmbeddingsCount();
    return;
  }

  if (!supabaseUrl || !supabaseKey || !geminiApiKey || supabaseUrl.includes('mock.supabase.co')) {
    console.error(
      '❌ Missing environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY)'
    );
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  let modelIndex = 0;
  let activeModel = EMBEDDING_MODELS[modelIndex];

  console.log('===============================================================');
  console.log('   HIDAYA QUOTA-SAFE BATCH EMBEDDING GENERATOR (50 Ayahs/req)  ');
  console.log('===============================================================');
  console.log(
    `Models: ${EMBEDDING_MODELS.join(' -> ')} | Dim: ${TARGET_DIMENSIONS} | Batch: ${BATCH_SIZE}`
  );

  let embeddedCount = await checkEmbeddingsCount(supabase);
  let sessionProcessed = 0;

  while (true) {
    const { data: rows, error: queryErr } = await supabase
      .from('ayah')
      .select('id, surah_id, ayah_number, text_clean, text_uthmani, translation(text, language_code)')
      .is('embedding', null)
      .limit(BATCH_SIZE);

    if (queryErr) {
      console.error('❌ Error fetching pending ayahs:', queryErr.message);
      await new Promise((r) => setTimeout(r, 5000));
      continue;
    }

    if (!rows || rows.length === 0) {
      console.log('🎉 All 6,236 Ayahs now have populated 1536-dim embeddings!');
      break;
    }

    const typedRows = rows as unknown as AyahRowForEmbedding[];

    const textsToEmbed = typedRows.map((row) => {
      const baseArabic = row.text_clean || row.text_uthmani;
      const enTrans = row.translation?.find((t) => t.language_code === 'en')?.text || '';
      return enTrans ? `${baseArabic} — ${enTrans}` : baseArabic;
    });

    try {
      const embeddings = await fetchBatchEmbeddings(textsToEmbed, activeModel);

      for (let j = 0; j < typedRows.length; j += 25) {
        const subChunk = typedRows.slice(j, j + 25);
        await Promise.all(
          subChunk.map(async (row, subIdx) => {
            const rawValues = embeddings[j + subIdx]?.values;
            if (!rawValues || rawValues.length === 0) return;

            const normalized = normalizeDimensions(rawValues, TARGET_DIMENSIONS);
            const { error: updateErr } = await supabase
              .from('ayah')
              .update({ embedding: normalized })
              .eq('id', row.id);

            if (updateErr) {
              console.error(`❌ Update error on Ayah ${row.id}: ${updateErr.message}`);
            }
          })
        );
      }

      sessionProcessed += typedRows.length;
      embeddedCount += typedRows.length;
      console.log(
        `✅ [${activeModel}] Batch committed (+${typedRows.length}) — Total Embedded: ${embeddedCount} / 6236 (Session: ${sessionProcessed})`
      );
    } catch (err: unknown) {
      if (err instanceof DailyQuotaExhaustedError) {
        console.warn(`⚠️ ${err.message}`);
        modelIndex++;
        if (modelIndex < EMBEDDING_MODELS.length) {
          activeModel = EMBEDDING_MODELS[modelIndex];
          console.log(`🔄 Switching to next embedding model: '${activeModel}'...`);
          continue;
        } else {
          console.warn(
            '⏸️ All free-tier daily model quotas (1,000/day per model) have been used for today. Attach a billing-enabled API key in Settings > Secrets or re-run tomorrow.'
          );
          break;
        }
      }

      const msg = err instanceof Error ? err.message : String(err);
      console.error('⚠️ Batch error:', msg);
      await new Promise((r) => setTimeout(r, 15000));
    }

    await new Promise((r) => setTimeout(r, DELAY_BETWEEN_BATCHES_MS));
  }

  await checkEmbeddingsCount(supabase);
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
