import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

const normalizePermissions = (permissions) => {
  if (!Array.isArray(permissions)) return null;
  const blockedTabs = new Set(['select_market']);
  const seen = new Set();
  const normalized = permissions
    .map(item => String(item || '').trim())
    .filter(item => item && !blockedTabs.has(item) && !seen.has(item) && seen.add(item));
  return normalized.length ? JSON.stringify(normalized) : null;
};

export async function GET() {
  try {
    const pool = await getPool();
    const [rows] = await pool.query(
      "SELECT id, username, role, permissions, created_at FROM users WHERE username <> 'scmarkting' ORDER BY created_at DESC"
    );
    return NextResponse.json(rows.map(row => ({
      ...row,
      permissions: (() => {
        try {
          const parsed = typeof row.permissions === 'string' ? JSON.parse(row.permissions) : row.permissions;
          return Array.isArray(parsed) ? parsed : [];
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
  try {
    const { username, password, role, permissions } = await request.json();
    const pool = await getPool();
    const passwordHash = await hashPassword(password);
    const permissionsJson = normalizePermissions(permissions);
    await pool.query(
      'INSERT INTO users (username, password, role, permissions) VALUES (?, ?, ?, ?)',
      [username, passwordHash, role, permissionsJson]
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'اسم المستخدم موجود بالفعل' }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
