import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { getAdminSession } from '@/lib/adminSession';

const parseJson = (value, fallback = []) => {
  try { return typeof value === 'string' ? JSON.parse(value) : (value ?? fallback); } catch { return fallback; }
};

const shapeRows = (rows) => {
  const byId = new Map();
  rows.forEach((row) => {
    if (!byId.has(row.id)) byId.set(row.id, {
      id: row.id, slug: row.slug, icon: row.icon_key, category: row.category,
      cover_media: row.cover_media, is_active: Boolean(row.is_active), sort_order: row.sort_order,
    });
    const service = byId.get(row.id);
    if (row.language) {
      service[`title_${row.language}`] = row.title;
      service[`short_${row.language}`] = row.short_description;
      service[`body_${row.language}`] = row.body;
      service[`bullets_${row.language}`] = parseJson(row.bullets);
    }
  });
  return [...byId.values()];
};

export async function GET(request) {
  try {
    const pool = await getPool();
    const includeInactive = new URL(request.url).searchParams.get('all') === 'true' && getAdminSession(request);
    const [rows] = await pool.query(
      `SELECT s.*, st.language, st.title, st.short_description, st.body, st.bullets
       FROM services s LEFT JOIN service_translations st ON st.service_id = s.id
       ${includeInactive ? '' : 'WHERE s.is_active = 1'}
       ORDER BY s.sort_order ASC, s.id ASC`
    );
    return NextResponse.json(shapeRows(rows));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  if (!getAdminSession(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const data = await request.json();
    if (!data.slug || !data.title_ar || !data.title_en) return NextResponse.json({ error: 'Slug and both titles are required' }, { status: 400 });
    const pool = await getPool();
    const [result] = await pool.query(
      `INSERT INTO services (slug, icon_key, category, cover_media, is_active, sort_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [data.slug, data.icon || 'Truck', data.category || 'home', data.cover_media || null, data.is_active === false ? 0 : 1, Number(data.sort_order || 0)]
    );
    for (const lang of ['ar', 'en']) {
      await pool.query(
        `INSERT INTO service_translations (service_id, language, title, short_description, body, bullets)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [result.insertId, lang, data[`title_${lang}`], data[`short_${lang}`] || '', data[`body_${lang}`] || '', JSON.stringify(data[`bullets_${lang}`] || [])]
      );
    }
    return NextResponse.json({ id: result.insertId, success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
