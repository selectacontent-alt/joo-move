import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    
    const pool = await getPool();
    await pool.query(
      'UPDATE contact_messages SET is_read = 1 WHERE id = ?',
      [id]
    );
    
    return NextResponse.json({ success: true, message: 'Message marked as read' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    const pool = await getPool();
    await pool.query('DELETE FROM contact_messages WHERE id = ?', [id]);
    
    return NextResponse.json({ success: true, message: 'Message deleted' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
