/**
 * @file src/app/api/offline-passages/route.ts
 * @description Serves the complete verified Quranic passages, multilingual translations
 * (en, sv, fr, ar), and classical Tafsir citations as a cacheable JSON snapshot for
 * offline Service Worker precaching and offline reading.
 */

import { NextResponse } from 'next/server';
import { QURAN_FIXTURES } from '../../../data/quranFixtures';

export async function GET() {
  return NextResponse.json(
    {
      version: 'v2',
      timestamp: new Date().toISOString(),
      count: QURAN_FIXTURES.length,
      passages: QURAN_FIXTURES,
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    }
  );
}
