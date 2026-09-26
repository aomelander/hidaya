import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'hidaya-api',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      // Ensure we don't expose any sensitive tokens, just check if they are configured
      geminiConfigured: !!process.env.GEMINI_API_KEY,
    },
    { status: 200 }
  );
}
