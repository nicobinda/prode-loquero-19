// Endpoint para Vercel Cron. Protegido por header secret.
// Configurar en vercel.json: { "crons": [{ "path": "/api/cron/sync", "schedule": "*/10 * * * *" }] }

import { NextResponse, type NextRequest } from 'next/server';
import { syncMatches } from '@/lib/sync';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Vercel envía Authorization: Bearer <CRON_SECRET>
  const auth = req.headers.get('authorization');
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: 'CRON_SECRET no configurado' },
      { status: 500 },
    );
  }
  if (auth !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const result = await syncMatches();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
