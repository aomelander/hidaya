import { NextRequest, NextResponse } from 'next/server';
import { RetrievalService } from '../../../lib/db/retrievalService';
import { GoogleGenAI } from '@google/genai';

// A simple polyfill for crypto if running in an edge environment that requires web crypto
// For Node.js/Next.js, we can use standard web crypto available globally as `crypto`
async function hashString(str: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'mock_key' });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      query?: string;
      emotionId?: string;
      lifeDomainId?: string;
      forceLLM?: boolean;
      language?: 'en' | 'sv' | 'fr';
    };
    const { query, emotionId, lifeDomainId, forceLLM, language = 'en' } = body;
    
    if (!query && !emotionId && !lifeDomainId) {
      return NextResponse.json({ error: 'Missing query parameters' }, { status: 400 });
    }

    // Stage 1: Direct Category Lookup (skipped when forceLLM=true)
    if (!forceLLM && (emotionId || lifeDomainId)) {
      const directMatches = await RetrievalService.findDirectMatches(emotionId, lifeDomainId, language);
      if (directMatches && directMatches.length > 0) {
        return NextResponse.json({
          status: 'matched',
          source: 'direct_lookup',
          matches: directMatches
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
          data: cached
        });
      }
    }

    // Stage 3: Semantic Retrieval (skipped when forceLLM=true)
    if (!forceLLM) {
      const vectorMatches = await RetrievalService.findVectorMatches(query || '', language);
      const isLowConfidence = !vectorMatches || vectorMatches.length === 0;

      if (!isLowConfidence) {
        return NextResponse.json({
          status: 'matched',
          source: 'semantic_search',
          matches: vectorMatches
        });
      }
    }


    // Stage 4: Bounded Gemini Synthesis
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Analyze this query for Quranic reflection: "${query}". Respond ONLY with valid JSON in this exact structure: {"reasoning": "string", "selectedAyahIds": [1, 2], "reflectionPrompt": "string"}`,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      });
      
      const responseText = response.text || '{}';
      const parsedData = JSON.parse(responseText);

      // Cache the generated synthesis
      await RetrievalService.setCachedReflection(queryHash, parsedData);

      return NextResponse.json({
        status: 'matched',
        source: 'gemini_synthesis',
        data: parsedData
      });
    } catch (err) {
      console.error('Gemini API Error:', err);
      // Graceful Fallback
      return NextResponse.json({
        status: 'matched',
        source: 'offline_fallback',
        indicator: 'Offline / High Traffic Mode',
        matches: await RetrievalService.findVectorMatches(query || '', language) // fallback matches
      });
    }

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
