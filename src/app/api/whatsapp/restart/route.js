import { NextResponse } from 'next/server';
import * as whatsappService from '@/lib/whatsappService';
import { canAccessAdminPage } from '@/lib/adminSession';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  if (!canAccessAdminPage(request, 'whatsapp')) {
    return NextResponse.json({ error: 'غير مصرح بإدارة واتساب' }, { status: 403 });
  }
  try {
    const status = await whatsappService.restartLinkingSession();
    return NextResponse.json(status);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
