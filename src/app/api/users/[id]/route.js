import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { getAdminSession } from '@/lib/adminSession';
import { normalizeAdminPermissions } from '@/lib/adminPermissions';

const requireAdmin = (request) => {
  const session = getAdminSession(request);
  return session?.role === 'admin' ? session : null;
};

export async function PATCH(request, { params }) {
  const session = requireAdmin(request);
  if (!session) return NextResponse.json({ error: 'غير مصرح بإدارة الحسابات' }, { status: 403 });
  try {
    const { id } = await params;
    const data = await request.json();
    const pool = await getPool();
    const [[current]] = await pool.query('SELECT id, username, role FROM users WHERE id = ? LIMIT 1', [id]);
    if (!current) return NextResponse.json({ error: 'الحساب غير موجود' }, { status: 404 });

    const username = String(data.username || '').trim();
    const role = data.role === 'admin' ? 'admin' : 'staff';
    const password = String(data.password || '');
    if (username.length < 3) return NextResponse.json({ error: 'اسم المستخدم يجب ألا يقل عن 3 أحرف' }, { status: 400 });
    if (Number(id) === Number(session.id) && role !== 'admin') {
      return NextResponse.json({ error: 'لا يمكنك إزالة صلاحية المدير من حسابك الحالي' }, { status: 400 });
    }

    const fields = ['username = ?', 'role = ?', 'permissions = ?'];
    const values = [username, role, role === 'admin' ? null : JSON.stringify(normalizeAdminPermissions(data.permissions))];
    if (password) {
      if (password.length < 6) return NextResponse.json({ error: 'كلمة المرور يجب ألا تقل عن 6 أحرف' }, { status: 400 });
      fields.push('password = ?');
      values.push(await hashPassword(password));
    }
    values.push(id);
    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return NextResponse.json({ error: 'اسم المستخدم موجود بالفعل' }, { status: 400 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const session = requireAdmin(request);
  if (!session) return NextResponse.json({ error: 'غير مصرح بإدارة الحسابات' }, { status: 403 });
  try {
    const { id } = await params;
    if (Number(id) === Number(session.id)) return NextResponse.json({ error: 'لا يمكنك حذف حسابك الحالي' }, { status: 400 });
    const pool = await getPool();
    const [[account]] = await pool.query('SELECT username, role FROM users WHERE id = ? LIMIT 1', [id]);
    if (!account) return NextResponse.json({ error: 'الحساب غير موجود' }, { status: 404 });
    if (account.username === 'scmarkting') return NextResponse.json({ error: 'لا يمكن حذف الحساب الأساسي' }, { status: 403 });
    if (account.role === 'admin') {
      const [[count]] = await pool.query("SELECT COUNT(*) AS total FROM users WHERE role = 'admin'");
      if (Number(count.total) <= 1) return NextResponse.json({ error: 'يجب الاحتفاظ بحساب مدير واحد على الأقل' }, { status: 400 });
    }
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
