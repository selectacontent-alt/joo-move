import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(request) {
  try {
    const { items } = await request.json();
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      for (const item of items) {
        if (item.id && item.sort_order !== undefined) {
          await connection.query('UPDATE products SET sort_order = ? WHERE id = ?', [item.sort_order, item.id]);
        }
      }
      await connection.commit();
    } catch (e) {
      await connection.rollback();
      throw e;
    } finally {
      connection.release();
    }
    
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
