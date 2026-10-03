/**
 * @file src/lib/db/generateEmbeddings.ts
 * @description Vector Embedding Generator for Hidaya (`aomelander/hidaya`).
 * Queries the `ayah` table for rows where `embedding IS NULL`, batch-requests
 * 768-dimensional embeddings via `@google/genai`, and updates `ayah.embedding`.
 */

import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

// Load credentials from .env.local or .env
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
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004';
const FALLBACK_EMBEDDING_MODEL = 'gemini-embedding-2-preview';
const TARGET_DIMENSIONS = 768;
const BATCH_SIZE = 50;

interface AyahRowForEmbedding {
  id: string;
  surah_id: string;
  ayah_number: number;
  text_clean: string;
  translation?: Array<{ text: string; language_code: string }>;
}

/**
 * Normalizes or truncates/pads an embedding vector to exactly 768 dimensions.
 */
function normalizeTo768(values: number[]): number[] {
  if (values.length === TARGET_DIMENSIONS) return values;
  if (values.length > TARGET_DIMENSIONS) {
    return values.slice(0, TARGET_DIMENSIONS);
  }
  const padded = new Array(TARGET_DIMENSIONS).fill(0);
  for (let i = 0; i < values.length; i++) {
    padded[i] = values[i];
  }
  return padded;
}

/**
 * Generates embeddings for all `ayah` rows where `embedding IS NULL`.
 */
export async function generateEmbeddings(): Promise<void> {
  console.log('===============================================================');
  console.log('     HIDAYA VECTOR EMBEDDING GENERATOR (generateEmbeddings)    ');
  console.log('===============================================================');
  console.log(`Target Dimensions: ${TARGET_DIMENSIONS} | Batch Size: ${BATCH_SIZE}`);

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || SUPABASE_URL.includes('mock.supabase.co')) {
    console.log(
      'ℹ NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured. Exiting cleanly.'
    );
    return;
  }

  if (!GEMINI_API_KEY) {
    console.log('ℹ GEMINI_API_KEY not configured. Exiting cleanly.');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const ai = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  let totalUpdated = 0;
  let activeModel = EMBEDDING_MODEL;

  while (true) {
    // 1. Query `ayah` table for rows where `embedding IS NULL`
    const { data: rows, error: queryErr } = await supabase
      .from('ayah')
      .select('id, surah_id, ayah_number, text_clean, translation(text, language_code)')
      .is('embedding', null)
      .limit(BATCH_SIZE);

    if (queryErr) {
      throw new Error(`Failed querying unembedded ayahs: ${queryErr.message}`);
    }

    if (!rows || rows.length === 0) {
      console.log('✓ No remaining rows with `embedding IS NULL`.');
      break;
    }

    const typedRows = rows as unknown as AyahRowForEmbedding[];

    // Build combined semantic text (`text_clean` + English translation if available)
    const textsToEmbed = typedRows.map((row) => {
      const enTrans = row.translation?.find((t) => t.language_code === 'en')?.text || '';
      return enTrans ? `${row.text_clean} — ${enTrans}` : row.text_clean;
    });

    // 2. Request batch embeddings from @google/genai
    let embeddingsList: Array<{ values?: number[] }> | undefined;
    try {
      const response = await ai.models.embedContent({
        model: activeModel,
        contents: textsToEmbed,
        config: {
          outputDimensionality: TARGET_DIMENSIONS,
        },
      });
      embeddingsList = response.embeddings;
    } catch (err) {
      if (activeModel !== FALLBACK_EMBEDDING_MODEL) {
        console.warn(
          `⚠ Model '${activeModel}' returned an error; falling back to '${FALLBACK_EMBEDDING_MODEL}'...`
        );
        activeModel = FALLBACK_EMBEDDING_MODEL;
        const fallbackResponse = await ai.models.embedContent({
          model: activeModel,
          contents: textsToEmbed,
          config: {
            outputDimensionality: TARGET_DIMENSIONS,
          },
        });
        embeddingsList = fallbackResponse.embeddings;
      } else {
        throw err;
      }
    }

    if (!embeddingsList || embeddingsList.length !== typedRows.length) {
      throw new Error(
        `Embedding count mismatch: expected ${typedRows.length}, received ${embeddingsList?.length || 0}`
      );
    }

    // 3. Update `ayah.embedding` column with 768-dimensional float arrays
    await Promise.all(
      typedRows.map(async (row, idx) => {
        const rawValues = embeddingsList![idx]?.values;
        if (!rawValues || rawValues.length === 0) return;

        const vector768 = normalizeTo768(rawValues);
        const { error: updateErr } = await supabase
          .from('ayah')
          .update({ embedding: vector768 })
          .eq('id', row.id);

        if (updateErr) {
          throw new Error(`Failed updating embedding for ayah ${row.id}: ${updateErr.message}`);
        }
      })
    );

    totalUpdated += typedRows.length;
    console.log(`  ✓ Updated embeddings for ${totalUpdated} Ayahs...`);
  }

  console.log('\n===============================================================');
  console.log(`  ✓ EMBEDDING GENERATION COMPLETE (${totalUpdated} Ayahs updated)`);
  console.log('===============================================================\n');
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
