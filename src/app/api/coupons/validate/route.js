import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function POST(request) {
  try {
    const { code } = await request.json();
    const pool = await getPool();
    const [rows] = await pool.query('SELECT * FROM coupons WHERE code = ?', [code.toUpperCase()]);
    
    if (rows.length === 0) {
      return NextResponse.json({ error: 'كوبون غير صحيح أو غير موجود' }, { status: 404 });
    }

    const coupon = rows[0];

    // Check expiry
    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
      return NextResponse.json({ error: 'عذراً، هذا الكوبون منتهي الصلاحية' }, { status: 400 });
    }

    // Check usage limit
    if (coupon.usage_limit > 0 && coupon.used_count >= coupon.usage_limit) {
      return NextResponse.json({ error: 'عذراً، تم الوصول للحد الأقصى لاستخدام هذا الكوبون' }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      discount_value: coupon.discount_value
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
