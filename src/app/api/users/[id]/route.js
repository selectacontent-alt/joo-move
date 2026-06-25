import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const pool = await getPool();
    const [rows] = await pool.query('SELECT username FROM users WHERE id = ?', [id]);
    if (rows.length > 0 && rows[0].username === 'admin') {
      return NextResponse.json({ error: 'لا يمكن حذف الحساب الأساسي' }, { status: 403 });
    }
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
