import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { getAdminSession } from '@/lib/adminSession';
import * as whatsappService from '@/lib/whatsappService';
import { repairArabicMojibake } from '@/lib/textEncoding';
import {
  applyWhatsAppTemplate,
  buildMoveRequestTemplateValues,
  DEFAULT_MOVE_STATUS_TEMPLATES
} from '@/lib/whatsappTemplates';

const cleanPhone = (value) => String(value || '').replace(/\D/g, '');
const parseArray = (value) => { try { return Array.isArray(value) ? value : JSON.parse(value || '[]'); } catch { return []; } };

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

async function queueStatusNotification(pool, moveRequest, status, statusNote) {
  const defaultTemplate = DEFAULT_MOVE_STATUS_TEMPLATES[status];
  if (!defaultTemplate) return;
  const templateKey = `wa_template_move_status_${status}`;
  const [[setting]] = await pool.query(
    'SELECT setting_value FROM settings WHERE setting_key = ? LIMIT 1',
    [templateKey]
  );
  const services = parseArray(moveRequest.services);
  const serviceNames = await getArabicServiceNames(pool, services);
  const values = buildMoveRequestTemplateValues(moveRequest, { serviceNames, statusNote });
  const message = applyWhatsAppTemplate(repairArabicMojibake(setting?.setting_value) || defaultTemplate, values);
  const customerNumber = cleanPhone(moveRequest.whatsapp || moveRequest.phone);
  if (!customerNumber) return;
  await whatsappService.queueMessage(customerNumber, message, null, {
    dedupeKey: `move-status-${moveRequest.id}-${status}`
  });
}

export async function PATCH(request, { params }) {
  const session = getAdminSession(request);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    const data = await request.json();
    const allowed = ['status', 'assigned_employee', 'assigned_team', 'quoted_price', 'internal_notes', 'preferred_date', 'preferred_period'];
    const entries = Object.entries(data).filter(([key]) => allowed.includes(key));
    if (!entries.length) return NextResponse.json({ error: 'No supported fields supplied' }, { status: 400 });
    const pool = await getPool();
    const [[beforeUpdate]] = await pool.query('SELECT id, status FROM move_requests WHERE id = ? LIMIT 1', [id]);
    if (!beforeUpdate) return NextResponse.json({ error: 'Move request not found' }, { status: 404 });
    const fields = entries.map(([key]) => `${key} = ?`).join(', ');
    const values = entries.map(([, value]) => value === '' ? null : value);
    await pool.query(`UPDATE move_requests SET ${fields} WHERE id = ?`, [...values, id]);
    if (data.status) {
      await pool.query(
        'INSERT INTO request_status_history (move_request_id, status, note, changed_by) VALUES (?, ?, ?, ?)',
        [id, data.status, data.status_note || null, session.username]
      );
    }
    if (data.status && data.status !== beforeUpdate.status) {
      try {
        const [[moveRequest]] = await pool.query('SELECT * FROM move_requests WHERE id = ? LIMIT 1', [id]);
        await queueStatusNotification(pool, moveRequest, data.status, data.status_note);
      } catch (notificationError) {
        console.error('[MoveRequest] Status WhatsApp queue failed:', notificationError);
      }
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
