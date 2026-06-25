import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getPool();
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
    const [result] = await pool.query(
      'INSERT INTO media_gallery (title, description, image_url, sort_order) VALUES (?, ?, ?, ?)',
      [title, description, image_url, sort_order]
    );
    return NextResponse.json({ id: result.insertId, title, description, image_url, sort_order }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
