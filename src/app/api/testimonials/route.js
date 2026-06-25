import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT * FROM testimonials ORDER BY created_at DESC');
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { image_url } = await request.json();
    const pool = await getPool();
    const [result] = await pool.query('INSERT INTO testimonials (image_url) VALUES (?)', [image_url]);
    return NextResponse.json({ id: result.insertId, image_url }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
