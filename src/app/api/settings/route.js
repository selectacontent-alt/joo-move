import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getPool } from '@/lib/db';
import { repairArabicMojibake } from '@/lib/textEncoding';
import {
  DEFAULT_BOOKING_CONFIRMATION_TEMPLATE,
  DEFAULT_ORDER_CONFIRMATION_TEMPLATE,
  LEGACY_ORDER_CONFIRMATION_TEMPLATE
} from '@/lib/whatsappTemplates';
import { DEFAULT_SITE_SETTINGS } from '@/lib/homeSettings';

export async function GET() {
  try {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT setting_key, setting_value FROM settings');
    const settings = { ...DEFAULT_SITE_SETTINGS };
    rows.forEach(row => {
      settings[row.setting_key] = repairArabicMojibake(row.setting_value);
    });
    if (!settings.wa_template_new_order || settings.wa_template_new_order === LEGACY_ORDER_CONFIRMATION_TEMPLATE) {
      settings.wa_template_new_order = DEFAULT_ORDER_CONFIRMATION_TEMPLATE;
    }
    if (!settings.wa_template_booking_order) {
      settings.wa_template_booking_order = DEFAULT_BOOKING_CONFIRMATION_TEMPLATE;
    }
    return NextResponse.json(settings);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const settings = await request.json();
    const pool = await getPool();
    for (const [key, value] of Object.entries(settings)) {
       await pool.query(
         'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?', 
         [key, value, value]
       );
    }
    return NextResponse.json({ message: 'Settings updated successfully' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
