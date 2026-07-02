import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

const cleanPhone = (value) => String(value || '').replace(/\D/g, '');
const parseJson = (value, fallback = []) => { try { return typeof value === 'string' ? JSON.parse(value) : (value ?? fallback); } catch { return fallback; } };

const getPhoneVariants = (value) => {
  const phone = cleanPhone(value);
  const variants = new Set(phone ? [phone] : []);

  if (/^01[0125]\d{8}$/.test(phone)) variants.add(`2${phone}`);
  if (/^201[0125]\d{8}$/.test(phone)) variants.add(phone.slice(2));
  if (/^1[0125]\d{8}$/.test(phone)) {
    variants.add(`0${phone}`);
    variants.add(`20${phone}`);
  }

  return [...variants];
};

export async function GET(request) {
  try {
    const params = new URL(request.url).searchParams;
    const requestNumber = String(params.get('requestNumber') || '').trim().toUpperCase();
    const phone = cleanPhone(params.get('phone'));
    if (!requestNumber && !phone) return NextResponse.json({ error: 'اكتب رقم الطلب أو رقم الهاتف' }, { status: 400 });
    if (phone && phone.length < 10) return NextResponse.json({ error: 'رقم الهاتف غير صحيح' }, { status: 400 });

    const where = [];
    const values = [];

    if (requestNumber) {
      where.push('request_number = ?');
      values.push(requestNumber);
    }

    if (phone) {
      const phoneVariants = getPhoneVariants(phone);
      const placeholders = phoneVariants.map(() => '?').join(', ');
      const normalizeColumn = (column) => `REPLACE(REPLACE(REPLACE(${column}, ' ', ''), '+', ''), '-', '')`;
      where.push(`(${normalizeColumn('phone')} IN (${placeholders}) OR ${normalizeColumn('whatsapp')} IN (${placeholders}) OR ${normalizeColumn('alternate_phone')} IN (${placeholders}))`);
      values.push(...phoneVariants, ...phoneVariants, ...phoneVariants);
    }

    const pool = await getPool();
    const [[row]] = await pool.query(
      `SELECT id, request_number, customer_name, phone, move_type, origin_area, destination_area,
              services, preferred_date, preferred_period, status, created_at, updated_at
       FROM move_requests
       WHERE ${where.join(' AND ')}
       ORDER BY created_at DESC, id DESC
       LIMIT 1`,
      values
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
