import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const pool = await getPool();
    await pool.query('DELETE FROM coupons WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Coupon deleted successfully' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
