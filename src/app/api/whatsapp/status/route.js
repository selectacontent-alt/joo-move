import { NextResponse } from 'next/server';
import * as whatsappService from '@/lib/whatsappService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const status = await whatsappService.getStatus();
    return NextResponse.json(status, {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
