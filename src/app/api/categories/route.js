import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const language = (searchParams.get('lang') || '').trim().slice(0, 10);
    const pool = await getPool();
    const [rows] = await pool.query('SELECT * FROM categories');

    if (!language || language === 'ar') {
      return NextResponse.json(rows);
    }

    const [translationRows] = await pool.query(
      'SELECT category_id, name FROM category_translations WHERE language = ?',
      [language]
    );
    const translations = new Map(
      translationRows.map(row => [Number(row.category_id), row.name])
    );

    return NextResponse.json(rows.map(category => ({
      ...category,
      source_name: category.name,
      name: translations.get(Number(category.id)) || category.name
    })));
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name } = await request.json();
    const pool = await getPool();
    const [result] = await pool.query('INSERT INTO categories (name) VALUES (?)', [name]);
    return NextResponse.json({ id: result.insertId, name }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
