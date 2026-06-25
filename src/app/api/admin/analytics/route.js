import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const pool = await getPool();

    // 1. Total Revenue and Order Count
    // We exclude orders that have been cancelled (assuming 'ملغي' means cancelled in Arabic)
    const [orderRows] = await pool.query(
      "SELECT SUM(total) as totalRevenue, COUNT(id) as totalOrders FROM orders WHERE status NOT LIKE '%ملغي%' AND status != 'cancelled'"
    );
    const totalRevenue = orderRows[0]?.totalRevenue || 0;
    const totalOrders = orderRows[0]?.totalOrders || 0;

    // 2. Total Product Views (to act as Total Visits for Conversion Rate)
    const [viewRows] = await pool.query(
      "SELECT SUM(views) as totalViews FROM products"
    );
    const totalViews = viewRows[0]?.totalViews || 0;

    // 3. Calculate Conversion Rate
    let conversionRate = 0;
    if (totalViews > 0) {
      conversionRate = ((totalOrders / totalViews) * 100).toFixed(2);
    } else if (totalOrders > 0) {
      conversionRate = 100; // Edge case: if there are orders but no views tracked yet
    }

    return NextResponse.json({
      totalRevenue: parseFloat(totalRevenue),
      totalOrders: parseInt(totalOrders),
      conversionRate: parseFloat(conversionRate),
      totalViews: parseInt(totalViews)
    }, { status: 200 });

  } catch (error) {
    console.error('Analytics Fetch Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
