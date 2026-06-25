import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { stock } = await request.json();
    const pool = await getPool();
    await pool.query('UPDATE products SET stock = ? WHERE id = ?', [Number(stock) || 0, id]);
    return NextResponse.json({ message: 'Stock updated successfully' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
