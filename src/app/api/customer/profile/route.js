import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { cleanCustomerProfile, decodeCustomerToken, toPublicCustomer } from '@/lib/customerAuthToken';

async function getAuthenticatedCustomer(request, pool) {
  const decoded = decodeCustomerToken(request.headers.get('authorization'));
  if (!decoded) return null;

  const [rows] = await pool.query(
    `SELECT id, name, email, phone, alt_phone, governorate, city, address, apartment, landmark, created_at, updated_at
     FROM customers
     WHERE id = ? AND email = ?
     LIMIT 1`,
    [decoded.id, decoded.email]
  );

  return rows[0] || null;
}

export async function GET(request) {
  try {
    const pool = await getPool();
    const customer = await getAuthenticatedCustomer(request, pool);

    if (!customer) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    return NextResponse.json({ customer: toPublicCustomer(customer) });
  } catch (error) {
    console.error('Fetch customer profile error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تحميل بيانات الحساب' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const pool = await getPool();
    const currentCustomer = await getAuthenticatedCustomer(request, pool);

    if (!currentCustomer) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const profile = cleanCustomerProfile(await request.json());

    await pool.query(
      `UPDATE customers
       SET name = COALESCE(NULLIF(?, ''), name),
           phone = NULLIF(?, ''),
           alt_phone = NULLIF(?, ''),
           governorate = NULLIF(?, ''),
           city = NULLIF(?, ''),
           address = NULLIF(?, ''),
           apartment = NULLIF(?, ''),
           landmark = NULLIF(?, '')
       WHERE id = ?`,
      [
        profile.name,
        profile.phone,
        profile.alt_phone,
        profile.governorate,
        profile.city,
        profile.address,
        profile.apartment,
        profile.landmark,
        currentCustomer.id
      ]
    );

    const [rows] = await pool.query(
      `SELECT id, name, email, phone, alt_phone, governorate, city, address, apartment, landmark, created_at, updated_at
       FROM customers
       WHERE id = ?
       LIMIT 1`,
      [currentCustomer.id]
    );

    return NextResponse.json({ customer: toPublicCustomer(rows[0]) });
  } catch (error) {
    console.error('Update customer profile error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء حفظ بيانات الحساب' }, { status: 500 });
  }
}
