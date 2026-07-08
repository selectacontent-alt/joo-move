import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { getAdminSession } from '@/lib/adminSession';
import * as whatsappService from '@/lib/whatsappService';
import { repairArabicMojibake } from '@/lib/textEncoding';
import {
  applyWhatsAppTemplate,
  buildMoveRequestTemplateValues,
  DEFAULT_MOVE_REQUEST_ADMIN_TEMPLATE,
  DEFAULT_MOVE_REQUEST_CUSTOMER_TEMPLATE
} from '@/lib/whatsappTemplates';

const cleanPhone = (value) => String(value || '').replace(/\D/g, '');
const parseJson = (value, fallback = []) => { try { return typeof value === 'string' ? JSON.parse(value) : (value ?? fallback); } catch { return fallback; } };

const getPublicOrigin = (request) => {
  const configured = String(process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || '').replace(/\/$/, '');
  if (configured) return configured;
  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
  const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  if (forwardedHost) return `${forwardedProto || 'https'}://${forwardedHost}`;
  return new URL(request.url).origin;
};

const toAbsoluteMediaUrl = (origin, value) => {
  const url = String(value || '').trim();
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
};

async function getArabicServiceNames(pool, slugs) {
  if (!slugs.length) return {};
  const placeholders = slugs.map(() => '?').join(',');
  const [rows] = await pool.query(
    `SELECT s.slug, COALESCE(ar.title, s.slug) AS title
     FROM services s
     LEFT JOIN service_translations ar ON ar.service_id = s.id AND ar.language = 'ar'
     WHERE s.slug IN (${placeholders})`,
    slugs
  );
  return Object.fromEntries(rows.map((row) => [row.slug, row.title]));
}

async function queueNewRequestNotifications(pool, request, savedRequest, services, media) {
  const keys = ['admin_whatsapp', 'wa_template_move_request_customer', 'wa_template_move_request_admin'];
  const [settingRows] = await pool.query(
    `SELECT setting_key, setting_value FROM settings WHERE setting_key IN (${keys.map(() => '?').join(',')})`,
    keys
  );
  const settings = Object.fromEntries(settingRows.map((row) => [row.setting_key, repairArabicMojibake(row.setting_value)]));
  const origin = getPublicOrigin(request);
  const mediaUrls = media.map((item) => toAbsoluteMediaUrl(origin, item.url)).filter(Boolean);
  const serviceNames = await getArabicServiceNames(pool, services);
  const values = buildMoveRequestTemplateValues(savedRequest, { serviceNames, mediaUrls });
  const customerTemplate = settings.wa_template_move_request_customer || DEFAULT_MOVE_REQUEST_CUSTOMER_TEMPLATE;
  const adminTemplate = settings.wa_template_move_request_admin || DEFAULT_MOVE_REQUEST_ADMIN_TEMPLATE;
  const customerNumber = cleanPhone(savedRequest.whatsapp || savedRequest.phone);
  const adminNumber = cleanPhone(settings.admin_whatsapp);

  if (customerNumber) {
    await whatsappService.queueMessage(
      customerNumber,
      applyWhatsAppTemplate(customerTemplate, values),
      null,
      { dedupeKey: `move-request-customer-${savedRequest.id}` }
    );
  }
  if (adminNumber) {
    await whatsappService.queueMessage(
      adminNumber,
      applyWhatsAppTemplate(adminTemplate, values),
      null,
      { dedupeKey: `move-request-admin-${savedRequest.id}` }
    );
  }
}

const shapeRequest = (row) => ({
  ...row,
  origin_elevator: Boolean(row.origin_elevator),
  destination_elevator: Boolean(row.destination_elevator),
  flexible_date: Boolean(row.flexible_date),
  appliances: parseJson(row.appliances),
  services: parseJson(row.services),
  media: parseJson(row.media),
});

export async function GET(request) {
  if (!getAdminSession(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const pool = await getPool();
    const params = new URL(request.url).searchParams;
    const status = params.get('status');
    const query = params.get('q');
    const clauses = [];
    const values = [];
    if (status && status !== 'all') { clauses.push('mr.status = ?'); values.push(status); }
    if (query) {
      clauses.push('(mr.request_number LIKE ? OR mr.customer_name LIKE ? OR mr.phone LIKE ?)');
      values.push(`%${query}%`, `%${query}%`, `%${query}%`);
    }
    const [rows] = await pool.query(
      `SELECT mr.*, CONCAT('[', COALESCE(GROUP_CONCAT(JSON_OBJECT('id', m.id, 'url', m.media_url, 'type', m.media_type)), ''), ']') AS media
       FROM move_requests mr LEFT JOIN move_request_media m ON m.move_request_id = mr.id
       ${clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''}
       GROUP BY mr.id ORDER BY mr.created_at DESC LIMIT 500`, values
    );
    return NextResponse.json(rows.map(shapeRequest));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const phone = cleanPhone(data.phone);
    if (!String(data.customer_name || '').trim() || phone.length < 10 || phone.length > 15) {
      return NextResponse.json({ error: 'الاسم ورقم هاتف صحيح مطلوبان' }, { status: 400 });
    }
    if (!String(data.origin_area || '').trim() || !String(data.destination_area || '').trim()) {
      return NextResponse.json({ error: 'منطقة النقل والوجهة مطلوبتان' }, { status: 400 });
    }
    const services = Array.isArray(data.services) ? data.services : [];
    if (!services.length) return NextResponse.json({ error: 'اختر خدمة واحدة على الأقل' }, { status: 400 });
    const pool = await getPool();
    const [result] = await pool.query(
      `INSERT INTO move_requests
       (customer_name, phone, whatsapp, alternate_phone, move_type,
        origin_governorate, origin_area, origin_address, destination_governorate, destination_area, destination_address,
        origin_floor, destination_floor, origin_elevator, destination_elevator, stair_width, parking_distance,
        rooms, appliances, large_items, services, preferred_date, preferred_period, flexible_date, notes, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        String(data.customer_name).trim(), phone, cleanPhone(data.whatsapp) || phone, cleanPhone(data.alternate_phone) || null,
        data.move_type || 'apartment', data.origin_governorate || null, String(data.origin_area).trim(), data.origin_address || null,
        data.destination_governorate || null, String(data.destination_area).trim(), data.destination_address || null,
        data.origin_floor || null, data.destination_floor || null, data.origin_elevator ? 1 : 0, data.destination_elevator ? 1 : 0,
        data.stair_width || null, data.parking_distance || null, Math.max(1, Number(data.rooms || 1)),
        JSON.stringify(data.appliances || []), data.large_items || null, JSON.stringify(services), data.preferred_date || null,
        data.preferred_period || null, data.flexible_date ? 1 : 0, data.notes || null, data.source || 'website'
      ]
    );
    const requestNumber = `JM-${new Date().getFullYear()}-${String(result.insertId).padStart(6, '0')}`;
    await pool.query('UPDATE move_requests SET request_number = ? WHERE id = ?', [requestNumber, result.insertId]);
    await pool.query(
      'INSERT INTO request_status_history (move_request_id, status, note, changed_by) VALUES (?, ?, ?, ?)',
      [result.insertId, 'received', 'تم إنشاء الطلب من الموقع', 'website']
    );
    const media = Array.isArray(data.media) ? data.media.slice(0, 10) : [];
    for (const item of media) {
      if (!item?.url) continue;
      await pool.query(
        'INSERT INTO move_request_media (move_request_id, media_url, media_type) VALUES (?, ?, ?)',
        [result.insertId, item.url, item.type === 'video' ? 'video' : 'image']
      );
    }
    const [[savedRequest]] = await pool.query('SELECT * FROM move_requests WHERE id = ? LIMIT 1', [result.insertId]);
    try {
      await queueNewRequestNotifications(pool, request, savedRequest, services, media);
    } catch (notificationError) {
      console.error('[MoveRequest] WhatsApp notification queue failed:', notificationError);
    }
    return NextResponse.json({ requestNumber, status: 'received', createdAt: new Date().toISOString() }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
