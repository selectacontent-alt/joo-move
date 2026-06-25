import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { decodeCustomerToken } from '@/lib/customerAuthToken';

export async function GET(request) {
  try {
    const decoded = decodeCustomerToken(request.headers.get('authorization'));
    if (!decoded) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const pool = await getPool();
    const [customerRows] = await pool.query(
      'SELECT id, phone FROM customers WHERE id = ? AND email = ? LIMIT 1',
      [decoded.id, decoded.email]
    );

    if (customerRows.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const customer = customerRows[0];
    const [orders] = await pool.query(
      `SELECT id, order_number, total, status, created_at
       FROM (
         SELECT id, order_number, total, status, created_at
         FROM orders
         WHERE customer_id = ?
         UNION ALL
         SELECT id, order_number, total, status, created_at
         FROM orders
         WHERE customer_id IS NULL
           AND ? IS NOT NULL
           AND customer_phone = ?
       ) customer_orders
       ORDER BY created_at DESC`,
      [customer.id, customer.phone || null, customer.phone || null]
    );

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
