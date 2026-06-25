import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { ensureMediaHomepageColumn } from '@/lib/mediaGallerySchema';

export async function GET() {
  try {
    const pool = await getPool();
    await ensureMediaHomepageColumn(pool);
    const [rows] = await pool.query(
      'SELECT * FROM media_gallery WHERE show_on_homepage = 1 ORDER BY sort_order ASC, created_at DESC'
    );
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { id, show_on_homepage } = await request.json();
    const pool = await getPool();
    await ensureMediaHomepageColumn(pool);
    const [result] = await pool.query(
      'UPDATE media_gallery SET show_on_homepage = ? WHERE id = ?',
      [show_on_homepage ? 1 : 0, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Media item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, id, show_on_homepage: show_on_homepage ? 1 : 0 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
