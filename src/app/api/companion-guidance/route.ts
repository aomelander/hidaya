import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getResolvedSupabaseConfig() {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const envAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
  const envService = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  let resolvedUrl = 'https://kipsrzozphdgbaqrhiok.supabase.co';
  if (envUrl.startsWith('http://') || envUrl.startsWith('https://')) {
    resolvedUrl = envUrl;
  } else if (envAnon.startsWith('http://') || envAnon.startsWith('https://')) {
    resolvedUrl = envAnon;
  }

  let resolvedKey = envService;
  if (!resolvedKey || resolvedKey.startsWith('http')) {
    resolvedKey =
      !envAnon.startsWith('http') && envAnon
        ? envAnon
        : envUrl && !envUrl.startsWith('http')
        ? envUrl
        : 'mock-key';
  }

  return { url: resolvedUrl, key: resolvedKey };
}

const { url: supabaseUrl, key: supabaseKey } = getResolvedSupabaseConfig();
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const verseId = searchParams.get('verseId') || searchParams.get('id');
    const lang = searchParams.get('lang') || 'en';
    const all = searchParams.get('all') === 'true';

    // 1. Bulk request for all companion fixtures
    if (all) {
      const { data, error } = await supabase
        .from('cached_reflection')
        .select('response_json')
        .eq('query_hash', 'companion_guidance:all_fixtures')
        .maybeSingle();

      if (!error && data?.response_json) {
        return NextResponse.json({
          status: 'success',
          source: 'supabase_db',
          data: data.response_json,
        });
      }
      return NextResponse.json({ status: 'not_found' }, { status: 404 });
    }

    if (!verseId) {
      return NextResponse.json({ error: 'Missing verseId parameter' }, { status: 400 });
    }

    // 2. Single verse query from Supabase
    const { data, error } = await supabase
      .from('cached_reflection')
      .select('response_json')
      .eq('query_hash', `companion_guidance:${verseId}`)
      .maybeSingle();

    if (!error && data?.response_json) {
      const resp = data.response_json as any;
      const localized = resp.languages?.[lang] || resp.languages?.en || resp;
      return NextResponse.json({
        status: 'success',
        source: 'supabase_db',
        verseId,
        language: lang,
        data: localized,
      });
    }

    return NextResponse.json(
      {
        status: 'fallback',
        message: 'Verse companion not yet seeded in database',
      },
      { status: 404 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
