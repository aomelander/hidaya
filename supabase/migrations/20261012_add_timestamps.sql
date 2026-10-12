-- =============================================================================
-- Migration: 20261012_add_timestamps.sql
-- Description: Adds exact word-by-word millisecond timestamps (`timestamps_jsonb`)
--              and GIN indexing to `public.ayah_audio` for zero-lag, zero-cost
--              word-by-word synchronization across Recitation, Translation & Tafsir.
-- =============================================================================

ALTER TABLE public.ayah_audio
ADD COLUMN IF NOT EXISTS timestamps_jsonb JSONB DEFAULT '[]'::jsonb;

-- Create GIN index on timestamps_jsonb for fast JSONB containment/inspection queries
CREATE INDEX IF NOT EXISTS idx_ayah_audio_timestamps
ON public.ayah_audio USING GIN (timestamps_jsonb);

COMMENT ON COLUMN public.ayah_audio.timestamps_jsonb IS
'Exact millisecond word-by-word timing array: [{"position": 1, "word_arabic": "...", "transliteration": "...", "translation": "...", "start_ms": 0, "end_ms": 620}]';
