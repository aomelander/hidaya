import { parseAudioRange } from '../../../../lib/audio/httpRange';
import { NextRequest, NextResponse } from 'next/server';
import { getInternalAyahAudioRecord } from '../../../../lib/audio/ayahAudioServerService';
import { extractZipStoredMember } from '../../../../lib/audio/zipExtractor';

export const dynamic = 'force-dynamic';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Range, Content-Type, Accept',
  'Access-Control-Expose-Headers': 'Content-Range, Content-Length, Accept-Ranges',
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id } = await Promise.resolve(context.params);

  if (!id || !UUID_REGEX.test(id)) {
    return NextResponse.json(
      { error: 'Invalid audio record ID format. Must be a valid UUID.' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  // 1. Fetch internal record safely on server
  const record = await getInternalAyahAudioRecord(id);
  if (!record) {
    return NextResponse.json(
      { error: 'Audio record not found.' },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  try {
    // 2. Extract ZIP_STORED member safely from release archive
    const audioBuffer = await extractZipStoredMember(
      record.archive_url,
      record.archive_member
    );

    const totalLength = audioBuffer.length;
    const rangeHeader = request.headers.get('range');

    // 3. Support HTTP Range requests for seeking in browser players
    const range = parseAudioRange(rangeHeader, totalLength);
    if (range === false) return new Response(null, {
      status: 416,
      headers: { ...CORS_HEADERS, 'Content-Range': `bytes */${totalLength}`, 'Accept-Ranges': 'bytes' },
    });
    if (range) {
      const chunk = audioBuffer.subarray(range.start, range.end + 1);
      return new Response(new Uint8Array(chunk), {
        status: 206,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'audio/mpeg',
          'Content-Length': String(chunk.length),
          'Content-Range': `bytes ${range.start}-${range.end}/${totalLength}`,
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // 4. Return full MP3 stream with Accept-Ranges
    return new Response(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(totalLength),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err: any) {
    console.error(`Error extracting audio member for record ${id}:`, err?.message || err);
    return NextResponse.json(
      { error: 'Failed to extract audio stream from archive.' },
      { status: 502, headers: CORS_HEADERS }
    );
  }
}
