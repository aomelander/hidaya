/**
 * @file src/app/api/tafsir/shaarawi/route.ts
 * @description Server-side API endpoint to retrieve Sheikh Muhammad Metwalli Al-Sha'rawi's
 * authentic Tafsir (Quranpedia Book ID: 18) by Surah and Ayah number, and to trigger
 * incremental synchronization if Quranpedia publishes updates/corrections.
 *
 * Security:
 * - Never exposes database or Quranpedia credentials to the browser.
 * - Preserves Sheikh Al-Sha'rawi's Arabic text verbatim without summarization or rewriting.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getShaarawiTafsirBySurahAyah,
  importAndSyncShaarawiTafsir,
  QURANPEDIA_BOOK_ID,
} from '../../../../lib/db/importShaarawiQuranpedia';

/**
 * GET /api/tafsir/shaarawi?surah=7&ayah=199
 * (Also supports `?verseKey=7:199`)
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    let surahNum = Number(searchParams.get('surah') || 0);
    let ayahNum = Number(searchParams.get('ayah') || 0);

    const verseKeyParam = searchParams.get('verseKey') || searchParams.get('id') || '';
    if ((!surahNum || !ayahNum) && verseKeyParam.includes(':')) {
      const [sPart, aPart] = verseKeyParam.split(':');
      surahNum = Number(sPart);
      ayahNum = Number(aPart.split('-')[0]);
    }

    if (!Number.isInteger(surahNum) || surahNum < 1 || surahNum > 114 || !Number.isInteger(ayahNum) || ayahNum < 1) {
      return NextResponse.json(
        {
          error: 'Valid `surah` (1-114) and `ayah` (>= 1) query parameters are required.',
          example: '/api/tafsir/shaarawi?surah=7&ayah=199',
        },
        { status: 400 }
      );
    }

    const record = await getShaarawiTafsirBySurahAyah(surahNum, ayahNum);
    if (!record) {
      return NextResponse.json(
        {
          found: false,
          surah: surahNum,
          ayah: ayahNum,
          verseKey: `${surahNum}:${ayahNum}`,
          bookId: QURANPEDIA_BOOK_ID,
          message: `No Tafsir Al-Sha'rawi (Book 18) record found for ${surahNum}:${ayahNum}.`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      found: true,
      ...record,
    });
  } catch (error) {
    console.error('[API /api/tafsir/shaarawi GET] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve Tafsir Al-Sha\'rawi record.',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tafsir/shaarawi
 * Triggers an idempotent incremental synchronization against Quranpedia's official
 * `tafsir-book-18.json.gz` dump so corrections/updates are applied without duplicating records.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      forceDownload?: boolean;
      purgeFirst?: boolean;
    };

    const stats = await importAndSyncShaarawiTafsir({
      forceDownload: Boolean(body.forceDownload),
      purgeFirst: Boolean(body.purgeFirst),
    });

    return NextResponse.json({
      status: 'synced',
      stats,
    });
  } catch (error) {
    console.error('[API /api/tafsir/shaarawi POST] Sync error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Synchronization failed.',
      },
      { status: 500 }
    );
  }
}
