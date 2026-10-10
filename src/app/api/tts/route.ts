import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'mock_key') return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * Server-side Text-to-Speech API using gemini-3.8-flash-lite-tts.
 * Ensures natural, native pronunciation for Swedish, French, English, and Arabic
 * without relying on client browser language packs which often mispronounce Swedish with English phonetics.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { text?: string; language?: string };
    const { text, language = 'sv' } = body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ error: 'Text is required for TTS synthesis' }, { status: 400 });
    }

    const ai = getAI();
    // If Gemini API is not configured or in mock mode, signal client fallback
    if (!ai) {
      return NextResponse.json({
        fallback: true,
        message: 'Server AI voice synthesis not configured. Use browser synthesis.',
      });
    }

    // Voice style prompt calibrated for each language
    const styleDescription =
      language === 'sv'
        ? 'Lugn, värdig och naturlig svensk uppläsning med genuint svenskt uttal, melodisk prosodi och respektfull ton.'
        : language === 'fr'
        ? 'Lecture calme, digne et naturelle en français avec une prononciation native soignée et respectueuse.'
        : language === 'ar'
        ? 'قراءة هادئة ووقورة باللغة العربية مع مراعاة مخارج الحروف والسكينة.'
        : 'Calm, contemplative, and dignified tone with clear native pronunciation and deliberate pacing.';

    // Generate speech using gemini-3.8-flash-lite-tts
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.trim(),
              speechMetadata: {
                style: styleDescription,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return NextResponse.json({
        fallback: true,
        message: 'No audio data received from synthesis model.',
      });
    }

    return NextResponse.json({
      audio: `data:audio/wav;base64,${base64Audio}`,
      format: 'wav',
      language,
    });
  } catch (err: any) {
    console.warn('[TTS API Warning] Error during AI speech synthesis:', err?.message || err);
    return NextResponse.json({
      fallback: true,
      error: err?.message || 'Speech synthesis failed',
    });
  }
}
