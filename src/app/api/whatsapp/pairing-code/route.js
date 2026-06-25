import { NextResponse } from 'next/server';
import { requestPairingCode, getCachedStatus } from '@/lib/whatsappService';

export async function POST(req) {
  try {
    const status = getCachedStatus();
    if (status.status === 'CONNECTED' || status.status === 'AUTHENTICATED') {
      return NextResponse.json({ error: 'WhatsApp is already connected' }, { status: 400 });
    }

    const { phoneNumber } = await req.json();
    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const code = await requestPairingCode(phoneNumber);
    return NextResponse.json({ code });
  } catch (error) {
    console.error('Pairing Code API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate pairing code' }, { status: 500 });
  }
}
