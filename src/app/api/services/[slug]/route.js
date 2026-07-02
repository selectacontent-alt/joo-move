import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { getAdminSession } from '@/lib/adminSession';

const parseJson = (value) => { try { return typeof value === 'string' ? JSON.parse(value) : (value || []); } catch { return []; } };

export async function GET(_request, { params }) {
  try {
    const { slug } = await params;
    const pool = await getPool();
    const [rows] = await pool.query(
      `SELECT s.*, st.language, st.title, st.short_description, st.body, st.bullets
       FROM services s LEFT JOIN service_translations st ON st.service_id = s.id
       WHERE s.slug = ? AND s.is_active = 1`, [slug]
    );
    if (!rows.length) return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    const service = { id: rows[0].id, slug: rows[0].slug, icon: rows[0].icon_key, category: rows[0].category, cover_media: rows[0].cover_media };
    rows.forEach((row) => {
      service[`title_${row.language}`] = row.title;
      service[`short_${row.language}`] = row.short_description;
      service[`body_${row.language}`] = row.body;
      service[`bullets_${row.language}`] = parseJson(row.bullets);
    });
    return NextResponse.json(service);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  if (!getAdminSession(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { slug } = await params;
    const data = await request.json();
    const pool = await getPool();
    const [[service]] = await pool.query('SELECT id FROM services WHERE slug = ?', [slug]);
    if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    await pool.query(
      `UPDATE services SET icon_key = ?, category = ?, cover_media = ?, is_active = ?, sort_order = ? WHERE id = ?`,
      [data.icon || 'Truck', data.category || 'home', data.cover_media || null, data.is_active === false ? 0 : 1, Number(data.sort_order || 0), service.id]
    );
    for (const lang of ['ar', 'en']) {
      await pool.query(
        `INSERT INTO service_translations (service_id, language, title, short_description, body, bullets)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE title = VALUES(title), short_description = VALUES(short_description), body = VALUES(body), bullets = VALUES(bullets)`,
        [service.id, lang, data[`title_${lang}`] || '', data[`short_${lang}`] || '', data[`body_${lang}`] || '', JSON.stringify(data[`bullets_${lang}`] || [])]
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
