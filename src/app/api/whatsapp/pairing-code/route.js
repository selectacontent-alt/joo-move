import { NextResponse } from 'next/server';
import { requestPairingCode } from '@/lib/whatsappService';
import { canAccessAdminPage } from '@/lib/adminSession';

export async function POST(req) {
  if (!canAccessAdminPage(req, 'whatsapp')) {
    return NextResponse.json({ error: 'غير مصرح بإدارة واتساب' }, { status: 403 });
  }
  try {
    const { phoneNumber } = await req.json();
    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const status = await requestPairingCode(phoneNumber);
    return NextResponse.json(status, { status: 202 });
  } catch (error) {
    console.error('Pairing Code API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start phone pairing' },
      { status: error.statusCode || 500 }
    );
  }
}
