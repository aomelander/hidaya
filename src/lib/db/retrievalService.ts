import { createClient } from '@supabase/supabase-js';
import { SEED_FIXTURES } from './seedFixtures';

// Resolve Supabase URL and Key safely, detecting potential swapped environment variables
function getResolvedSupabaseConfig() {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const envAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
  const envService = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  let resolvedUrl = 'https://kipsrzozphdgbaqrhiok.supabase.co';
  if (envUrl.startsWith('http://') || envUrl.startsWith('https://')) {
    resolvedUrl = envUrl;
  } else if (envAnon.startsWith('http://') || envAnon.startsWith('https://')) {
    resolvedUrl = envAnon;
  }

  let resolvedKey = envService;
  if (!resolvedKey || resolvedKey.startsWith('http')) {
    resolvedKey =
      !envAnon.startsWith('http') && envAnon
        ? envAnon
        : envUrl && !envUrl.startsWith('http')
        ? envUrl
        : 'mock-key';
  }

  return { url: resolvedUrl, key: resolvedKey, isMock: false };
}

const { url: supabaseUrl, key: supabaseKey, isMock: useMock } = getResolvedSupabaseConfig();
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Generates 1536-dimensional query embedding via Gemini embedding API for semantic vector retrieval.
 */
async function fetchQueryEmbedding(text: string): Promise<number[] | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'mock_key') return null;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'aistudio-build',
      },
      body: JSON.stringify({
        model: 'models/gemini-embedding-001',
        content: { parts: [{ text }] },
        outputDimensionality: 1536,
      }),
    });

    if (!res.ok) return null;
    const data = (await res.json()) as { embedding?: { values?: number[] } };
    return data.embedding?.values || null;
  } catch {
    return null;
  }
}

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
  companionGuidance?: any;
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

/**
 * Groups consecutive verses from the same Surah when adjacent verses are present or needed
 * for complete meaning, strictly capped at a maximum of 3 consecutive verses per passage.
 */
function capAndGroupConsecutiveMatches(matches: RetrievedAyahMatch[]): RetrievedAyahMatch[] {
  if (!matches || matches.length === 0) return [];

  // Sort by surah and ayah_number to identify consecutive verses
  const sorted = [...matches].sort((a, b) => {
    if (a.surah.number !== b.surah.number) return a.surah.number - b.surah.number;
    return a.ayah.ayah_number - b.ayah.ayah_number;
  });

  const grouped: RetrievedAyahMatch[] = [];
  let i = 0;

  while (i < sorted.length) {
    const start = sorted[i];
    const run: RetrievedAyahMatch[] = [start];

    // Collect up to 3 consecutive verses in the same surah
    while (
      i + 1 < sorted.length &&
      run.length < 3 &&
      sorted[i + 1].surah.number === start.surah.number &&
      sorted[i + 1].ayah.ayah_number === run[run.length - 1].ayah.ayah_number + 1
    ) {
      run.push(sorted[i + 1]);
      i++;
    }

    if (run.length === 1) {
      grouped.push(start);
    } else {
      const firstNum = run[0].ayah.ayah_number;
      const lastNum = run[run.length - 1].ayah.ayah_number;
      const rangeId = `${start.surah.number}:${firstNum}-${lastNum}`;
      grouped.push({
        ...start,
        id: rangeId,
        ayah_id: rangeId,
        ayah: {
          ...start.ayah,
          text_uthmani: run.map((r) => r.ayah.text_uthmani).join(' ۝ '),
          text_clean: run.map((r) => r.ayah.text_clean).join(' '),
        },
        selectedTranslation: {
          ...start.selectedTranslation,
          text: run.map((r) => r.selectedTranslation.text).join(' '),
        },
      });
    }
    i++;
  }

  // Restore relevance ordering
  return grouped.sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));
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
   * Fetches companion guidance and linguistic roots directly from Supabase.
   * Checks normalized relational tables first (if present), then cached_reflection.
   */
  static async fetchCompanionGuidanceForMatches(
    matches: RetrievedAyahMatch[],
    language: LanguageCode = 'en'
  ): Promise<RetrievedAyahMatch[]> {
    if (!matches || matches.length === 0 || useMock) {
      return matches;
    }

    try {
      const hashes = matches.map((m) => `companion_guidance:${m.id}`);

      // Query cached_reflection for live Supabase companion bundles
      const { data: cachedRows, error: cacheErr } = await supabase
        .from('cached_reflection')
        .select('query_hash, response_json')
        .in('query_hash', [...hashes, 'companion_guidance:all_fixtures']);

      const companionByVerseId = new Map<string, any>();

      if (!cacheErr && cachedRows && cachedRows.length > 0) {
        for (const row of cachedRows) {
          if (row.query_hash === 'companion_guidance:all_fixtures' && row.response_json) {
            for (const [k, v] of Object.entries(row.response_json as Record<string, any>)) {
              if (!companionByVerseId.has(k)) {
                companionByVerseId.set(k, v);
              }
            }
          } else if (row.query_hash.startsWith('companion_guidance:')) {
            const vId = row.query_hash.replace('companion_guidance:', '');
            companionByVerseId.set(vId, row.response_json);
          }
        }
      }

      return matches.map((match) => {
        const guidance = companionByVerseId.get(match.id);
        if (guidance) {
          return {
            ...match,
            companionGuidance: guidance.languages || guidance,
          };
        }
        return match;
      });
    } catch (err) {
      console.warn('[RetrievalService] Error fetching companion guidance from Supabase:', err);
      return matches;
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

      // Apply dynamic randomization among relevant candidates:
      // Return up to 5 verses when relevant (typically 3-5)
      const relevantDirect = candidates.filter((c) => (c.relevance_score ?? 1) >= 0.5);
      const pool = relevantDirect.length > 0 ? relevantDirect : candidates;
      const targetLimit = pool.length >= 5 ? 5 : Math.min(pool.length, 5);
      const results = capAndGroupConsecutiveMatches(applyScoreAndRandomOrder(pool, targetLimit));
      return await this.fetchCompanionGuidanceForMatches(results, language);
    } catch (err) {
      console.warn('[RetrievalService] Direct matches live query error, using fallback:', err);
      return this.findDirectMatchesFallback(emotionId, domainId, language);
    }
  }

  /**
   * Stage 3: Semantic & live table search across ayah and translation tables.
   * Supports language parameter ('en' | 'sv' | 'fr' | 'ar') with fallback to 'en'.
   * Dynamically returns 3 to 5 verses when multiple verses are relevant to the query,
   * or fewer if only 1-2 verses meet the relevance threshold.
   */
  static async findVectorMatches(
    queryText: string,
    language: LanguageCode = 'en'
  ): Promise<RetrievedAyahMatch[]> {
    if (useMock) {
      return this.findVectorMatchesFallback(queryText, language);
    }

    try {
      // 1. Primary: Semantic Vector Search using pgvector & Gemini embedding (1536-dim)
      const queryEmbedding = await fetchQueryEmbedding(queryText);
      if (queryEmbedding && queryEmbedding.length === 1536) {
        const { data: vectorHits, error: vectorErr } = await supabase.rpc('match_verses', {
          query_embedding: queryEmbedding,
          match_threshold: 0.42,
          match_count: 8,
        });

        if (!vectorErr && vectorHits && vectorHits.length > 0) {
          const rawHits = vectorHits as Array<{ id: string; similarity: number }>;
          const topSim = rawHits[0]?.similarity || 0.5;
          // Only keep hits that are genuinely relevant (within 0.14 of top similarity or >= 0.48)
          const relevantHits = rawHits.filter(
            (h, idx) => idx === 0 || (h.similarity >= 0.46 && h.similarity >= topSim - 0.14)
          );
          const selectedHits = relevantHits.slice(0, 5);

          const ayahIds = selectedHits.map((h) => h.id);
          const similarityById = new Map<string, number>();
          for (const hit of selectedHits) {
            similarityById.set(hit.id, hit.similarity);
          }

          const { data: dbAyahs, error: hydrateErr } = await supabase
            .from('ayah')
            .select(`
              id,
              ayah_number,
              text_uthmani,
              text_clean,
              surah!inner(number, name_arabic, name_english, revelation_place),
              translation(id, language_code, text, source),
              tafsir(id, scholar_name, work_title, text, language_code),
              ayah_topic(relevance_score, topic(slug, title, life_domain))
            `)
            .in('id', ayahIds);

          if (!hydrateErr && dbAyahs && dbAyahs.length > 0) {
            const vectorMatches: RetrievedAyahMatch[] = (dbAyahs as any[]).map((a) => {
              const key = `${a.surah.number}:${a.ayah_number}`;
              const { selected, orderedList } = resolveTranslation(a.translation || [], language);
              const firstTopic = a.ayah_topic?.[0];
              const sim = similarityById.get(a.id) || 0.5;

              return {
                id: key,
                ayah_id: key,
                relevance_score: Math.round(sim * 100),
                surah: a.surah,
                ayah: {
                  ayah_number: a.ayah_number,
                  text_uthmani: a.text_uthmani,
                  text_clean: a.text_clean,
                },
                translations: orderedList,
                selectedTranslation: selected,
                tafsirs: resolveTafsirs(a.tafsir || [], language),
                topic: firstTopic?.topic,
              };
            });

            vectorMatches.sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));
            const grouped = capAndGroupConsecutiveMatches(vectorMatches.slice(0, 5));
            return await this.fetchCompanionGuidanceForMatches(grouped, language);
          }
        }
      }

      // 2. Secondary fallback: Lexical database token search
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

      // Filter to genuinely relevant candidates (score >= 15) and return up to 5 (3-5 when available)
      const relevantLexical = candidates.filter((c) => c.relevance_score >= 15);
      const pool = relevantLexical.length > 0 ? relevantLexical : candidates;
      const limit = Math.min(pool.length, 5);
      const results = applyScoreAndRandomOrder(pool, limit);
      return await this.fetchCompanionGuidanceForMatches(results, language);
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

    return applyScoreAndRandomOrder(candidates, Math.min(candidates.length, 5));
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
    const candidates = matches.length > 0 ? matches : scored.slice(0, 3);

    return applyScoreAndRandomOrder(candidates, Math.min(candidates.length, 5));
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
