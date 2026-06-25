import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { repairArabicMojibake } from '@/lib/textEncoding';

export async function GET() {
  try {
    const pool = await getPool();
    const [rows] = await pool.query("SELECT setting_key, setting_value FROM settings WHERE setting_key LIKE 'trans_%'");
    const translations = {};
    rows.forEach(row => {
      const key = row.setting_key.replace('trans_', '');
      try { translations[key] = repairArabicMojibake(JSON.parse(row.setting_value)); }
      catch { translations[key] = repairArabicMojibake(row.setting_value); }
    });
    return NextResponse.json(translations);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const overrides = await request.json();
    const pool = await getPool();
    for (const [key, value] of Object.entries(overrides)) {
      const jsonValue = typeof value === 'object' ? JSON.stringify(value) : value;
      await pool.query(
        "INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?",
        [`trans_${key}`, jsonValue, jsonValue]
      );
    }
    return NextResponse.json({ message: 'Translations updated successfully' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
