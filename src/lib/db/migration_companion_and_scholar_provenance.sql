-- ==============================================================================
-- Migration: Companion Guidance, Linguistic Roots & Scholar Provenance Audit
-- Part of Step 1: Database Migration for Hidaya
-- Conforms strictly to AGENTS.md Content Boundaries:
-- - Level 1: Verified Uthmani Quranic Arabic (in ayah table)
-- - Level 2: Human Translations (in translation table)
-- - Level 3: Classical & Expert Tafsir with Provenance (in tafsir table)
-- - Level 4: Companion Guidance, Stories & Linguistic Roots (in tables below)
-- ==============================================================================

-- 1. Table: verse_companion_guidance
-- Stores pedagogical companion stories (Kids 8yo), family discussion questions,
-- micro-actions for today, and teen key takeaways across EN, SV, FR, AR.
CREATE TABLE IF NOT EXISTS verse_companion_guidance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ayah_id UUID NOT NULL REFERENCES ayah(id) ON DELETE CASCADE,
  audience_profile TEXT NOT NULL CHECK (audience_profile IN ('kids', 'teen', 'family', 'general')),
  language_code TEXT NOT NULL CHECK (language_code IN ('en', 'sv', 'fr', 'ar')),
  story_text TEXT,
  family_question TEXT,
  action_step TEXT,
  key_takeaway TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (ayah_id, audience_profile, language_code)
);

-- Index for instant retrieval by ayah, profile, and language
CREATE INDEX IF NOT EXISTS idx_companion_guidance_lookup 
  ON verse_companion_guidance(ayah_id, audience_profile, language_code);

-- 2. Table: linguistic_root
-- Stores 3-letter Arabic root etymologies, literal desert/bedouin imagery,
-- and spiritual depths across EN, SV, FR, AR.
CREATE TABLE IF NOT EXISTS linguistic_root (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ayah_id UUID NOT NULL REFERENCES ayah(id) ON DELETE CASCADE,
  term_arabic TEXT NOT NULL,
  term_transliterated TEXT NOT NULL,
  root_letters TEXT NOT NULL,
  language_code TEXT NOT NULL CHECK (language_code IN ('en', 'sv', 'fr', 'ar')),
  literal_imagery TEXT NOT NULL,
  spiritual_depth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for instant lookup by ayah and language
CREATE INDEX IF NOT EXISTS idx_linguistic_root_lookup 
  ON linguistic_root(ayah_id, language_code);

-- 3. Enhance tafsir table with provenance audit columns
-- Supports modern expert transcriptions (e.g. Sheikh Al-Sha'rawi, Dr. Al-Bouti)
-- and safe AI translation with transparent provenance tracking.
ALTER TABLE tafsir 
  ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'classical_book' 
    CHECK (source_type IN ('classical_book', 'expert_transcription', 'ai_translated_expert', 'ai_synthesis'));

ALTER TABLE tafsir 
  ADD COLUMN IF NOT EXISTS source_reference TEXT;

ALTER TABLE tafsir 
  ADD COLUMN IF NOT EXISTS original_arabic_raw TEXT;

ALTER TABLE tafsir 
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'verified_canonical' 
    CHECK (verification_status IN ('verified_canonical', 'transcription_verified', 'ai_translated_pending_review', 'ai_synthesized'));

-- 4. Enable Row Level Security (RLS)
ALTER TABLE verse_companion_guidance ENABLE ROW LEVEL SECURITY;
ALTER TABLE linguistic_root ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Public read access for client applications
CREATE POLICY "Allow public read-only access to verse_companion_guidance" 
  ON verse_companion_guidance FOR SELECT USING (true);

CREATE POLICY "Allow public read-only access to linguistic_root" 
  ON linguistic_root FOR SELECT USING (true);

-- Service role full access for data seeding and ingestion utilities
CREATE POLICY "Allow service role full access to verse_companion_guidance" 
  ON verse_companion_guidance FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

CREATE POLICY "Allow service role full access to linguistic_root" 
  ON linguistic_root FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
