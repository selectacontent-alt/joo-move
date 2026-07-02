import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { getAdminSession } from '@/lib/adminSession';

export async function GET(request) {
  try {
    const pool = await getPool();
    const params = new URL(request.url).searchParams;
    const page = params.get('page') || 'home';
    const all = params.get('all') === 'true' && getAdminSession(request);
    const [rows] = await pool.query(
      `SELECT * FROM faqs WHERE page_slug = ? ${all ? '' : 'AND is_active = 1'} ORDER BY sort_order ASC, id ASC`, [page]
    );
    const uniqueRows = [];
    const seenQuestions = new Set();
    for (const row of rows) {
      const key = `${row.page_slug}:${String(row.question_ar).trim()}`;
      if (seenQuestions.has(key)) continue;
      seenQuestions.add(key);
      uniqueRows.push({ ...row, is_active: Boolean(row.is_active) });
    }
    return NextResponse.json(uniqueRows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  if (!getAdminSession(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const data = await request.json();
    const pool = await getPool();
    const [result] = await pool.query(
      `INSERT INTO faqs (question_ar, answer_ar, question_en, answer_en, page_slug, is_active, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [data.question_ar, data.answer_ar, data.question_en || '', data.answer_en || '', data.page_slug || 'home', data.is_active === false ? 0 : 1, Number(data.sort_order || 0)]
    );
    return NextResponse.json({ id: result.insertId, success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
