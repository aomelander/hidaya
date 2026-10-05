-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Surah Table
CREATE TABLE IF NOT EXISTS surah (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number INTEGER NOT NULL UNIQUE,
  name_arabic TEXT NOT NULL,
  name_english TEXT NOT NULL,
  revelation_place TEXT NOT NULL
);

-- Ayah Table
CREATE TABLE IF NOT EXISTS ayah (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  surah_id UUID REFERENCES surah(id) ON DELETE CASCADE,
  ayah_number INTEGER NOT NULL,
  text_uthmani TEXT NOT NULL,
  text_clean TEXT NOT NULL,
  embedding vector(1536),
  UNIQUE (surah_id, ayah_number)
);

-- Translation Table
CREATE TABLE IF NOT EXISTS translation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ayah_id UUID REFERENCES ayah(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  text TEXT NOT NULL,
  source TEXT NOT NULL
);

-- Tafsir Table with Provenance Tracking
CREATE TABLE IF NOT EXISTS tafsir (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ayah_id UUID REFERENCES ayah(id) ON DELETE CASCADE,
  scholar_name TEXT NOT NULL,
  work_title TEXT NOT NULL,
  text TEXT NOT NULL,
  language_code TEXT NOT NULL,
  source_type TEXT DEFAULT 'classical_book' CHECK (source_type IN ('classical_book', 'expert_transcription', 'ai_translated_expert', 'ai_synthesis')),
  source_reference TEXT,
  original_arabic_raw TEXT,
  verification_status TEXT DEFAULT 'verified_canonical' CHECK (verification_status IN ('verified_canonical', 'transcription_verified', 'ai_translated_pending_review', 'ai_synthesized'))
);

-- Topic Table
CREATE TABLE IF NOT EXISTS topic (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  life_domain TEXT NOT NULL
);

-- Ayah Topic (Many-to-Many)
CREATE TABLE IF NOT EXISTS ayah_topic (
  ayah_id UUID REFERENCES ayah(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topic(id) ON DELETE CASCADE,
  relevance_score FLOAT NOT NULL DEFAULT 1.0,
  PRIMARY KEY (ayah_id, topic_id)
);

-- Cached Reflection Table
CREATE TABLE IF NOT EXISTS cached_reflection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_hash TEXT NOT NULL UNIQUE,
  response_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User Bookmarks/Reflections (User-Specific)
CREATE TABLE IF NOT EXISTS user_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  ayah_id UUID REFERENCES ayah(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, ayah_id)
);

-- Verse Companion Guidance (Pedagogical reflections for Kids, Teen, Family)
CREATE TABLE IF NOT EXISTS verse_companion_guidance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ayah_id UUID REFERENCES ayah(id) ON DELETE CASCADE,
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

-- Linguistic Roots Table (Etymology, imagery, depth)
CREATE TABLE IF NOT EXISTS linguistic_root (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ayah_id UUID REFERENCES ayah(id) ON DELETE CASCADE,
  term_arabic TEXT NOT NULL,
  term_transliterated TEXT NOT NULL,
  root_letters TEXT NOT NULL,
  language_code TEXT NOT NULL CHECK (language_code IN ('en', 'sv', 'fr', 'ar')),
  literal_imagery TEXT NOT NULL,
  spiritual_depth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RPC Function for vector search
CREATE OR REPLACE FUNCTION match_verses(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id UUID,
  surah_id UUID,
  ayah_number INTEGER,
  text_uthmani TEXT,
  text_clean TEXT,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    ayah.id,
    ayah.surah_id,
    ayah.ayah_number,
    ayah.text_uthmani,
    ayah.text_clean,
    1 - (ayah.embedding <=> query_embedding) AS similarity
  FROM ayah
  WHERE 1 - (ayah.embedding <=> query_embedding) > match_threshold
  ORDER BY ayah.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Enable RLS
ALTER TABLE surah ENABLE ROW LEVEL SECURITY;
ALTER TABLE ayah ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation ENABLE ROW LEVEL SECURITY;
ALTER TABLE tafsir ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic ENABLE ROW LEVEL SECURITY;
ALTER TABLE ayah_topic ENABLE ROW LEVEL SECURITY;
ALTER TABLE cached_reflection ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE verse_companion_guidance ENABLE ROW LEVEL SECURITY;
ALTER TABLE linguistic_root ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Public read for content, owner access for user data)
CREATE POLICY "Allow public read-only access to surah" ON surah FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access to ayah" ON ayah FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access to translation" ON translation FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access to tafsir" ON tafsir FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access to topic" ON topic FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access to ayah_topic" ON ayah_topic FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access to cached_reflection" ON cached_reflection FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access to verse_companion_guidance" ON verse_companion_guidance FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access to linguistic_root" ON linguistic_root FOR SELECT USING (true);

-- User-specific tables policies
CREATE POLICY "Users can insert their own bookmarks" ON user_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own bookmarks" ON user_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own bookmarks" ON user_bookmarks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bookmarks" ON user_bookmarks FOR DELETE USING (auth.uid() = user_id);
