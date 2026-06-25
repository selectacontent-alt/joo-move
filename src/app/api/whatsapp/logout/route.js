import { NextResponse } from 'next/server';
import * as whatsappService from '@/lib/whatsappService';

export async function POST() {
  try {
    await whatsappService.logout();
    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
