import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const pool = await getPool();
    await pool.query('UPDATE products SET views = COALESCE(views, 0) + 1 WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Product view incremented' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
