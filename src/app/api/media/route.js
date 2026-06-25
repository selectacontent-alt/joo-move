import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { ensureMediaHomepageColumn } from '@/lib/mediaGallerySchema';

export async function GET() {
  try {
    const pool = await getPool();
    await ensureMediaHomepageColumn(pool);
    const [rows] = await pool.query('SELECT * FROM media_gallery ORDER BY sort_order ASC, created_at DESC');
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { title, description, image_url, sort_order = 0 } = await request.json();
    const pool = await getPool();
    await ensureMediaHomepageColumn(pool);
    const [result] = await pool.query(
      'INSERT INTO media_gallery (title, description, image_url, show_on_homepage, sort_order) VALUES (?, ?, ?, 0, ?)',
      [title, description, image_url, sort_order]
    );
    return NextResponse.json({ id: result.insertId, title, description, image_url, show_on_homepage: 0, sort_order }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
