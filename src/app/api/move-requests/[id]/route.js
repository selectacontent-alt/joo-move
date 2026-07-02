import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { getAdminSession } from '@/lib/adminSession';

export async function PATCH(request, { params }) {
  const session = getAdminSession(request);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    const data = await request.json();
    const allowed = ['status', 'assigned_employee', 'assigned_team', 'quoted_price', 'internal_notes', 'preferred_date', 'preferred_period'];
    const entries = Object.entries(data).filter(([key]) => allowed.includes(key));
    if (!entries.length) return NextResponse.json({ error: 'No supported fields supplied' }, { status: 400 });
    const pool = await getPool();
    const fields = entries.map(([key]) => `${key} = ?`).join(', ');
    const values = entries.map(([, value]) => value === '' ? null : value);
    await pool.query(`UPDATE move_requests SET ${fields} WHERE id = ?`, [...values, id]);
    if (data.status) {
      await pool.query(
        'INSERT INTO request_status_history (move_request_id, status, note, changed_by) VALUES (?, ?, ?, ?)',
        [id, data.status, data.status_note || null, session.username]
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
