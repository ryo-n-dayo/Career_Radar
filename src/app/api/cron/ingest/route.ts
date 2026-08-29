import { NextRequest, NextResponse } from 'next/server';

import { runIngest } from '@/features/events/ingest/run';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  }

  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = await runIngest();

  return NextResponse.json({
    ranAt: new Date().toISOString(),
    connectors: results.length,
    results
  });
}
