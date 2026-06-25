import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { firstName, lastName, phone, email, message } = await request.json();
    
    if (!firstName || !lastName || !phone || !email || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const pool = await getPool();
    const [result] = await pool.query(
      'INSERT INTO contact_messages (first_name, last_name, phone, email, message) VALUES (?, ?, ?, ?, ?)',
      [firstName, lastName, phone, email, message]
    );
    
    return NextResponse.json({ 
      id: result.insertId, 
      success: true 
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
