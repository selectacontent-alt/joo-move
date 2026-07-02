import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

const cleanPhone = (value) => String(value || '').replace(/\D/g, '');
const parseJson = (value, fallback = []) => { try { return typeof value === 'string' ? JSON.parse(value) : (value ?? fallback); } catch { return fallback; } };

export async function GET(request) {
  try {
    const params = new URL(request.url).searchParams;
    const requestNumber = String(params.get('requestNumber') || '').trim().toUpperCase();
    const phone = cleanPhone(params.get('phone'));
    if (!requestNumber || phone.length < 10) return NextResponse.json({ error: 'رقم الطلب ورقم الهاتف مطلوبان' }, { status: 400 });
    const pool = await getPool();
    const [[row]] = await pool.query(
      `SELECT id, request_number, customer_name, phone, move_type, origin_area, destination_area,
              services, preferred_date, preferred_period, status, created_at, updated_at
       FROM move_requests WHERE request_number = ? AND REPLACE(REPLACE(REPLACE(phone, ' ', ''), '+', ''), '-', '') = ? LIMIT 1`,
      [requestNumber, phone]
    );
    if (!row) return NextResponse.json({ error: 'لم يتم العثور على طلب مطابق للبيانات' }, { status: 404 });
    const [history] = await pool.query(
      'SELECT status, note, created_at FROM request_status_history WHERE move_request_id = ? ORDER BY created_at ASC, id ASC', [row.id]
    );
    return NextResponse.json({
      requestNumber: row.request_number,
      customerName: row.customer_name,
      moveType: row.move_type,
      originArea: row.origin_area,
      destinationArea: row.destination_area,
      services: parseJson(row.services),
      preferredDate: row.preferred_date,
      preferredPeriod: row.preferred_period,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      history,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
