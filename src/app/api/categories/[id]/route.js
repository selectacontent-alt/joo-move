import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const pool = await getPool();
    await pool.query('DELETE FROM category_translations WHERE category_id = ?', [id]);
    await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Category deleted' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
