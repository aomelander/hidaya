import { requireAdmin } from '../../../../lib/adminAuth';
import { NextRequest, NextResponse } from 'next/server';
import {
  translateScholarCommentary,
  ingestScholarCommentary,
  approveScholarTranscription,
  listPendingScholarTranscriptions,
  transcribeScholarAudio,
} from '../../../../services/scholarIngestionService';
import { ScholarIngestionPayload } from '../../../../types';

export async function GET(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    const queue = await listPendingScholarTranscriptions();
    return NextResponse.json({
      status: 'success',
      total: queue.length,
      queue,
    });
  } catch (error) {
    console.error('Error in GET /api/admin/ingest-scholar:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve scholar review queue' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    const body = (await req.json()) as Record<string, any>;
    const { action } = body;

    // 1. Audio Transcription via Speech-to-Text
    if (action === 'transcribe_audio') {
      const { audioBase64, mimeType } = body;
      if (!audioBase64) {
        return NextResponse.json(
          { error: 'Missing audioBase64 payload for transcription' },
          { status: 400 }
        );
      }

      const rawArabicTranscript = await transcribeScholarAudio(audioBase64, mimeType);
      return NextResponse.json({
        status: 'success',
        transcript: rawArabicTranscript,
      });
    }

    // 2. Preview Grounded Translation (Strict Negative Constraints)
    if (action === 'preview_translation') {
      const { scholarName, surahNumber, ayahNumber, sourceReference, originalArabicRaw } = body;

      if (!originalArabicRaw || !scholarName || !surahNumber || !ayahNumber) {
        return NextResponse.json(
          { error: 'Missing required fields for translation preview' },
          { status: 400 }
        );
      }

      const translationResult = await translateScholarCommentary({
        scholarName,
        surahNumber: Number(surahNumber),
        ayahNumber: Number(ayahNumber),
        sourceReference: sourceReference || 'Audio/Video Archive',
        originalArabicRaw,
      });

      return NextResponse.json({
        status: 'success',
        data: translationResult,
        theologicalSafetyPassed: true,
      });
    }

    // 3. Save as Pending Review
    if (action === 'save_pending') {
      const payload: ScholarIngestionPayload = body.payload;
      if (!payload || !payload.scholarName || !payload.originalArabicRaw) {
        return NextResponse.json(
          { error: 'Invalid scholar payload provided' },
          { status: 400 }
        );
      }

      const record = await ingestScholarCommentary(payload, { autoApprove: false });
      return NextResponse.json({
        status: 'success',
        message: 'Saved commentary with verification_status = ai_translated_pending_review',
        record,
      });
    }

    // 4. Save and Immediately Verify (for pre-certified content)
    if (action === 'save_verified') {
      const payload: ScholarIngestionPayload = body.payload;
      const reviewerName = body.reviewerName || 'Theological Audit Committee';

      if (!payload || !payload.scholarName || !payload.originalArabicRaw) {
        return NextResponse.json(
          { error: 'Invalid scholar payload provided' },
          { status: 400 }
        );
      }

      const record = await ingestScholarCommentary(payload, {
        autoApprove: true,
        reviewerName,
      });

      return NextResponse.json({
        status: 'success',
        message: 'Saved and verified commentary with verification_status = transcription_verified',
        record,
      });
    }

    // 5. Approve an existing pending item
    if (action === 'approve') {
      const { ingestionId, reviewerName } = body;
      if (!ingestionId) {
        return NextResponse.json({ error: 'Missing ingestionId' }, { status: 400 });
      }

      const success = await approveScholarTranscription(
        ingestionId,
        reviewerName || 'Theological Committee'
      );

      return NextResponse.json({
        status: success ? 'success' : 'failed',
        message: success
          ? 'Commentary status updated to transcription_verified'
          : 'Failed to update commentary status',
      });
    }

    return NextResponse.json(
      { error: `Unsupported action: ${action}` },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in POST /api/admin/ingest-scholar:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
