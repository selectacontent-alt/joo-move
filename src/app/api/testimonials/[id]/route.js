import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const pool = await getPool();
    await pool.query('DELETE FROM testimonials WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
