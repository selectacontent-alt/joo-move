import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { title, description, image_url, sort_order } = await request.json();
    const pool = await getPool();
    await pool.query(
      'UPDATE media_gallery SET title = ?, description = ?, image_url = ?, sort_order = ? WHERE id = ?',
      [title, description, image_url, sort_order, id]
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const pool = await getPool();
    await pool.query('DELETE FROM media_gallery WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
