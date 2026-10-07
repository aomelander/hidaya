-- ==============================================================================
-- Migration: Official Quranpedia Tafsir Al-Sha'rawi (Book ID: 18) & Import Errors
-- 1. Removes all previous Al-Bouti and Al-Sha'rawi records from `tafsir` and `cached_reflection`.
-- 2. Adds official Quranpedia metadata columns to `tafsir` (`tafsir_book_id`, `surah_number`,
--    `ayah_number`, `source_provider`, `source_version`, `content_hash`).
-- 3. Creates unique index on `(tafsir_book_id, surah_number, ayah_number)` and `(ayah_id, scholar_name, language_code)`
--    so running imports multiple times is strictly idempotent.
-- 4. Creates `import_errors` table for any record that cannot be associated with an ayah.
-- ==============================================================================

-- 1. Purge all legacy Al-Bouti and Al-Sha'rawi records
DELETE FROM tafsir
WHERE scholar_name ILIKE '%Bouti%'
   OR scholar_name ILIKE '%البوطي%'
   OR scholar_name ILIKE '%Sha''rawi%'
   OR scholar_name ILIKE '%Shaarawi%'
   OR scholar_name ILIKE '%الشعراوي%';

DELETE FROM cached_reflection
WHERE query_hash LIKE 'scholar_transcription:%'
   OR query_hash = 'scholar_pending_queue';

-- 2. Add Quranpedia Book ID & Synchronization columns to `tafsir`
ALTER TABLE tafsir
  ADD COLUMN IF NOT EXISTS tafsir_book_id INTEGER;

ALTER TABLE tafsir
  ADD COLUMN IF NOT EXISTS surah_number INTEGER;

ALTER TABLE tafsir
  ADD COLUMN IF NOT EXISTS ayah_number INTEGER;

ALTER TABLE tafsir
  ADD COLUMN IF NOT EXISTS source_provider TEXT DEFAULT 'Quranpedia';

ALTER TABLE tafsir
  ADD COLUMN IF NOT EXISTS source_version TEXT;

ALTER TABLE tafsir
  ADD COLUMN IF NOT EXISTS content_hash TEXT;

-- 3. Create Unique Constraint / Index on (tafsir_book_id, surah_number, ayah_number)
CREATE UNIQUE INDEX IF NOT EXISTS idx_tafsir_book_surah_ayah_unique
  ON tafsir (tafsir_book_id, surah_number, ayah_number)
  WHERE tafsir_book_id IS NOT NULL AND surah_number IS NOT NULL AND ayah_number IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_tafsir_ayah_scholar_lang_unique
  ON tafsir (ayah_id, scholar_name, language_code);

-- 4. Create `import_errors` table for unmapped records (never guess ayah mappings)
CREATE TABLE IF NOT EXISTS import_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tafsir_book_id INTEGER NOT NULL,
  surah_number INTEGER,
  ayah_number INTEGER,
  verse_key TEXT,
  error_reason TEXT NOT NULL,
  raw_payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE import_errors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-only access to import_errors"
  ON import_errors FOR SELECT USING (true);

CREATE POLICY "Allow service role full access to import_errors"
  ON import_errors FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
