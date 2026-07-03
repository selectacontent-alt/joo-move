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

    const result = await requestPairingCode(phoneNumber);
    const { requestDisposition, ...status } = result;
    return NextResponse.json(status, { status: requestDisposition === 'cached' ? 200 : 202 });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    if (statusCode >= 500) console.error('Pairing Code API Error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to start phone pairing',
        retryAfterSeconds: error.retryAfterSeconds || 0
      },
      {
        status: statusCode,
        headers: error.retryAfterSeconds ? { 'Retry-After': String(error.retryAfterSeconds) } : undefined
      }
    );
  }
}
