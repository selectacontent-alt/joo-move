import { NextResponse } from 'next/server';
import * as whatsappService from '@/lib/whatsappService';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const status = await whatsappService.restartLinkingSession();
    return NextResponse.json(status);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
