import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function POST(request) {
  try {
    const { items } = await request.json(); // Array of { id, sort_order }
    const pool = await getPool();
    
    // Using a transaction for bulk update is safer, but running simple sequential updates works fine here
    for (const item of items) {
      await pool.query('UPDATE media_gallery SET sort_order = ? WHERE id = ?', [item.sort_order, item.id]);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
