import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { createCustomerToken, toPublicCustomer } from '@/lib/customerAuthToken';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'الاسم، البريد الإلكتروني وكلمة المرور مطلوبة' }, { status: 400 });
    }

    const pool = await getPool();

    // Check if email already exists
    const [existing] = await pool.query('SELECT id FROM customers WHERE email = ?', [email]);
    if (existing.length > 0) {
      return NextResponse.json({ error: 'البريد الإلكتروني مسجل بالفعل' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const [result] = await pool.query(
      'INSERT INTO customers (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    const customer = toPublicCustomer({
      id: result.insertId,
      name,
      email
    });

    const token = createCustomerToken(customer);

    return NextResponse.json({ message: 'تم التسجيل بنجاح', customer, token });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء التسجيل' }, { status: 500 });
  }
}
