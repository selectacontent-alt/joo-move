import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

// Auto-create column if it doesn't exist
async function ensureColumn(pool) {
  try {
    await pool.query(
      `ALTER TABLE media_gallery ADD COLUMN IF NOT EXISTS show_on_homepage TINYINT(1) NOT NULL DEFAULT 0`
    );
  } catch (e) {
    // Column may already exist — ignore
  }
}

// GET /api/media/homepage — returns only items marked show_on_homepage = 1
export async function GET() {
  try {
    const pool = await getPool();
    await ensureColumn(pool);
    const [rows] = await pool.query(
      'SELECT * FROM media_gallery WHERE show_on_homepage = 1 ORDER BY sort_order ASC, created_at DESC'
    );
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/media/homepage  { id, show_on_homepage: 0|1 }
export async function PATCH(request) {
  try {
    const { id, show_on_homepage } = await request.json();
    const pool = await getPool();
    await ensureColumn(pool);
    await pool.query(
      'UPDATE media_gallery SET show_on_homepage = ? WHERE id = ?',
      [show_on_homepage ? 1 : 0, id]
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
