# Rate-Limited Vector Embedding Generator (`generateEmbeddings.ts`)

Update `src/lib/db/generateEmbeddings.ts` to respect Google AI Studio's free-tier rate limits (`15 RPM`) by processing unembedded Ayahs in chunks of `10` with a `1500ms` delay between requests and a `10s` pause on `429 / quota` errors, plus a quick CLI helper (`db:embed-check`) to inspect how many of the `6,236` Ayahs currently have populated embeddings.

## Overview & Key Changes

1. **Rate-Limited `src/lib/db/generateEmbeddings.ts`**:
   - Loads credentials from `.env.local` or `.env` (using `process.loadEnvFile` with no external `dotenv` dependency required).
   - Queries `ayah` where `embedding IS NULL` (`limit(1000)` per run) so it automatically resumes from where it left off.
   - Processes in chunks of `BATCH_SIZE = 10` with `DELAY_MS = 1500` (`1.5s`) between requests and automatic `10,000ms` (`10s`) backoff if a `429` or `quota` error is returned.
   - Extracts `response.embeddings?.[0]?.values` (from `@google/genai`'s `embedContent` response) and updates `ayah.embedding`.
2. **Embedding Progress Check (`package.json`)**:
   - Adds `"db:embed-check"` to `package.json` or supports `npm run db:embed -- --check` to print the exact count of `ayah` rows where `embedding IS NOT NULL` out of `6,236`.
