import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { verifyPassword } from '@/lib/auth';
import { createCustomerToken, toPublicCustomer } from '@/lib/customerAuthToken';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبة' }, { status: 400 });
    }

    const pool = await getPool();

    const [rows] = await pool.query('SELECT * FROM customers WHERE email = ? LIMIT 1', [email]);
    if (rows.length === 0) {
      return NextResponse.json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }, { status: 401 });
    }

    const user = rows[0];
    const { valid: isMatch } = await verifyPassword(password, user.password);

    if (!isMatch) {
      return NextResponse.json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }, { status: 401 });
    }

    const customer = toPublicCustomer(user);

    const token = createCustomerToken(customer);

    return NextResponse.json({ message: 'تم تسجيل الدخول بنجاح', customer, token });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تسجيل الدخول' }, { status: 500 });
  }
}
