import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q) {
      return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
    }

    const pool = await getPool();
    
    let queryStr = `
      SELECT id, order_number, created_at, status, total, products, customer_name
      FROM orders 
      WHERE order_number = ? OR id = ? OR customer_phone LIKE ?
      ORDER BY created_at DESC
      LIMIT 10
    `;
    
    const idParam = (!isNaN(q) && q.trim() !== '') ? parseInt(q, 10) : -1;
    const phoneParam = `%${q.trim()}%`;
    
    const [rows] = await pool.query(queryStr, [q.trim(), idParam, phoneParam]);

    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
