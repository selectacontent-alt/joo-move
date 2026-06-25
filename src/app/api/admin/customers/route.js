import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getPool();
    const [customers] = await pool.query(`
      SELECT
        c.id,
        c.name,
        c.email,
        c.phone,
        c.alt_phone,
        c.governorate,
        c.city,
        c.address,
        c.apartment,
        c.landmark,
        c.created_at,
        c.updated_at,
        COALESCE(stats.order_count, 0) AS order_count,
        stats.last_order_at
      FROM customers c
      LEFT JOIN (
        SELECT customer_ref, SUM(order_count) AS order_count, MAX(last_order_at) AS last_order_at
        FROM (
          SELECT customer_id AS customer_ref, COUNT(*) AS order_count, MAX(created_at) AS last_order_at
          FROM orders
          WHERE customer_id IS NOT NULL
          GROUP BY customer_id
          UNION ALL
          SELECT c2.id AS customer_ref, COUNT(o.id) AS order_count, MAX(o.created_at) AS last_order_at
          FROM customers c2
          JOIN orders o ON o.customer_id IS NULL AND c2.phone IS NOT NULL AND o.customer_phone = c2.phone
          GROUP BY c2.id
        ) customer_orders
        GROUP BY customer_ref
      ) stats ON stats.customer_ref = c.id
      ORDER BY c.created_at DESC
    `);
    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}
