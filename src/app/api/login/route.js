import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/auth';

const parsePermissions = (permissions) => {
  try {
    const parsed = typeof permissions === 'string' ? JSON.parse(permissions) : permissions;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    const pool = await getPool();
    const [rows] = await pool.query(
      'SELECT id, username, password, role, permissions FROM users WHERE username = ?',
      [username]
    );

    if (rows.length > 0) {
      const user = rows[0];
      const passwordCheck = await verifyPassword(password, user.password);

      if (!passwordCheck.valid) {
        return NextResponse.json({ success: false, error: 'Invalid username or password' }, { status: 401 });
      }

      if (passwordCheck.needsRehash) {
        await pool.query('UPDATE users SET password = ? WHERE id = ?', [await hashPassword(password), user.id]);
      }

      return NextResponse.json({
        success: true,
        user: { id: user.id, username: user.username, role: user.role, permissions: parsePermissions(user.permissions) }
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
