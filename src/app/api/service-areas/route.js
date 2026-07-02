import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { getAdminSession } from '@/lib/adminSession';

export async function GET(request) {
  try {
    const pool = await getPool();
    const all = new URL(request.url).searchParams.get('all') === 'true' && getAdminSession(request);
    const [rows] = await pool.query(`SELECT * FROM service_areas ${all ? '' : 'WHERE is_active = 1'} ORDER BY sort_order ASC, id ASC`);
    return NextResponse.json(rows.map((row) => ({ ...row, is_active: Boolean(row.is_active) })));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  if (!getAdminSession(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const data = await request.json();
    if (!data.name_ar) return NextResponse.json({ error: 'Arabic name is required' }, { status: 400 });
    const pool = await getPool();
    const [result] = await pool.query(
      'INSERT INTO service_areas (name_ar, name_en, is_active, sort_order) VALUES (?, ?, ?, ?)',
      [data.name_ar, data.name_en || '', data.is_active === false ? 0 : 1, Number(data.sort_order || 0)]
    );
    return NextResponse.json({ id: result.insertId, success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
