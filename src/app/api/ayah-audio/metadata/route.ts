import { NextRequest, NextResponse } from 'next/server';
import { lookupAyahAudio, AudioStreamType } from '../../../../lib/audio/ayahAudioServerService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const ayahId = searchParams.get('ayahId') || undefined;
  const surahStr = searchParams.get('surah') || searchParams.get('surahNumber');
  const verseStr = searchParams.get('verse') || searchParams.get('verseNumber') || searchParams.get('ayah');
  const lang = searchParams.get('lang') || searchParams.get('language') || 'en';
  const typeStr = searchParams.get('type') || searchParams.get('audioType') || 'translation';

  const surahNumber = surahStr ? parseInt(surahStr, 10) : undefined;
  let ayahNumber: number | undefined;
  if (verseStr) {
    // If range like "5-6", use the primary (first) verse
    const firstNum = parseInt(verseStr.split('-')[0].trim(), 10);
    if (!isNaN(firstNum)) {
      ayahNumber = firstNum;
    }
  }

  const audioType: AudioStreamType = typeStr === 'tafsir' ? 'tafsir' : 'translation';

  const result = await lookupAyahAudio({
    ayahId,
    surahNumber,
    ayahNumber,
    languageCode: lang,
    audioType,
  });

  return NextResponse.json(result, {
    status: 200,
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
