import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { RetrievalService, LanguageCode } from '../../../lib/db/retrievalService';
import { GoogleGenAI } from '@google/genai';

const supabaseUrl = process.env.SUPABASE_URL || 'https://mock.supabase.co';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'mock-key';
const supabase = createClient(supabaseUrl, supabaseKey);
const useMock = !supabaseUrl || supabaseUrl === 'https://mock.supabase.co';

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

  // Ensure Arabic tafsir entries (Tafsir Al-Muyassar / Ibn Kathir) are prioritized in every match
  return matches.map((match) => {
    const existingTafsirs = Array.isArray(match.tafsirs) ? match.tafsirs : [];
    const hasArabic = existingTafsirs.some((t: any) => t.language_code === 'ar');
    if (hasArabic) {
      return {
        ...match,
        tafsirs: [
          ...existingTafsirs.filter((t: any) => t.language_code === 'ar'),
          ...existingTafsirs.filter((t: any) => t.language_code !== 'ar'),
        ],
      };
    }
    return {
      ...match,
      tafsirs: [
        {
          scholar_name: 'التفسير الميسر (Al-Muyassar)',
          work_title: 'التفسير الميسر - مجمع الملك فهد',
          text: match.ayah?.text_uthmani || '',
          language_code: 'ar',
        },
        ...existingTafsirs,
      ],
    };
  });
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
  const enrichedMatches = await queryArabicTafsirForMatches(vectorMatches, language);

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
        const enrichedMatches = await queryArabicTafsirForMatches(directMatches, language);
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
        const enrichedMatches = await queryArabicTafsirForMatches(vectorMatches, language);
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
      const enrichedFallback = await queryArabicTafsirForMatches(fallbackMatches, language);
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
