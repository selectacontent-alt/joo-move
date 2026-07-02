import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT * FROM testimonials WHERE is_active = 1 ORDER BY sort_order ASC, created_at DESC');
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { image_url, name_ar, name_en, text_ar, text_en, rating = 5, is_active = true, sort_order = 0 } = await request.json();
    const pool = await getPool();
    const [result] = await pool.query(
      `INSERT INTO testimonials (image_url, name_ar, name_en, text_ar, text_en, rating, is_active, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [image_url || '/joo-logo.png', name_ar || '', name_en || '', text_ar || '', text_en || '', Math.min(5, Math.max(1, Number(rating))), is_active ? 1 : 0, Number(sort_order || 0)]
    );
    return NextResponse.json({ id: result.insertId, image_url: image_url || '/joo-logo.png' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
