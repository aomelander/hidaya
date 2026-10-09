import { NextRequest, NextResponse } from 'next/server';
import { getInternalAyahAudioRecord } from '../../../../lib/audio/ayahAudioServerService';
import { extractZipStoredMember } from '../../../../lib/audio/zipExtractor';

export const dynamic = 'force-dynamic';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id } = await Promise.resolve(context.params);

  if (!id || !UUID_REGEX.test(id)) {
    return NextResponse.json(
      { error: 'Invalid audio record ID format. Must be a valid UUID.' },
      { status: 400 }
    );
  }

  // 1. Fetch internal record safely on server
  const record = await getInternalAyahAudioRecord(id);
  if (!record) {
    return NextResponse.json(
      { error: 'Audio record not found.' },
      { status: 404 }
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
    if (rangeHeader && rangeHeader.startsWith('bytes=')) {
      const parts = rangeHeader.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : totalLength - 1;

      if (!isNaN(start) && start >= 0 && start < totalLength && end >= start) {
        const safeEnd = Math.min(end, totalLength - 1);
        const chunk = audioBuffer.subarray(start, safeEnd + 1);

        return new Response(new Uint8Array(chunk), {
          status: 206,
          headers: {
            'Content-Type': 'audio/mpeg',
            'Content-Length': String(chunk.length),
            'Content-Range': `bytes ${start}-${safeEnd}/${totalLength}`,
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      }
    }

    // 4. Return full MP3 stream with Accept-Ranges
    return new Response(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(totalLength),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err: any) {
    console.error(`Error extracting audio member for record ${id}:`, err?.message || err);
    return NextResponse.json(
      { error: 'Failed to extract audio stream from archive.' },
      { status: 502 }
    );
  }
}
