import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  const keyLoaded = !!(apiKey && apiKey !== 'mock_key' && apiKey.length > 10);

  if (!keyLoaded) {
    return NextResponse.json({
      success: false,
      keyLoaded: false,
      response: 'GEMINI_API_KEY not found or is a placeholder in environment.'
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const result = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: 'Generate a 1-sentence reflection prompt on patience.',
      config: { temperature: 0.4 }
    });

    return NextResponse.json({
      success: true,
      keyLoaded: true,
      response: result.text ?? '(empty response from model)'
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      keyLoaded: true,
      response: `API call failed: ${err?.message ?? String(err)}`
    });
  }
}
