import { createClient } from '@supabase/supabase-js';
import { SEED_FIXTURES } from './seedFixtures';

// Default to mock URLs if env is not provided during build
const supabaseUrl = process.env.SUPABASE_URL || 'https://mock.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'mock-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Fallback logic enabled if the URL is the mock one or missing
const useMock = !supabaseUrl || supabaseUrl === 'https://mock.supabase.co';

export type LanguageCode = 'en' | 'sv' | 'fr' | 'ar';

export interface RetrievedTranslation {
  id?: string;
  language_code: string;
  text: string;
  source: string;
}

export interface RetrievedTafsir {
  id?: string;
  scholar_name: string;
  work_title: string;
  text: string;
  language_code: string;
}

export interface RetrievedAyahMatch {
  id: string; // e.g., "94:5"
  ayah_id: string;
  relevance_score?: number;
  surah: {
    number: number;
    name_arabic: string;
    name_english: string;
    revelation_place: string;
  };
  ayah: {
    ayah_number: number;
    text_uthmani: string;
    text_clean: string;
  };
  translations: RetrievedTranslation[];
  selectedTranslation: RetrievedTranslation;
  tafsirs: RetrievedTafsir[];
  topic?: {
    slug: string;
    title: string;
    life_domain: string;
  };
}

/**
 * Extracts and prioritizes the translation record for the requested language,
 * falling back gracefully to English ('en') or first available.
 */
function resolveTranslation(
  translations: RetrievedTranslation[] = [],
  preferredLanguage: LanguageCode = 'en'
): { selected: RetrievedTranslation; orderedList: RetrievedTranslation[] } {
  if (!translations || translations.length === 0) {
    const fallback: RetrievedTranslation = {
      language_code: 'en',
      text: '',
      source: 'Saheeh International',
    };
    return { selected: fallback, orderedList: [fallback] };
  }

  const exactMatch = translations.find((t) => t.language_code === preferredLanguage);
  const englishFallback = translations.find((t) => t.language_code === 'en');
  const selected = exactMatch || englishFallback || translations[0];

  // Re-order so selected translation appears first
  const orderedList = [
    selected,
    ...translations.filter((t) => t !== selected),
  ];

  return { selected, orderedList };
}

/**
 * Prioritizes tafsir records matching the requested language_code (e.g., 'ar' for Tafsir Al-Muyassar / Ibn Kathir).
 */
function resolveTafsirs(
  tafsirs: RetrievedTafsir[] = [],
  preferredLanguage: LanguageCode = 'en'
): RetrievedTafsir[] {
  if (!tafsirs || tafsirs.length === 0) return [];
  const exactMatches = tafsirs.filter((t) => t.language_code === preferredLanguage);
  const otherMatches = tafsirs.filter((t) => t.language_code !== preferredLanguage);
  return [...exactMatches, ...otherMatches];
}

/**
 * Simulates: ORDER BY relevance_score DESC, RANDOM() LIMIT limit
 * Allows varied relevant results across consecutive calls while preserving relevance hierarchy.
 */
function applyScoreAndRandomOrder<T extends { relevance_score: number }>(
  items: T[],
  limit: number = 3
): T[] {
  if (items.length <= limit) {
    // Add small random shuffle if tied
    return [...items].sort(() => 0.5 - Math.random());
  }

  // Group candidates into scoring tiers (e.g. within 15% range)
  // and randomize items within the top tiers
  const decorated = items.map((item) => ({
    item,
    // Add a randomized jitter between 0 and 0.25 to the normalized score
    jitteredScore: item.relevance_score + Math.random() * 0.25,
  }));

  decorated.sort((a, b) => b.jitteredScore - a.jitteredScore);
  return decorated.slice(0, limit).map((d) => d.item);
}

export class RetrievalService {
  /**
   * Explicitly queries Supabase `tafsir` table for `language_code = language` (e.g., 'ar' for Tafsir Al-Muyassar / Ibn Kathir).
   */
  static async fetchTafsirByLanguage(
    language: LanguageCode = 'ar',
    limit: number = 10
  ): Promise<RetrievedTafsir[]> {
    if (useMock) {
      return SEED_FIXTURES.flatMap((f) => f.tafsirs).filter((t) => t.language_code === language);
    }

    try {
      const { data, error } = await supabase
        .from('tafsir')
        .select('id, scholar_name, work_title, text, language_code')
        .eq('language_code', language)
        .limit(limit);

      if (error || !data) return [];
      return data as RetrievedTafsir[];
    } catch {
      return [];
    }
  }

  /**
   * Stage 1: Query ayah_topic and live ayah/translation tables for categorical/emotional matches.
   * Supports language parameter ('en' | 'sv' | 'fr' | 'ar') with fallback to 'en'.
   * Applies score-based sorting + dynamic randomization (ORDER BY relevance_score DESC, RANDOM() LIMIT 3).
   */
  static async findDirectMatches(
    emotionId?: string,
    domainId?: string,
    language: LanguageCode = 'en'
  ): Promise<RetrievedAyahMatch[]> {
    if (useMock) {
      return this.findDirectMatchesFallback(emotionId, domainId, language);
    }

    try {
      let query = supabase
        .from('ayah_topic')
        .select(`
          relevance_score,
          topic!inner(
            id,
            slug,
            title,
            life_domain
          ),
          ayah!inner(
            id,
            ayah_number,
            text_uthmani,
            text_clean,
            surah!inner(
              number,
              name_arabic,
              name_english,
              revelation_place
            ),
            translation(
              id,
              language_code,
              text,
              source
            ),
            tafsir(
              id,
              scholar_name,
              work_title,
              text,
              language_code
            )
          )
        `);

      if (emotionId) {
        query = query.ilike('topic.slug', `%${emotionId.toLowerCase()}%`);
      }
      if (domainId) {
        query = query.eq('topic.life_domain', domainId);
      }

      // Fetch top candidates from live database
      const { data, error } = await query
        .order('relevance_score', { ascending: false })
        .limit(15);

      if (error || !data || data.length === 0) {
        return this.findDirectMatchesFallback(emotionId, domainId, language);
      }

      // Transform rows
      interface LiveTopicRow {
        relevance_score: number;
        topic: { slug: string; title: string; life_domain: string };
        ayah: {
          id: string;
          ayah_number: number;
          text_uthmani: string;
          text_clean: string;
          surah: { number: number; name_arabic: string; name_english: string; revelation_place: string };
          translation: RetrievedTranslation[];
          tafsir: RetrievedTafsir[];
        };
      }

      const rows = data as unknown as LiveTopicRow[];

      const candidates = rows.map((r) => {
        const { selected, orderedList } = resolveTranslation(r.ayah.translation, language);
        return {
          id: `${r.ayah.surah.number}:${r.ayah.ayah_number}`,
          ayah_id: `${r.ayah.surah.number}:${r.ayah.ayah_number}`,
          relevance_score: r.relevance_score ?? 1.0,
          surah: r.ayah.surah,
          ayah: {
            ayah_number: r.ayah.ayah_number,
            text_uthmani: r.ayah.text_uthmani,
            text_clean: r.ayah.text_clean,
          },
          translations: orderedList,
          selectedTranslation: selected,
          tafsirs: resolveTafsirs(r.ayah.tafsir || [], language),
          topic: r.topic,
        };
      });

      // Apply dynamic randomization: ORDER BY relevance_score DESC, RANDOM() LIMIT 3
      return applyScoreAndRandomOrder(candidates, 3);
    } catch (err) {
      console.warn('[RetrievalService] Direct matches live query error, using fallback:', err);
      return this.findDirectMatchesFallback(emotionId, domainId, language);
    }
  }

  /**
   * Stage 3: Semantic & live table search across ayah and translation tables.
   * Supports language parameter ('en' | 'sv' | 'fr') with fallback to 'en'.
   * Applies score-based sorting + dynamic randomization (ORDER BY relevance_score DESC, RANDOM() LIMIT 3).
   */
  static async findVectorMatches(
    queryText: string,
    language: LanguageCode = 'en'
  ): Promise<RetrievedAyahMatch[]> {
    if (useMock) {
      return this.findVectorMatchesFallback(queryText, language);
    }

    try {
      const normalized = (queryText || '').toLowerCase().trim();
      const tokens = normalized.split(/[\s,.'"-]+/).filter((t) => t.length > 2);

      // Query live translation and ayah tables
      // Target translations in the requested language or English
      let dbQuery = supabase
        .from('translation')
        .select(`
          id,
          language_code,
          text,
          source,
          ayah!inner(
            id,
            ayah_number,
            text_uthmani,
            text_clean,
            surah!inner(
              number,
              name_arabic,
              name_english,
              revelation_place
            ),
            translation(
              id,
              language_code,
              text,
              source
            ),
            tafsir(
              id,
              scholar_name,
              work_title,
              text,
              language_code
            ),
            ayah_topic(
              relevance_score,
              topic(
                slug,
                title,
                life_domain
              )
            )
          )
        `)
        .in('language_code', [language, 'en'])
        .limit(30);

      if (tokens.length > 0) {
        // Search text containing key tokens
        const orConditions = tokens.slice(0, 4).map((t) => `text.ilike.%${t}%`).join(',');
        dbQuery = dbQuery.or(orConditions);
      }

      const { data, error } = await dbQuery;

      if (error || !data || data.length === 0) {
        return this.findVectorMatchesFallback(queryText, language);
      }

      interface LiveTranslationRow {
        id: string;
        language_code: string;
        text: string;
        source: string;
        ayah: {
          id: string;
          ayah_number: number;
          text_uthmani: string;
          text_clean: string;
          surah: { number: number; name_arabic: string; name_english: string; revelation_place: string };
          translation: RetrievedTranslation[];
          tafsir: RetrievedTafsir[];
          ayah_topic?: Array<{ relevance_score: number; topic: { slug: string; title: string; life_domain: string } }>;
        };
      }

      const rows = data as unknown as LiveTranslationRow[];

      // Deduplicate by ayah (surah:ayah_number) and calculate relevance score
      const ayahMap = new Map<string, { candidate: RetrievedAyahMatch; baseScore: number }>();

      for (const row of rows) {
        const key = `${row.ayah.surah.number}:${row.ayah.ayah_number}`;
        let score = 5;

        const rowText = row.text.toLowerCase();
        if (rowText.includes(normalized)) {
          score += 30;
        }
        for (const t of tokens) {
          if (rowText.includes(t)) score += 10;
        }
        if (row.language_code === language) {
          score += 5;
        }

        const existing = ayahMap.get(key);
        if (existing) {
          existing.baseScore += score;
        } else {
          const { selected, orderedList } = resolveTranslation(row.ayah.translation, language);
          const firstTopic = row.ayah.ayah_topic?.[0];
          ayahMap.set(key, {
            baseScore: score,
            candidate: {
              id: key,
              ayah_id: key,
              relevance_score: score,
              surah: row.ayah.surah,
              ayah: {
                ayah_number: row.ayah.ayah_number,
                text_uthmani: row.ayah.text_uthmani,
                text_clean: row.ayah.text_clean,
              },
              translations: orderedList,
              selectedTranslation: selected,
              tafsirs: resolveTafsirs(row.ayah.tafsir || [], language),
              topic: firstTopic?.topic,
            },
          });
        }
      }

      const candidates = Array.from(ayahMap.values()).map((v) => ({
        ...v.candidate,
        relevance_score: v.baseScore,
      }));

      // Dynamic randomization among top matching candidates:
      // ORDER BY relevance_score DESC, RANDOM() LIMIT 3
      return applyScoreAndRandomOrder(candidates, 3);
    } catch (err) {
      console.warn('[RetrievalService] Vector matches live query error, using fallback:', err);
      return this.findVectorMatchesFallback(queryText, language);
    }
  }

  /**
   * Fallback for direct matches using verified seed fixtures.
   */
  private static findDirectMatchesFallback(
    emotionId?: string,
    domainId?: string,
    language: LanguageCode = 'en'
  ): RetrievedAyahMatch[] {
    const filtered = SEED_FIXTURES.filter(
      (f) =>
        (emotionId && f.topic.slug.toLowerCase().includes(emotionId.toLowerCase())) ||
        (domainId && f.topic.life_domain === domainId)
    );

    const pool = filtered.length > 0 ? filtered : SEED_FIXTURES;

    const candidates = pool.map((f) => {
      const { selected, orderedList } = resolveTranslation(f.translations, language);
      return {
        id: `${f.surah.number}:${f.ayah.ayah_number}`,
        ayah_id: `${f.surah.number}:${f.ayah.ayah_number}`,
        relevance_score: 1.0,
        surah: f.surah,
        ayah: f.ayah,
        translations: orderedList,
        selectedTranslation: selected,
        tafsirs: resolveTafsirs(f.tafsirs, language),
        topic: f.topic,
      };
    });

    return applyScoreAndRandomOrder(candidates, 3);
  }

  /**
   * Fallback for semantic matches using verified seed fixtures.
   */
  private static findVectorMatchesFallback(
    queryText: string,
    language: LanguageCode = 'en'
  ): RetrievedAyahMatch[] {
    const normalized = (queryText || '').toLowerCase().trim();
    const tokens = normalized.split(/[\s,.'"-]+/).filter((t) => t.length > 2);

    const scored = SEED_FIXTURES.map((f) => {
      let score = 0;
      const title = f.topic.title.toLowerCase();
      const slug = f.topic.slug.toLowerCase();
      const transl = f.translations.map((t) => t.text.toLowerCase()).join(' ');
      const arabicAyah = `${f.ayah.text_clean || ''} ${f.ayah.text_uthmani || ''} ${f.surah.name_arabic || ''}`;

      if (title.includes(normalized) || transl.includes(normalized) || arabicAyah.includes(normalized)) {
        score += 35;
      }
      for (const token of tokens) {
        if (title.includes(token)) score += 12;
        if (slug.includes(token)) score += 8;
        if (transl.includes(token)) score += 5;
        if (arabicAyah.includes(token)) score += 15;
      }

      const { selected, orderedList } = resolveTranslation(f.translations, language);

      return {
        id: `${f.surah.number}:${f.ayah.ayah_number}`,
        ayah_id: `${f.surah.number}:${f.ayah.ayah_number}`,
        relevance_score: Math.max(score, 1),
        surah: f.surah,
        ayah: f.ayah,
        translations: orderedList,
        selectedTranslation: selected,
        tafsirs: resolveTafsirs(f.tafsirs, language),
        topic: f.topic,
      };
    });

    const matches = scored.filter((s) => s.relevance_score > 1);
    const candidates = matches.length > 0 ? matches : scored;

    return applyScoreAndRandomOrder(candidates, 3);
  }

  /**
   * Stage 2: Read from cached_reflection.
   */
  static async getCachedReflection(queryHash: string) {
    if (useMock) return null;

    try {
      const { data, error } = await supabase
        .from('cached_reflection')
        .select('response_json')
        .eq('query_hash', queryHash)
        .maybeSingle();

      if (error) return null;
      return data?.response_json || null;
    } catch {
      return null;
    }
  }

  /**
   * Stage 4: Write to cached_reflection.
   */
  static async setCachedReflection(queryHash: string, responseData: any) {
    if (useMock) return;

    try {
      const { error } = await supabase
        .from('cached_reflection')
        .insert({ query_hash: queryHash, response_json: responseData });

      if (error) {
        console.error('[RetrievalService] Failed to cache reflection:', error);
      }
    } catch (err) {
      console.warn('[RetrievalService] Error caching reflection:', err);
    }
  }
}
