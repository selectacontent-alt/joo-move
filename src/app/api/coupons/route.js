import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT * FROM coupons ORDER BY created_at DESC');
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { code, type, discount_value, usage_limit, expiry_date } = await request.json();
    const pool = await getPool();
    const [result] = await pool.query(
      'INSERT INTO coupons (code, type, discount_value, usage_limit, expiry_date) VALUES (?, ?, ?, ?, ?)',
      [code.toUpperCase(), type, discount_value || 0, usage_limit || 0, expiry_date || null]
    );
    return NextResponse.json({ id: result.insertId, message: 'Coupon created successfully' }, { status: 201 });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'كود الكوبون موجود مسبقاً' }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
