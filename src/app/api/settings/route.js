import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getPool } from '@/lib/db';
import { repairArabicMojibake } from '@/lib/textEncoding';
import {
  DEFAULT_BOOKING_CONFIRMATION_TEMPLATE,
  DEFAULT_FURNITURE_DELIVERED_TEMPLATE,
  DEFAULT_FURNITURE_SHIPPED_TEMPLATE,
  DEFAULT_MOVE_REQUEST_ADMIN_TEMPLATE,
  DEFAULT_MOVE_REQUEST_CUSTOMER_TEMPLATE,
  DEFAULT_MOVE_STATUS_TEMPLATES,
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
    // Treat the former Cairo/Giza-only copy as a legacy default now that Joo Move serves all governorates.
    if (settings.joo_area_ar === 'القاهرة والجيزة والمناطق المحيطة') {
      settings.joo_area_ar = DEFAULT_SITE_SETTINGS.joo_area_ar;
    }
    if (settings.joo_area_en === 'Cairo, Giza and nearby areas') {
      settings.joo_area_en = DEFAULT_SITE_SETTINGS.joo_area_en;
    }
    if (!settings.wa_template_new_order || settings.wa_template_new_order === LEGACY_ORDER_CONFIRMATION_TEMPLATE) {
      settings.wa_template_new_order = DEFAULT_ORDER_CONFIRMATION_TEMPLATE;
    }
    if (!settings.wa_template_booking_order) {
      settings.wa_template_booking_order = DEFAULT_BOOKING_CONFIRMATION_TEMPLATE;
    }
    settings.wa_template_shipped ||= DEFAULT_FURNITURE_SHIPPED_TEMPLATE;
    settings.wa_template_delivered ||= DEFAULT_FURNITURE_DELIVERED_TEMPLATE;
    settings.wa_template_move_request_customer ||= DEFAULT_MOVE_REQUEST_CUSTOMER_TEMPLATE;
    settings.wa_template_move_request_admin ||= DEFAULT_MOVE_REQUEST_ADMIN_TEMPLATE;
    for (const [status, template] of Object.entries(DEFAULT_MOVE_STATUS_TEMPLATES)) {
      settings[`wa_template_move_status_${status}`] ||= template;
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
