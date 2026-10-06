import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { RetrievalService, LanguageCode } from '../../../lib/db/retrievalService';
import { GoogleGenAI } from '@google/genai';

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

async function hashString(str: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'mock_key' });

/**
 * Queries the Supabase `tafsir` table for `language_code = 'ar'` (e.g. Tafsir Al-Muyassar or Ibn Kathir)
 * when Arabic (`ar`) localization is active.
 */
async function queryArabicTafsirForMatches(matches: any[], lang: LanguageCode) {
  if (lang !== 'ar' || !matches || matches.length === 0) return matches;

  if (!useMock) {
    try {
      const { data: arabicTafsirs, error } = await supabase
        .from('tafsir')
        .select('id, ayah_id, scholar_name, work_title, text, language_code')
        .eq('language_code', 'ar')
        .in('scholar_name', ['Al-Muyassar', 'التفسير الميسر', 'Ibn Kathir', 'ابن كثير', "Al-Sa'di"])
        .limit(30);

      if (!error && arabicTafsirs && arabicTafsirs.length > 0) {
        return matches.map((match) => {
          const matchingAr = arabicTafsirs.filter(
            (t: any) => t.ayah_id === match.ayah_id || t.ayah_id === match.id
          );
          return {
            ...match,
            tafsirs: matchingAr.length > 0 ? [...matchingAr, ...(match.tafsirs || [])] : match.tafsirs,
          };
        });
      }
    } catch (err) {
      console.warn('[Guidance API] Supabase Arabic tafsir query warning:', err);
    }
  }

  // Ensure authentic Arabic tafsir entries are prioritized and filter out any corrupted/duplicate records
  return matches.map((match) => {
    const existingTafsirs = Array.isArray(match.tafsirs) ? match.tafsirs : [];
    const validTafsirs = existingTafsirs.filter((t: any) => {
      if (!t || !t.text) return false;
      const trimmed = t.text.trim();
      // Must not equal raw Quranic text or translation
      if (trimmed === match.ayah?.text_uthmani?.trim()) return false;
      if (trimmed === match.ayah?.text_clean?.trim()) return false;
      if (trimmed === match.selectedTranslation?.text?.trim()) return false;
      return true;
    });

    const arabicList = validTafsirs.filter((t: any) => t.language_code === 'ar');
    const otherList = validTafsirs.filter((t: any) => t.language_code !== 'ar');

    return {
      ...match,
      tafsirs: [...arabicList, ...otherList],
    };
  });
}

/**
 * Enriches all matches so that the active user language (e.g. 'fr' or 'sv') is guaranteed
 * to have its authentic translation and tafsir populated directly from Supabase.
 */
async function enrichMatchesForLanguage(matches: any[], lang: LanguageCode) {
  if (!matches || matches.length === 0) return matches;

  if (lang !== 'en' && !useMock) {
    try {
      for (const match of matches) {
        const hasLangTrans = match.translations?.some(
          (t: any) => t.language_code === lang && t.text && t.text.trim().length > 0
        );

        if (!hasLangTrans) {
          const parts = String(match.id || match.ayah_id || '').split(':');
          const surahNum = Number(parts[0]);
          const ayahNum = Number(parts[1]);

          if (surahNum && ayahNum) {
            const { data: surah } = await supabase.from('surah').select('id').eq('number', surahNum).single();
            if (surah) {
              const { data: ayah } = await supabase.from('ayah').select('id').eq('surah_id', surah.id).eq('ayah_number', ayahNum).single();
              if (ayah) {
                const { data: dbTranslations } = await supabase
                  .from('translation')
                  .select('id, language_code, text, source')
                  .eq('ayah_id', ayah.id)
                  .eq('language_code', lang);

                if (dbTranslations && dbTranslations.length > 0) {
                  const found = dbTranslations[0];
                  match.translations = [found, ...(match.translations || [])];
                  match.selectedTranslation = found;
                }

                // Also fetch localized tafsir
                const { data: dbTafsirs } = await supabase
                  .from('tafsir')
                  .select('id, scholar_name, work_title, text, language_code, source_type, source_reference, original_arabic_raw, verification_status')
                  .eq('ayah_id', ayah.id)
                  .eq('language_code', lang);

                if (dbTafsirs && dbTafsirs.length > 0) {
                  match.tafsirs = [...dbTafsirs, ...(match.tafsirs || [])];
                }
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('[Guidance API] Error enriching matches for language:', err);
    }
  }

  return queryArabicTafsirForMatches(matches, lang);
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const langParam = (searchParams.get('lang') || searchParams.get('language') || 'en') as LanguageCode;
  const query = searchParams.get('query') || searchParams.get('q') || '';
  const emotionId = searchParams.get('emotionId') || undefined;
  const lifeDomainId = searchParams.get('lifeDomainId') || undefined;

  const language: LanguageCode = ['en', 'sv', 'fr', 'ar'].includes(langParam) ? langParam : 'en';

  if (!query && !emotionId && !lifeDomainId) {
    const arabicTafsirs = language === 'ar' ? await RetrievalService.fetchTafsirByLanguage('ar', 10) : [];
    return NextResponse.json({
      status: 'ready',
      language,
      arabicTafsirs,
    });
  }

  const vectorMatches = await RetrievalService.findVectorMatches(query, language);
  const enrichedMatches = await enrichMatchesForLanguage(vectorMatches, language);

  return NextResponse.json({
    status: 'matched',
    source: 'semantic_search',
    language,
    matches: enrichedMatches,
  });
}

export async function POST(req: NextRequest) {
  try {
    const urlLang = req.nextUrl.searchParams.get('lang') as LanguageCode | null;
    const body = (await req.json()) as {
      query?: string;
      emotionId?: string;
      lifeDomainId?: string;
      forceLLM?: boolean;
      language?: LanguageCode;
      lang?: LanguageCode;
    };

    const { query, emotionId, lifeDomainId, forceLLM } = body;
    const rawLang = urlLang || body.lang || body.language || 'en';
    const language: LanguageCode = ['en', 'sv', 'fr', 'ar'].includes(rawLang) ? rawLang : 'en';

    if (!query && !emotionId && !lifeDomainId) {
      return NextResponse.json({ error: 'Missing query parameters' }, { status: 400 });
    }

    // Stage 1: Direct Category Lookup (skipped when forceLLM=true)
    if (!forceLLM && (emotionId || lifeDomainId)) {
      const directMatches = await RetrievalService.findDirectMatches(
        emotionId,
        lifeDomainId,
        language
      );
      if (directMatches && directMatches.length > 0) {
        const enrichedMatches = await enrichMatchesForLanguage(directMatches, language);
        return NextResponse.json({
          status: 'matched',
          source: 'direct_lookup',
          language,
          matches: enrichedMatches,
        });
      }
    }

    // Stage 2: Cache Check (skipped when forceLLM=true)
    const queryHash = await hashString(`${query || ''}_${language}`);
    if (!forceLLM) {
      const cached = await RetrievalService.getCachedReflection(queryHash);
      if (cached) {
        return NextResponse.json({
          status: 'matched',
          source: 'cache',
          language,
          data: cached,
        });
      }
    }

    // Stage 3: Semantic Retrieval (skipped when forceLLM=true)
    if (!forceLLM) {
      const vectorMatches = await RetrievalService.findVectorMatches(query || '', language);
      const isLowConfidence = !vectorMatches || vectorMatches.length === 0;

      if (!isLowConfidence) {
        const enrichedMatches = await enrichMatchesForLanguage(vectorMatches, language);
        return NextResponse.json({
          status: 'matched',
          source: 'semantic_search',
          language,
          matches: enrichedMatches,
        });
      }
    }

    // Stage 4: Bounded Gemini Synthesis
    try {
      const promptInstruction =
        language === 'ar'
          ? `حلل هذا الاستفسار للتدبر القرآني باللغة العربية الفصحى: "${query}". أجب فقط بصيغة JSON صالحة بهذا الهيكل الدقيق: {"reasoning": "string", "selectedAyahIds": [1, 2], "reflectionPrompt": "string"}`
          : `Analyze this query for Quranic reflection: "${query}". Respond ONLY with valid JSON in this exact structure: {"reasoning": "string", "selectedAyahIds": [1, 2], "reflectionPrompt": "string"}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: promptInstruction,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text || '{}';
      const parsedData = JSON.parse(responseText);

      // Cache the generated synthesis
      await RetrievalService.setCachedReflection(queryHash, parsedData);

      return NextResponse.json({
        status: 'matched',
        source: 'gemini_synthesis',
        language,
        data: parsedData,
      });
    } catch (err) {
      console.error('Gemini API Error:', err);
      const fallbackMatches = await RetrievalService.findVectorMatches(query || '', language);
      const enrichedFallback = await enrichMatchesForLanguage(fallbackMatches, language);
      return NextResponse.json({
        status: 'matched',
        source: 'offline_fallback',
        language,
        indicator: language === 'ar' ? 'وضع عدم الاتصال / التفسير الموثق' : 'Offline / High Traffic Mode',
        matches: enrichedFallback,
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
