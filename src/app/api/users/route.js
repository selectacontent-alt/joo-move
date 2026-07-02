import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { getAdminSession } from '@/lib/adminSession';
import { normalizeAdminPermissions, parseAdminPermissions } from '@/lib/adminPermissions';

const requireAdmin = (request) => getAdminSession(request)?.role === 'admin';

export async function GET(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'غير مصرح بإدارة الحسابات' }, { status: 403 });
  try {
    const pool = await getPool();
    const [rows] = await pool.query(
      "SELECT id, username, role, permissions, created_at FROM users WHERE username <> 'scmarkting' ORDER BY created_at DESC"
    );
    return NextResponse.json(rows.map(row => ({
      ...row,
      permissions: (() => {
        try {
          return parseAdminPermissions(row.permissions);
        } catch {
          return [];
        }
      })()
    })));
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'غير مصرح بإدارة الحسابات' }, { status: 403 });
  try {
    const { username, password, role, permissions } = await request.json();
    const cleanUsername = String(username || '').trim();
    const cleanPassword = String(password || '');
    const cleanRole = role === 'admin' ? 'admin' : 'staff';
    if (cleanUsername.length < 3) return NextResponse.json({ error: 'اسم المستخدم يجب ألا يقل عن 3 أحرف' }, { status: 400 });
    if (cleanPassword.length < 6) return NextResponse.json({ error: 'كلمة المرور يجب ألا تقل عن 6 أحرف' }, { status: 400 });
    const pool = await getPool();
    const passwordHash = await hashPassword(cleanPassword);
    const permissionsJson = cleanRole === 'admin' ? null : JSON.stringify(normalizeAdminPermissions(permissions));
    await pool.query(
      'INSERT INTO users (username, password, role, permissions) VALUES (?, ?, ?, ?)',
      [cleanUsername, passwordHash, cleanRole, permissionsJson]
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'اسم المستخدم موجود بالفعل' }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
